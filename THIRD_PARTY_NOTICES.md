# Third-party notices

Original website code, copy and project-created SVG/PNG assets are distributed
under AGPL-3.0-only, subject to the rights of their respective contributors. The
root LICENSE is authoritative. This notice does not relicense third-party work.

## Browser-delivered assets

Original PubShip website code is licensed under AGPL-3.0-only. The following unmodified third-party assets have their own licenses, which are preserved with the distribution:

- **Bricolage Grotesque**, by its upstream project authors: SIL Open Font License 1.1. See [copyright and full license](site/assets/fonts/bricolage-grotesque-OFL.txt).
- **IBM Plex Sans**, by its upstream project authors: SIL Open Font License 1.1. See [copyright and full license](site/assets/fonts/ibm-plex-sans-OFL.txt).
- **IBM Plex Mono**, by its upstream project authors: SIL Open Font License 1.1. See [copyright and full license](site/assets/fonts/ibm-plex-mono-OFL.txt).

The social SVG references the same local fonts through a same-origin stylesheet; the PNG is rendered with those fonts. Font attribution, original download sources and file hashes are maintained in [the font directory](site/assets/fonts/README.md). No visitor font request is made to Google Fonts.

The site bundles no npm runtime dependencies, analytics SDKs or Google logo assets. The visual reference was Aeterna; its content, logo and image assets are not redistributed.

## Development dependencies

The exact lockfile versions currently declare:

| Package              | Version | Declared license |
| -------------------- | ------- | ---------------- |
| @axe-core/playwright | 4.13.0  | MPL-2.0          |
| axe-core             | 4.13.0  | MPL-2.0          |
| @playwright/test     | 1.63.0  | Apache-2.0       |
| playwright           | 1.63.0  | Apache-2.0       |
| playwright-core      | 1.63.0  | Apache-2.0       |
| prettier             | 3.9.9   | MIT              |

Source: package-lock.json and the installed packages' manifests/license files.
These tools run locally or in CI and are not copied into the website image.
Browser binaries and their bundled components have their own notices, supplied
with Playwright's browser distributions; the table is not a browser-binary SBOM.
Update the table when updating the lockfile and retain upstream licenses if
redistributing the tools themselves.

## Runtime container

Dockerfile pins the nginxinc/nginx-unprivileged base image by digest. Nginx and the
Alpine operating-system packages retain their upstream licenses and license files.
The base image is not owned or relicensed by this project. An image-level SBOM and
its redistribution obligations must be reviewed for a published container release;
this development-tool table is not a complete inventory of the base image.

## Names and links

Google, Google Play and Android are trademarks of Google LLC. Other product names
belong to their respective owners. Interoperability references do not imply an
endorsement, partnership or trademark license. See the public terms page and
Google's brand/API policies.
