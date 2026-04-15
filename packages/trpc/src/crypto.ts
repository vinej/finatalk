import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const CURRENT_KEY_VERSION = 1;

const keyCache = new Map<number, Buffer>();

function getKeyForVersion(version: number): Buffer {
  const cached = keyCache.get(version);
  if (cached) return cached;
  const envVar = version === 1 ? "ENCRYPTION_KEY" : `ENCRYPTION_KEY_V${version}`;
  const hex = process.env[envVar];
  if (!hex || hex.length !== 64) {
    throw new Error(`${envVar} must be a 64-char hex string (32 bytes)`);
  }
  const key = Buffer.from(hex, "hex");
  keyCache.set(version, key);
  return key;
}

function getKey(): Buffer {
  return getKeyForVersion(CURRENT_KEY_VERSION);
}

export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `enc:v${CURRENT_KEY_VERSION}:${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decrypt(value: string): string {
  const versionMatch = value.match(/^enc:v(\d+):/);
  if (!versionMatch) return value;
  const version = Number(versionMatch[1]);
  const key = getKeyForVersion(version);
  const rest = value.slice(versionMatch[0].length);
  const [ivHex, tagHex, dataHex] = rest.split(":");
  if (!ivHex || !tagHex || !dataHex) throw new Error("Malformed encrypted value");
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const data = Buffer.from(dataHex, "hex");
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(data).toString("utf8") + decipher.final("utf8");
}
