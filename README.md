# PubShip website

Static website for [pubship.dev](https://pubship.dev), with source in `pubship/website`. The MCP implementation is in [pubship/pubship](https://github.com/pubship/pubship).

`@pubship/website` has `private: true` and must never be published to npm. Original code is AGPL-3.0-only, copyright (C) 2026 Denys Vorobyov. See LICENSE, TRADEMARKS.md and CONTRIBUTING.md.

## Develop and verify

Node.js 22+ and npm are required for development, not serving the built site.

```sh
npm ci
npm run dev
npm run check
npm test
```

Install Chromium, Firefox and WebKit with `npx playwright install` if needed. `npm run format` formats source. `npm run assets:social` regenerates the PNG from the original monochrome SVG.

Tests cover responsive overflow, automated accessibility, keyboard tabs, skip links, clipboard success/failure, discovery and security files, missing pages, reduced motion and no-JavaScript use. Browser checks do not replace human screen-reader review.

## Deployment

Keep the website independently deployable: Coolify GitHub App resource, repository `pubship/website`, branch `main`, Dockerfile build pack, base `/`, Dockerfile `/Dockerfile`, domain `https://pubship.dev`, internal port `8080`. Leave host mappings, credentials, persistent storage and pre/post commands empty. Enable main auto-deploy only when the owner switches the resource. See [deployment settings](docs/coolify.md).

Only `site/` is served. The Nginx image runs as UID 101, disables access logs and exposes `/healthz`. The project does not operate a Google-connected service. Never put Google credentials or sign-in flows into this website.

## Maintenance

Preserve accurate availability labels, the footer notices on every page, sitemap, llms.txt and security.txt. Review this site whenever service behavior or release status changes. Publication, merge and deployment are separate events. See [content maintenance](docs/content-maintenance.md).
