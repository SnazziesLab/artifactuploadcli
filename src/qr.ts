import qrcode from "qrcode-terminal";
import type { UploadResult, ServeResult } from "./types.js";

export function printResult(result: UploadResult, showQr: boolean): void {
  const sizeMb = (result.fileSizeBytes / 1024 / 1024).toFixed(1);

  console.log("\n" + "═".repeat(52));
  console.log("  Upload complete");
  console.log(`  File:  ${result.remoteName}`);
  console.log(`  Size:  ${sizeMb}MB`);
  console.log(`  URL:   ${result.downloadUrl}`);
  console.log("═".repeat(52));

  if (showQr) {
    console.log("\nScan to download:\n");
    qrcode.generate(result.downloadUrl, { small: true });
  }

  console.log(`\n${result.downloadUrl}\n`);
}

export function printServeInfo(result: ServeResult, showQr: boolean): void {
  const sizeMb = (result.fileSizeBytes / 1024 / 1024).toFixed(1);

  console.log("\n" + "═".repeat(52));
  console.log("  Serving on local network");
  console.log(`  File:  ${result.fileName}`);
  console.log(`  Size:  ${sizeMb}MB`);
  console.log(`  Port:  ${result.port}`);
  console.log(`  URL:   ${result.downloadUrl}`);
  console.log("═".repeat(52));

  if (showQr) {
    console.log("\nScan to download (same Wi-Fi/LAN):\n");
    qrcode.generate(result.downloadUrl, { small: true });
  }

  console.log(`\n${result.downloadUrl}`);
  console.log("\nServer running. Press Ctrl+C to stop.\n");
}
