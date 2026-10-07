import { chromium } from "@playwright/test";
import { fileURLToPath } from "node:url";

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
await page.goto(new URL("../site/assets/social.svg", import.meta.url).href);
await page.screenshot({
  path: fileURLToPath(new URL("../site/assets/social.png", import.meta.url)),
});
await browser.close();
