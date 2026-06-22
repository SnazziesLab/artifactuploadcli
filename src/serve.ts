import { networkInterfaces } from "node:os";
import { basename } from "node:path";
import { stat } from "node:fs/promises";
import { detectContentType } from "./upload.js";
import type { ServeOptions, ServeResult } from "./types.js";

const DEFAULT_PORT = 8787;
const MAX_PORT_TRIES = 20;

/** First non-internal IPv4 address — the address other devices on the LAN can reach. */
export function detectLanAddress(): string {
  const ifaces = networkInterfaces();
  for (const addrs of Object.values(ifaces)) {
    if (!addrs) continue;
    for (const addr of addrs) {
      if (addr.family === "IPv4" && !addr.internal) return addr.address;
    }
  }
  return "127.0.0.1";
}

function encodePathSegment(name: string): string {
  return encodeURIComponent(name);
}

/**
 * Serve a single file over HTTP on the LAN until the process is killed.
 * Tries the requested port, then auto-falls back to the next free port.
 * Resolves once the server is listening; the returned server keeps running.
 */
export async function serveFile(options: ServeOptions): Promise<ServeResult> {
  const { filePath } = options;
  const fileName = basename(filePath);
  const contentType = detectContentType(filePath);
  const { size: fileSizeBytes } = await stat(filePath);

  const host = options.host ?? detectLanAddress();
  const startPort = options.port ?? DEFAULT_PORT;
  const file = Bun.file(filePath);

  const routePath = `/${encodePathSegment(fileName)}`;

  const handler = (req: Request): Response => {
    const url = new URL(req.url);
    if (url.pathname !== routePath && url.pathname !== "/") {
      return new Response("Not found", { status: 404 });
    }
    // Bun streams Bun.file with Range/206 support automatically.
    return new Response(file, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  };

  let lastErr: unknown;
  for (let i = 0; i < MAX_PORT_TRIES; i++) {
    const port = startPort + i;
    try {
      const server = Bun.serve({ port, hostname: "0.0.0.0", fetch: handler });
      const boundPort = server.port ?? port;
      const downloadUrl = `http://${host}:${boundPort}${routePath}`;
      return { server, downloadUrl, fileName, fileSizeBytes, port: boundPort };
    } catch (err) {
      lastErr = err;
      const code = (err as { code?: string }).code;
      if (code === "EADDRINUSE") continue;
      throw err;
    }
  }
  throw new Error(
    `Could not bind a port in range ${startPort}-${startPort + MAX_PORT_TRIES - 1}: ${
      lastErr instanceof Error ? lastErr.message : String(lastErr)
    }`,
  );
}
