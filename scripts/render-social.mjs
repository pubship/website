import { chromium } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// All bitmap brand assets derive from the same original, local SVG mark.
const assets = new URL("../site/assets/", import.meta.url);
const mark = await readFile(new URL("mark.svg", assets), "utf8");
const paths = mark
  .replace(/^[\s\S]*?<svg[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "");
const markAt = (x, y, size) =>
  `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 32 32">${paths}</svg>`;
const social = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#f7f8f5"/>
${markAt(72, 66, 64)}
<g fill="#202826" font-family="Arial, sans-serif">
<text x="144" y="112" font-size="42" font-weight="700">PubShip</text>
<text x="80" y="280" font-size="68" font-weight="700">Your next release.</text>
<text x="80" y="365" font-size="68" font-weight="700">A clearer workflow.</text>
<text x="80" y="450" font-size="28">Open-source MCP tooling for Google Play developer workflows.</text>
<text x="80" y="550" font-size="24">Local-first. Your credentials. AGPL-3.0-only.</text>
</g></svg>`;
await writeFile(new URL("social.svg", assets), social + "\n");
const browser = await chromium.launch();
try {
  for (const [name, width, height, svg] of [
    ["social.png", 1200, 630, social],
    [
      "apple-touch-icon.png",
      180,
      180,
      `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><rect width="180" height="180" fill="#f7f8f5"/>${markAt(26, 26, 128)}</svg>`,
    ],
    [
      "favicon-32.png",
      32,
      32,
      `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="#f7f8f5"/>${markAt(0, 0, 32)}</svg>`,
    ],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: 1,
    });
    await page.setContent(
      `<html><head><style>body{margin:0}svg{display:block}</style></head><body>${svg}</body></html>`,
    );
    await page.screenshot({ path: fileURLToPath(new URL(name, assets)) });
    await page.close();
    console.log(`${name}: ${width}x${height}, derived from mark.svg`);
  }
} finally {
  await browser.close();
}
