import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

const searchSchema = z.object({ token: z.string().optional() });

export const Route = createFileRoute("/verify-email")({
  validateSearch: searchSchema,
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { token } = Route.useSearch();
  const { t } = useTranslation();
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">(
    token ? "verifying" : "idle",
  );

  useEffect(() => {
    if (!token) return;
    authClient
      .verifyEmail({ query: { token } })
      .then(({ error }) => setStatus(error ? "error" : "success"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Logo />
        <LanguageSwitcher />
      </header>
      <main className="grid flex-1 place-items-center px-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <CardTitle>
              {status === "success"
                ? t("auth.verified")
                : status === "error"
                  ? t("auth.verifyFailed")
                  : t("auth.verifyEmail")}
            </CardTitle>
            <CardDescription>
              {status === "verifying" ? t("auth.verifying") : t("auth.verifyEmailDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/login" className="text-sm font-medium text-[var(--color-primary)] hover:underline">
              {t("auth.signIn")}
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
