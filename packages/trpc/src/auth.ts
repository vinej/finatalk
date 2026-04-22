import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { and, eq, lt, sql } from "drizzle-orm";
import { db, loginAttempt, user, session, account, verification, twoFactor as twoFactorTable } from "@finatalk/db";
import { encrypt, decrypt } from "./crypto";

const authLog = {
  info: (msg: string) => process.stdout.write(JSON.stringify({ level: 30, time: Date.now(), msg: `[auth] ${msg}` }) + "\n"),
  error: (msg: string) => process.stderr.write(JSON.stringify({ level: 50, time: Date.now(), msg: `[auth] ${msg}` }) + "\n"),
};

const _baseAdapter = drizzleAdapter(db, {
  provider: "pg",
  schema: { user, session, account, verification, twoFactor: twoFactorTable },
});

const ENCRYPTED_ADAPTER_FIELDS: Record<string, string[]> = {
  twoFactor: ["secret", "backupCodes"],
  account: ["accessToken", "refreshToken", "idToken"],
};

function encryptAdapterFields(model: string, data: Record<string, unknown>): Record<string, unknown> {
  const fields = ENCRYPTED_ADAPTER_FIELDS[model];
  if (!fields) return data;
  const copy = { ...data };
  for (const field of fields) {
    const v = copy[field];
    if (typeof v === "string" && !v.startsWith("enc:v1:")) {
      copy[field] = encrypt(v);
    }
  }
  return copy;
}

function decryptAdapterFields(model: string, row: Record<string, unknown> | null | undefined) {
  if (!row) return row;
  const fields = ENCRYPTED_ADAPTER_FIELDS[model];
  if (!fields) return row;
  const copy = { ...row };
  for (const field of fields) {
    const v = copy[field];
    if (typeof v === "string" && v.startsWith("enc:v1:")) {
      try { copy[field] = decrypt(v); } catch { /* keep as-is */ }
    }
  }
  return copy;
}

function withCustomAdapter(adapterFactory: typeof _baseAdapter): typeof _baseAdapter {
  // better-auth's adapter types are intentionally loose; we cast to `any` inside
  // the wrapper because TS can't tie our generic encrypt/decrypt passthrough back
  // to the parameterized `DBAdapter<T>` shape under exactOptionalPropertyTypes.
  return ((betterAuthOptions: Parameters<typeof _baseAdapter>[0]) => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const adapter = adapterFactory(betterAuthOptions) as any;
    const origCreate = adapter.create.bind(adapter);
    const origUpdate = adapter.update?.bind(adapter);
    const origFindOne = adapter.findOne.bind(adapter);
    const origFindMany = adapter.findMany.bind(adapter);

    return {
      ...adapter,
      create: async (params: any) => {
        let p = params;
        if (ENCRYPTED_ADAPTER_FIELDS[p.model]) {
          p = { ...p, data: encryptAdapterFields(p.model, p.data) };
        }
        const result = await origCreate(p);
        return decryptAdapterFields(p.model, result);
      },
      update: origUpdate ? async (params: any) => {
        let p = params;
        if (ENCRYPTED_ADAPTER_FIELDS[p.model] && p.update) {
          p = { ...p, update: encryptAdapterFields(p.model, p.update) };
        }
        const result = await origUpdate(p);
        return decryptAdapterFields(p.model, result);
      } : undefined,
      findOne: async (params: any) => {
        let result = await origFindOne(params);
        result = decryptAdapterFields(params.model, result);
        if (!result || !params.join || Object.keys(params.join).length === 0) return result;
        const r = result as Record<string, unknown>;
        for (const joinModel of Object.keys(params.join)) {
          const fkOnParent = `${joinModel}Id`;
          if (fkOnParent in r) {
            const related = await origFindOne({
              model: joinModel,
              where: [{ field: "id", value: r[fkOnParent] as string }],
            });
            r[joinModel] = related ?? null;
          } else {
            const related = await origFindMany({
              model: joinModel,
              where: [{ field: "userId", value: r.id as string }],
            });
            r[joinModel] = (related ?? []).map((item: any) => decryptAdapterFields(joinModel, item));
          }
        }
        return result;
      },
      findMany: async (params: any) => {
        const results = await origFindMany(params);
        if (!Array.isArray(results) || !ENCRYPTED_ADAPTER_FIELDS[params.model]) return results;
        return results.map((row: any) => decryptAdapterFields(params.model, row));
      },
    };
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }) as typeof _baseAdapter;
}


const appUrl = process.env.APP_URL ?? "";
const isProduction = process.env.NODE_ENV === "production"
  || (!appUrl.includes("localhost") && !appUrl.includes("127.0.0.1") && appUrl.length > 0);

const verificationRequired = process.env.EMAIL_VERIFICATION === "on";
const resendApiKey = process.env.RESEND_API_KEY;

