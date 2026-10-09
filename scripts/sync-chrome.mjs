import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { format } from "prettier";

// Build-time components. Generated HTML is committed and works without JavaScript.
const pages = [
  "index.html",
  "get-started/index.html",
  "guides/check-google-play-release/index.html",
  "permissions/index.html",
  "privacy/index.html",
  "terms/index.html",
  "404.html",
];
const pageLabels = {
  "get-started/index.html": "Setup guide",
  "guides/check-google-play-release/index.html": "Release inspection",
  "permissions/index.html": "Permissions",
  "privacy/index.html": "Privacy",
  "terms/index.html": "Terms",
};
const breadcrumbs = (name) =>
  pageLabels[name]
    ? `<!-- shared:breadcrumbs --><nav class="breadcrumbs frame" aria-label="Breadcrumb" itemscope itemtype="https://schema.org/BreadcrumbList"><ol><li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem"><a itemprop="item" href="/"><span itemprop="name">Home</span></a><meta itemprop="position" content="1" /></li><li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem"><span itemprop="name" aria-current="page">${pageLabels[name]}</span><meta itemprop="position" content="2" /></li></ol></nav><!-- /shared:breadcrumbs -->`
    : "<!-- shared:breadcrumbs --><!-- /shared:breadcrumbs -->";
export const lockup = (link = true) => {
  const content =
    '<img src="/assets/mark.svg" alt="" width="32" height="32" /><span>PubShip</span>';
  return link
    ? `<a class="brand-lockup" href="/" aria-label="PubShip home">${content}</a>`
    : `<span class="brand-lockup">${content}</span>`;
};
const header = (name) => `<header class="header frame">
  ${lockup()}
  <nav aria-label="Main navigation">
    <a href="/#workflows">Workflows</a>
    <a href="/get-started/"${name === "get-started/index.html" ? ' aria-current="page"' : ""}>Setup</a>
    <a href="https://github.com/pubship/pubship/tree/main/docs" aria-label="Docs, on GitHub" target="_blank" rel="noopener noreferrer">Docs <span aria-hidden="true">↗</span></a>
    <a class="header-github" href="https://github.com/pubship/pubship" aria-label="GitHub repository" target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a>
  </nav>
</header>`;
const footer = `<div class="footer-surface"><footer class="footer frame">
  <div class="footer-top">
    <div class="footer-intro">${lockup()}<p>Google Play developer workflows in your MCP client. Runs on your computer with your own credentials.</p></div>
    <nav aria-label="Use"><h2>Use</h2><a href="/#workflows">Workflows</a><a href="/get-started/">Setup guide</a><a href="/guides/check-google-play-release/">Release guide</a><a href="/permissions/">Permissions</a></nav>
    <nav aria-label="Project"><h2>Project</h2><a href="https://github.com/pubship/pubship" target="_blank" rel="noopener noreferrer">GitHub ↗</a><a href="https://github.com/pubship/pubship/releases" target="_blank" rel="noopener noreferrer">Releases ↗</a><a href="https://pypi.org/project/pubship/" target="_blank" rel="noopener noreferrer">PyPI ↗</a><a href="https://github.com/pubship/pubship/issues/new/choose" target="_blank" rel="noopener noreferrer">Report an issue ↗</a></nav>
    <nav aria-label="Legal"><h2>Legal</h2><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="https://github.com/pubship/pubship/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">AGPL-3.0-only ↗</a></nav>
  </div>
  <div class="footer-notices">
    <p>PubShip is an independent open-source project and is not affiliated with, endorsed by, or sponsored by Google. Google, Google Play and Android are trademarks of Google LLC.</p>
    <p class="footer-trademark"><span>PubShip™ is a trademark of</span> <span><a href="https://vorobyov.me" aria-label="Denys Vorobyov, personal website" target="_blank" rel="noopener noreferrer">Denys Vorobyov</a>.</span></p>
  </div>
</footer></div>`;

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
    ${name === "404.html" ? "" : '<meta name="robots" content="max-image-preview:large" />'}
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="PubShip" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="https://pubship.dev/assets/social.png" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="PubShip. Bring your release workflow into your AI workspace." />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="https://pubship.dev/assets/social.png" />
    <meta name="twitter:image:alt" content="PubShip. Bring your release workflow into your AI workspace." />
    <link rel="icon" href="/assets/mark.svg" type="image/svg+xml" sizes="any" />
    <link rel="icon" href="/assets/favicon-32.png" type="image/png" sizes="32x32" />
    <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" sizes="180x180" />
    <!-- /shared:metadata -->`;
  let output = input
    // Explicit tab order keeps the skip link reachable with Safari's default
    // keyboard navigation preference, which otherwise skips ordinary links.
    .replace(
      /<a class="skip" href="#main"(?: tabindex="0")?>/,
      '<a class="skip" href="#main" tabindex="0">',
    )
    .replace(/<header class="header frame">[\s\S]*?<\/header>/, header(name))
    .replace(
      /(?:<div class="footer-surface">\s*)?<footer class="footer frame">[\s\S]*?<\/footer>(?:\s*<\/div>)?/,
      footer,
    )
    .replace(
      /<div class="connection-center">[\s\S]*?<\/div>/,
      `<div class="connection-center">${lockup(false)}<small>LOCAL · STDIO</small></div>`,
    );
  if (output.includes("<!-- shared:breadcrumbs -->")) {
    output = output.replace(
      /<!-- shared:breadcrumbs -->[\s\S]*?<!-- \/shared:breadcrumbs -->/,
      breadcrumbs(name),
    );
  } else {
    output = output.replace("</header>", `</header>\n${breadcrumbs(name)}`);
  }
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
// Only real canonical content pages belong in discovery. Do not synthesize
// lastmod dates from build times; unchanged content has not been modified.
const sitemapPath = fileURLToPath(
  new URL("../site/sitemap.xml", import.meta.url),
);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages
  .filter((name) => name !== "404.html")
  .map(
    (name) =>
      `  <url><loc>https://pubship.dev/${name === "index.html" ? "" : name.replace("index.html", "")}</loc></url>`,
  )
  .join("\n")}\n</urlset>\n`;
if (process.argv.includes("--write")) await writeFile(sitemapPath, sitemap);
else if ((await readFile(sitemapPath, "utf8")) !== sitemap)
  throw new Error(
    "sitemap.xml: canonical pages are stale; run npm run sync:chrome",
  );
console.log(
  process.argv.includes("--write")
    ? "Shared header, footer, lockup and metadata updated."
    : "Shared components are current.",
);
