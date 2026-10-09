import { chromium } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// Social and Apple assets derive from the supplied final SVG variants.
// Keep the owner-supplied 16 px and 32 px favicon PNGs unchanged.
const assets = new URL("../site/assets/", import.meta.url);
const mark = await readFile(new URL("mark.svg", assets), "utf8");
const markViewBox = mark.match(/viewBox="([^"]+)"/)[1];
const whiteMark = await readFile(new URL("logo.svg", assets), "utf8");
const paths = mark
  .replace(/^[\s\S]*?<svg[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "");
const markAt = (x, y, size) =>
  `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="${markViewBox}" fill="none">${paths}</svg>`;
const headingFont = (
  await readFile(new URL("fonts/bricolage-grotesque.woff2", assets))
).toString("base64");
const bodyFont = (
  await readFile(new URL("fonts/ibm-plex-sans.woff2", assets))
).toString("base64");
// The browser-served SVG uses a same-origin stylesheet under the strict CSP.
// Only the offline renderer embeds font bytes in its temporary document.
const renderFonts = `
@font-face{font-family:PubShipHeading;src:url(data:font/woff2;base64,${headingFont}) format('woff2');font-weight:500 700}
@font-face{font-family:PubShipBody;src:url(data:font/woff2;base64,${bodyFont}) format('woff2');font-weight:400 600}`;
await writeFile(
  new URL("social-fonts.css", assets),
  `@font-face {
  font-family: PubShipHeading;
  src: url("fonts/bricolage-grotesque.woff2") format("woff2");
  font-weight: 500 700;
  font-display: swap;
}
@font-face {
  font-family: PubShipBody;
  src: url("fonts/ibm-plex-sans.woff2") format("woff2");
  font-weight: 400 600;
  font-display: swap;
}
`,
);
const social = `<?xml-stylesheet type="text/css" href="/assets/social-fonts.css"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#f7f4ec"/>
<rect x="1182" width="18" height="630" fill="#3b3ff2"/>
${markAt(72, 58, 48)}
<g fill="#16140f" font-family="PubShipHeading, Arial, sans-serif" font-weight="600">
<text x="132" y="97" font-size="38">PubShip</text>
<text x="80" y="234" font-size="76">Bring your release</text>
<text x="80" y="316" font-size="76">workflow into your</text>
<text x="80" y="398" font-size="76">AI workspace.</text>
</g>
<rect x="80" y="463" width="280" height="66" rx="14" fill="#16140f"/>
<g font-family="PubShipBody, Arial, sans-serif">
<text x="104" y="506" font-size="30" fill="#f7f4ec">$ uvx pubship</text>
<text x="392" y="488" font-size="25" fill="#3a362f">Open-source MCP server for</text>
<text x="392" y="522" font-size="25" fill="#3a362f">Google Play developer workflows</text>
<text x="80" y="581" font-size="22" fill="#57524a">Local-first. Your credentials. AGPL-3.0-only.</text>
<text x="1088" y="92" text-anchor="end" font-size="23" fill="#3a362f">pubship.dev</text>
</g></svg>`;
await writeFile(new URL("social.svg", assets), social + "\n");
const browser = await chromium.launch();
try {
  for (const [name, width, height, svg] of [
    ["social.png", 1200, 630, social],
    ["apple-touch-icon.png", 180, 180, whiteMark],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: 1,
    });
    await page.setContent(
      `<html><head><style>${renderFonts}body{margin:0}svg{display:block}body>svg{width:100vw;height:100vh}</style></head><body>${svg}</body></html>`,
    );
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: fileURLToPath(new URL(name, assets)) });
    await page.close();
    console.log(
      `${name}: ${width}x${height}, derived from ${name === "apple-touch-icon.png" ? "logo.svg" : "mark.svg"}`,
    );
  }
} finally {
  await browser.close();
}
