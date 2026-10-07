import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { format } from "prettier";

// Build-time components. Generated HTML is committed and works without JavaScript.
const pages = [
  "index.html",
  "privacy/index.html",
  "terms/index.html",
  "404.html",
];
export const lockup = (link = true) => {
  const content =
    '<img src="/assets/mark.svg" alt="" width="32" height="32" /><span>PubShip</span>';
  return link
    ? `<a class="brand-lockup" href="/" aria-label="PubShip home">${content}</a>`
    : `<span class="brand-lockup">${content}</span>`;
};
const header = `<header class="header frame">
  ${lockup()}
  <nav aria-label="Main navigation">
    <a href="/#capabilities">Capabilities</a>
    <a href="/#principles">How it works</a>
    <a href="/#start">Get started</a>
  </nav>
  <a class="header-github" href="https://github.com/pubship/pubship">GitHub <span aria-hidden="true">↗</span></a>
</header>`;
const footer = `<footer class="footer frame">
  <div class="footer-identity">
    ${lockup()}
    <nav aria-label="Footer">
      <a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="https://github.com/pubship/pubship">GitHub</a>
    </nav>
  </div>
  <div class="footer-notices">
    <p>PubShip is an independent open-source project and is not affiliated with, endorsed by, or sponsored by Google. Google, Google Play and Android are trademarks of Google LLC.</p>
    <p class="footer-trademark"><span>PubShip™ is a trademark of</span> <a href="https://vorobyov.me" aria-label="DV, personal website">DV</a></p>
  </div>
</footer>`;

for (const name of pages) {
  const path = fileURLToPath(new URL(`../site/${name}`, import.meta.url));
  const input = await readFile(path, "utf8");
  const title = input
    .match(/<title>([\s\S]*?)<\/title>/)[1]
    .trim()
    .replace(/\s+/g, " ");
  const description = input.match(/name="description"\s+content="([^"]+)"/)[1];
  const url = `https://pubship.dev/${name === "index.html" ? "" : name.replace("index.html", "")}`;
  const metadata = `<!-- shared:metadata -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="PubShip" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="https://pubship.dev/assets/social.png" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="PubShip mark. Your next release. A clearer workflow." />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="https://pubship.dev/assets/social.png" />
    <meta name="twitter:image:alt" content="PubShip mark. Your next release. A clearer workflow." />
    <link rel="icon" href="/assets/mark.svg" type="image/svg+xml" sizes="any" />
    <link rel="icon" href="/assets/favicon-32.png" type="image/png" sizes="32x32" />
    <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" sizes="180x180" />
    <!-- /shared:metadata -->`;
  let output = input
    .replace(/<header class="header frame">[\s\S]*?<\/header>/, header)
    .replace(/<footer class="footer frame">[\s\S]*?<\/footer>/, footer)
    .replace(
      /<div class="connection-center">[\s\S]*?<\/div>/,
      `<div class="connection-center">${lockup(false)}<small>LOCAL · STDIO</small></div>`,
    );
  if (output.includes("<!-- shared:metadata -->")) {
    output = output.replace(
      /<!-- shared:metadata -->[\s\S]*?<!-- \/shared:metadata -->/,
      metadata,
    );
  } else {
    output = output
      .replace(/\s*<meta\s+(?:property|name)="(?:og:|twitter:)[\s\S]*?\/>/g, "")
      .replace(/\s*<link rel="(?:icon|apple-touch-icon)"[^>]*\/>/g, "")
      .replace('<link rel="stylesheet"', `${metadata}\n<link rel="stylesheet"`);
  }
  output = await format(output, { filepath: path });
  if (process.argv.includes("--write")) await writeFile(path, output);
  else if (input !== output)
    throw new Error(
      `${name}: shared components are stale; run npm run sync:chrome`,
    );
}
console.log(
  process.argv.includes("--write")
    ? "Shared header, footer, lockup and metadata updated."
    : "Shared components are current.",
);
