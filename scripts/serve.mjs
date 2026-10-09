import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../site/", import.meta.url));
const port = Number(process.env.PORT || 4173);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

const server = createServer(async (request, response) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Cache-Control", "no-store");
  if (!["GET", "HEAD"].includes(request.method)) {
    response.writeHead(405).end();
    return;
  }
  try {
    const url = new URL(request.url, "http://localhost");
    if (url.pathname === "/healthz") {
      response
        .writeHead(200, { "Content-Type": "text/plain" })
        .end(request.method === "HEAD" ? undefined : "ok\n");
      return;
    }
    const decoded = decodeURIComponent(url.pathname);
    let path = resolve(root, "." + decoded);
    if (
      !(path + sep).startsWith(root) ||
      (decoded !== "/.well-known/security.txt" &&
        decoded.split("/").some((part) => part.startsWith(".")))
    ) {
      response.writeHead(404).end();
      return;
    }
    if ((await stat(path)).isDirectory()) {
      if (!url.pathname.endsWith("/")) {
        response.writeHead(308, { Location: url.pathname + "/" }).end();
        return;
      }
      path = resolve(path, "index.html");
    }
    const data = await readFile(path);
    response.writeHead(200, {
      "Content-Type": types[extname(path)] || "application/octet-stream",
    });
    response.end(request.method === "HEAD" ? undefined : data);
  } catch {
    response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    response.end(
      request.method === "HEAD"
        ? undefined
        : await readFile(resolve(root, "404.html")),
    );
  }
});

server.listen(port, "127.0.0.1", () =>
  console.log(`PubShip website: http://127.0.0.1:${port}`),
);
