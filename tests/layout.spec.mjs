import { test, expect } from "@playwright/test";

const widths = [320, 375, 768, 1024, 1280, 1440, 1920];
const paths = ["/", "/privacy/", "/terms/"];

for (const width of widths) {
  test(`all page layouts align without overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1080 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const path of paths) {
      await page.goto(path);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        path,
      ).toBe(true);
      const orphanHeadings = await page
        .locator("h1, h2, h3")
        .evaluateAll((nodes) =>
          nodes.flatMap((node) => {
            const lines = new Map();
            const walker = document.createTreeWalker(
              node,
              NodeFilter.SHOW_TEXT,
            );
            while (walker.nextNode()) {
              const text = walker.currentNode;
              for (const word of text.textContent.matchAll(/\S+/g)) {
                const range = document.createRange();
                range.setStart(text, word.index);
                range.setEnd(text, word.index + word[0].length);
                const top = Math.round(range.getBoundingClientRect().top);
                lines.set(top, (lines.get(top) || 0) + 1);
              }
            }
            const counts = [...lines.values()];
            return counts.length > 1 && counts.at(-1) === 1
              ? [node.textContent.trim()]
              : [];
          }),
        );
      expect(orphanHeadings, `${path} single-word heading endings`).toEqual([]);
      const header = await page.locator("header.frame").boundingBox();
      const footer = await page.locator("footer.frame").boundingBox();
      const content = await page
        .locator(path === "/" ? ".hero.frame" : "main.frame")
        .boundingBox();
      expect(Math.abs(header.x - footer.x), path).toBeLessThan(1);
      expect(Math.abs(header.x - content.x), path).toBeLessThan(1);
      expect(Math.abs(header.width - footer.width), path).toBeLessThan(1);
      const links = await page
        .locator("footer nav a")
        .evaluateAll((nodes) =>
          nodes.map((node) => node.getBoundingClientRect().top),
        );
      expect(Math.max(...links) - Math.min(...links), path).toBeLessThan(1);
      if (width >= 1024) {
        const identity = await page.locator(".footer-identity").boundingBox();
        const legal = await page.locator(".footer-notices").boundingBox();
        expect(Math.abs(identity.y - legal.y), path).toBeLessThan(1);
        expect(legal.x).toBeGreaterThan(identity.x + identity.width);
      }
      // Test every visible navigation/control target, not only CSS declarations.
      const small = await page.locator("a, button").evaluateAll((nodes) =>
        nodes
          .filter(
            (node) =>
              node.getClientRects().length &&
              getComputedStyle(node).visibility !== "hidden" &&
              !node.classList.contains("skip"),
          )
          .map((node) => ({
            text: node.textContent.trim(),
            rect: node.getBoundingClientRect(),
          }))
          .filter(({ rect }) => rect.width < 44 || rect.height < 44)
          .map(({ text }) => text),
      );
      expect(small, `${path} touch targets`).toEqual([]);
      if (width < 480) await expect(page.locator("header nav")).toBeHidden();
      else await expect(page.locator("header nav")).toBeVisible();
    }
  });
}

test("header navigation and brand lockup are shared on every page", async ({
  page,
}) => {
  let expected;
  for (const path of [...paths, "/404.html"]) {
    await page.goto(path);
    const nav = await page
      .locator("header nav a")
      .evaluateAll((nodes) =>
        nodes.map((node) => [
          node.textContent.trim(),
          node.getAttribute("href"),
        ]),
      );
    expected ??= nav;
    expect(nav).toEqual(expected);
    expect(nav).toEqual([
      ["Capabilities", "/#capabilities"],
      ["How it works", "/#principles"],
      ["Get started", "/#start"],
    ]);
    expect(await page.locator("header .brand-lockup").innerHTML()).toBe(
      await page.locator("footer .brand-lockup").innerHTML(),
    );
  }
});

test("mobile connection diagram preserves labels and vertical connectors", async ({
  page,
}) => {
  for (const width of [320, 375, 599]) {
    await page.setViewportSize({ width, height: 1080 });
    await page.goto("/");
    const cards = await page
      .locator(".connection > :not(.connection-line)")
      .evaluateAll((nodes) =>
        nodes.map((node) => {
          const r = node.getBoundingClientRect();
          return { x: r.x, y: r.y, width: r.width, height: r.height };
        }),
      );
    for (let i = 1; i < cards.length; i++)
      expect(cards[i].y).toBeGreaterThan(cards[i - 1].y + cards[i - 1].height);
    for (const line of await page.locator(".connection-line").all()) {
      const box = await line.boundingBox();
      expect(box.height).toBeGreaterThanOrEqual(32);
      expect(box.width).toBe(1);
    }
    const detail = await page
      .locator(".connection-detail")
      .first()
      .evaluate((node) => ({
        height: node.getBoundingClientRect().height,
        line: parseFloat(getComputedStyle(node).lineHeight),
        width: node.scrollWidth,
        available: node.clientWidth,
      }));
    expect(detail.height).toBeLessThanOrEqual(detail.line + 1);
    expect(detail.width).toBeLessThanOrEqual(detail.available);
  }
});

test("brand assets and social cards use local, complete metadata", async ({
  page,
  request,
}) => {
  for (const path of [...paths, "/404.html"]) {
    await page.goto(path);
    const title = (await page.title()).replace(/\s+/g, " ").trim();
    for (const attr of ["og:title", "twitter:title"])
      await expect(
        page.locator(
          `meta[${attr.startsWith("og:") ? "property" : "name"}="${attr}"]`,
        ),
      ).toHaveAttribute("content", title);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
    for (const attr of ["og:image", "twitter:image"])
      await expect(
        page.locator(
          `meta[${attr.startsWith("og:") ? "property" : "name"}="${attr}"]`,
        ),
      ).toHaveAttribute("content", "https://pubship.dev/assets/social.png");
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
      "href",
      "/assets/apple-touch-icon.png",
    );
    await expect(
      page.locator('link[rel="icon"][type="image/svg+xml"]'),
    ).toHaveAttribute("href", "/assets/mark.svg");
  }
  for (const [file, width, height] of [
    ["social.png", 1200, 630],
    ["apple-touch-icon.png", 180, 180],
    ["favicon-32.png", 32, 32],
  ]) {
    const response = await request.get(`/assets/${file}`);
    expect(response.status()).toBe(200);
    const png = await response.body();
    expect(png.subarray(1, 4).toString()).toBe("PNG");
    expect(png.readUInt32BE(16)).toBe(width);
    expect(png.readUInt32BE(20)).toBe(height);
  }
});
