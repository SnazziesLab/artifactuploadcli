import { config as dotenvConfig } from "dotenv";
import { resolve } from "node:path";
import type { R2Config } from "./types.js";

interface EnvOverrides {
  bucket?: string;
  publicUrl?: string;
}

export function loadEnvConfig(overrides: EnvOverrides): R2Config {
  dotenvConfig({ path: resolve(process.cwd(), ".env") });

  const accountId = process.env["R2_ACCOUNT_ID"];
  const accessKeyId = process.env["R2_ACCESS_KEY_ID"];
  const secretAccessKey = process.env["R2_SECRET_ACCESS_KEY"];
  const bucket = overrides.bucket ?? process.env["R2_BUCKET"];
  const publicUrl = overrides.publicUrl ?? process.env["R2_PUBLIC_URL"];

  const missing: string[] = [];
  if (!accountId) missing.push("R2_ACCOUNT_ID");
  if (!accessKeyId) missing.push("R2_ACCESS_KEY_ID");
  if (!secretAccessKey) missing.push("R2_SECRET_ACCESS_KEY");
  if (!bucket) missing.push("R2_BUCKET (or --bucket flag)");
  if (!publicUrl) missing.push("R2_PUBLIC_URL (or --public-url flag)");

  if (missing.length > 0) {
    console.error("\nMissing required configuration:");
    for (const v of missing) console.error(`  ${v}`);
    console.error("\nAdd these to .env in your working directory or pass as CLI flags.\n");
    process.exit(1);
  }

  return {
    accountId: accountId!,
    accessKeyId: accessKeyId!,
    secretAccessKey: secretAccessKey!,
    bucket: bucket!,
    publicUrl: publicUrl!,
  };
}