// Lazy-import resend only when actually configured.
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!resendApiKey) {
    authLog.info(`[email] ${subject} → ${to.slice(0, 3)}*** (RESEND_API_KEY not set; skipping)`);
    return;
  }
  const { Resend } = await import("resend");
  const resend = new Resend(resendApiKey);
  const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
  const { error } = await resend.emails.send({ from, to, subject, html });
  if (error) authLog.error(`Failed to send email: ${(error as { message?: string }).message ?? String(error)}`);
}

// Per-account login lockout — persisted in Postgres so it survives restarts
// and is shared across server instances.
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000;

// Stale-row sweep (runs at interval; guarded so concurrent workers don't race).
setInterval(() => {
  const cutoff = new Date(Date.now() - LOGIN_LOCKOUT_MS);
  db.delete(loginAttempt)
    .where(and(lt(loginAttempt.updatedAt, cutoff), eq(loginAttempt.count, 0)))
    .catch((err) => authLog.error(`loginAttempt sweep failed: ${String(err)}`));
}, 10 * 60 * 1000).unref();

// Returns true iff the account is currently locked. Fails open on DB errors:
// if the lockout table is unreachable (e.g. migration not yet applied) we log
// and allow login — better-auth still enforces credential verification, and
// blocking legit logins on an infra issue is worse than losing defense-in-depth.
export async function isAccountLocked(email: string): Promise<boolean> {
  try {
    const row = await db.query.loginAttempt.findFirst({
      where: eq(loginAttempt.email, email),
    });
    if (!row) return false;
    return row.lockedUntil != null && row.lockedUntil.getTime() > Date.now();
  } catch (err) {
    authLog.error(`isAccountLocked query failed (fail-open): ${String(err)}`);
    return false;
  }
}

// Back-compat: throws when locked, swallows unrelated DB errors.
export async function checkAccountLockout(email: string): Promise<void> {
  if (await isAccountLocked(email)) {
    throw new Error("Account temporarily locked due to too many failed login attempts. Please try again later.");
  }
}

export async function recordFailedLogin(email: string): Promise<void> {
  const now = new Date();
  try {
    // Upsert: increment count, re-arm lockout when threshold reached.
    await db
      .insert(loginAttempt)
      .values({ email, count: 1, lockedUntil: null, updatedAt: now })
      .onConflictDoUpdate({
        target: loginAttempt.email,
        set: {
          count: sql`${loginAttempt.count} + 1`,
          lockedUntil: sql`CASE WHEN ${loginAttempt.count} + 1 >= ${LOGIN_MAX_ATTEMPTS} THEN ${new Date(Date.now() + LOGIN_LOCKOUT_MS)} ELSE ${loginAttempt.lockedUntil} END`,
          updatedAt: now,
        },
      });
  } catch (err) {
    authLog.error(`recordFailedLogin failed: ${String(err)}`);
  }
}

export async function clearFailedLogins(email: string): Promise<void> {
  try {
    await db.delete(loginAttempt).where(eq(loginAttempt.email, email));
  } catch (err) {
    authLog.error(`clearFailedLogins failed: ${String(err)}`);
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: withCustomAdapter(_baseAdapter),
  session: {
    expiresIn: 60 * 60,
    updateAge: 60 * 5,
    cookieCache: { enabled: true, maxAge: 30 },
  },
  advanced: {
    cookiePrefix: "myapp",
    useSecureCookies: isProduction,
    defaultCookieAttributes: {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax" as const,
      path: "/",
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    password: {
      async hash(password: string) {
        if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
          throw new Error("Password must contain uppercase, lowercase, number, and special character");
        }
        const { hashPassword } = await import("better-auth/crypto");
        return hashPassword(password);
      },
      async verify({ password, hash: storedHash }) {
        const { verifyPassword } = await import("better-auth/crypto");
        return verifyPassword({ password, hash: storedHash });
      },
    },
    requireEmailVerification: verificationRequired,
  },
  emailVerification: {
    sendOnSignUp: verificationRequired,
    autoSignInAfterVerification: true,
    expiresIn: 3600,
    sendVerificationEmail: async ({ user, token }) => {
      const baseAppUrl = process.env.APP_URL ?? "http://localhost:51733";
      const verifyUrl = `${baseAppUrl}/verify-email?token=${token}`;
      await sendEmail(
        user.email,
        "Verify your Finatalk account",
        `<p>Click the link below to verify your account:</p><p><a href="${escapeHtml(verifyUrl)}">Verify Email</a></p>`,
      );
    },
  },
  plugins: [
    twoFactor({
      skipVerificationOnEnable: false,
      otpOptions: {
        async sendOTP({ user, otp }) {
          await sendEmail(
            user.email,
            "Your Finatalk security code",
            `<p>Your one-time verification code is:</p><h2 style="letter-spacing:4px">${otp}</h2><p>Expires in 3 minutes.</p>`,
          );
        },
      },
    }),
  ],
  socialProviders: {},
  trustedOrigins: [
    process.env.APP_URL,
    process.env.BETTER_AUTH_URL,
    ...(process.env.APP_URL ? [process.env.APP_URL.replace("://", "://www.")] : []),
  ].filter((v): v is string => Boolean(v)),
});
