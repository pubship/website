# Website deployment

Use a GitHub App application for `pubship/website`, branch `main`, Dockerfile build pack, base directory `/`, Dockerfile `/Dockerfile`, exposed port `8080`, domain `https://pubship.dev`. Keep watch paths empty so all main changes deploy. No host port mappings, secrets, database, persistent storage or pre/post commands are needed.

The Dockerfile copies only site content into a pinned unprivileged Nginx image. HTTPS terminates at the hosting proxy; /healthz is the health endpoint. Preserve relative directory redirects, security headers, disabled access logs and the exact /.well-known/security.txt exception to the dotfile block.

The owner changes the resource and DNS only after the publication gate. Validate HTTPS, all pages, assets, security.txt, redirects and 404 behavior after deployment. Roll back by selecting the previously accepted image; do not rewrite source history. Website deployment never deploys an MCP service.
