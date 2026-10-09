import { test, expect } from "@playwright/test";

const widths = [320, 375, 768, 1024, 1280, 1440, 1920];
const paths = [
  "/",
  "/get-started/",
  "/permissions/",
  "/privacy/",
  "/terms/",
  "/404.html",
];
const homeAnchors = ["workflows", "connection", "clients", "start", "project"];

for (const width of widths) {
  test(`all page layouts align without overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1080 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const path of paths) {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.evaluate(() => ({
        viewport: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        offenders: [...document.querySelectorAll("body *")].flatMap((node) => {
          if (node.scrollWidth <= node.clientWidth + 1) return [];
          return [
            {
              tag: node.tagName,
              class: node.className,
              text: node.textContent.trim().slice(0, 100),
              width: node.clientWidth,
              scrollWidth: node.scrollWidth,
            },
          ];
        }),
      }));
      expect(
        overflow.documentWidth,
        `${path}: ${JSON.stringify(overflow)}`,
      ).toBeLessThanOrEqual(overflow.viewport);
      const orphanHeadings = await page
        .locator("h1, h2, h3")
        .evaluateAll((nodes) =>
          nodes.flatMap((node) => {
            if (!node.getClientRects().length) return [];
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
      const footerSurface = await page.locator(".footer-surface").boundingBox();
      const availableWidth = await page.evaluate(
        () => document.documentElement.clientWidth,
      );
      expect(footerSurface.x, `${path} footer background left edge`).toBe(0);
      expect(footerSurface.width, `${path} footer background width`).toBe(
        availableWidth,
      );
      expect(Math.abs(header.x - footer.x), path).toBeLessThan(1);
      expect(Math.abs(header.width - footer.width), path).toBeLessThan(1);
      const content = await page
        .locator("main.frame, main .content-frame")
        .first()
        .boundingBox();
      expect(
        Math.abs(header.x - content.x),
        `${path} content gutter`,
      ).toBeLessThan(1);
      expect(
        Math.abs(header.width - content.width),
        `${path} content width`,
      ).toBeLessThan(1);
      if (width >= 1024) {
        const top = await page.locator(".footer-top").boundingBox();
        const notices = await page.locator(".footer-notices").boundingBox();
        const navTops = await page
          .locator("footer nav")
          .evaluateAll((nodes) =>
            nodes.map((node) => node.getBoundingClientRect().top),
          );
        expect(
          Math.max(...navTops) - Math.min(...navTops),
          `${path} footer column alignment`,
        ).toBeLessThan(1);
        expect(notices.y, `${path} notices below navigation`).toBeGreaterThan(
          top.y + top.height,
        );
      }
      // All navigation and interactive controls need actual touch-sized hit areas.
      const small = await page
        .locator("a, button, summary")
        .evaluateAll((nodes) =>
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
      await expect(page.locator("header nav")).toBeVisible();
      await expect(page.locator("header nav a")).toHaveCount(4);
    }
  });
}

test("header navigation and brand lockup are shared on every page", async ({
  page,
}) => {
  let expected;
  for (const path of paths) {
    await page.goto(path);
    const nav = await page
      .locator("header nav a")
      .evaluateAll((nodes) =>
        nodes.map((node) => [
          node.textContent.replace("↗", "").trim(),
          node.getAttribute("href"),
        ]),
      );
    expected ??= nav;
    expect(nav).toEqual(expected);
    expect(nav).toEqual([
      ["Workflows", "/#workflows"],
      ["Setup", "/get-started/"],
      ["Docs", "https://github.com/pubship/pubship/tree/main/docs"],
      ["GitHub", "https://github.com/pubship/pubship"],
    ]);
    expect(await page.locator("header .brand-lockup").innerHTML()).toBe(
      await page.locator("footer .brand-lockup").innerHTML(),
    );
    if (path === "/get-started/")
      await expect(
        page.locator('header a[href="/get-started/"]'),
      ).toHaveAttribute("aria-current", "page");
  }
});

test("connection diagram preserves readable labels and changes direction at 1100px", async ({
  page,
}) => {
  for (const width of [320, 375, 768, 1024, 1099, 1100, 1440]) {
    await page.setViewportSize({ width, height: 1080 });
    await page.goto("/");
    const cards = await page
      .locator(".diagram .connection-node")
      .evaluateAll((nodes) =>
        nodes.map((node) => {
          const r = node.getBoundingClientRect();
          return { x: r.x, y: r.y, width: r.width, height: r.height };
        }),
      );
    expect(cards).toHaveLength(3);
    for (let i = 1; i < cards.length; i++) {
      if (width < 1100)
        expect(cards[i].y).toBeGreaterThan(
          cards[i - 1].y + cards[i - 1].height,
        );
      else
        expect(cards[i].x).toBeGreaterThan(cards[i - 1].x + cards[i - 1].width);
    }
    for (const line of await page.locator(".diagram .flow-line").all()) {
      const box = await line.boundingBox();
      if (width < 1100) expect(box.height).toBeGreaterThan(box.width);
      else expect(box.width).toBeGreaterThan(box.height);
    }
    await expect(page.locator(".diagram")).toContainText("calls a tool");
    await expect(page.locator(".diagram")).toContainText("gets the result");
    await expect(page.locator(".diagram")).toContainText("HTTPS, your token");
  }
});

test("brand assets and social cards use local, complete metadata", async ({
  page,
  request,
}) => {
  for (const path of paths) {
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

// Natural page height can clamp a late anchor. Its heading must remain visible.
async function anchorLanding(page, target) {
  return page.locator(`#${target}`).evaluate((anchor) => {
    const box = anchor.getBoundingClientRect();
    const heading = anchor.matches("h1,h2,h3")
      ? anchor
      : anchor.querySelector("h1,h2,h3");
    const headingBox = (heading || anchor).getBoundingClientRect();
    const maximum = document.documentElement.scrollHeight - innerHeight;
    return (
      Math.abs(box.top - 24) <= 2 ||
      (Math.abs(scrollY - maximum) <= 2 &&
        headingBox.top >= 0 &&
        headingBox.bottom <= innerHeight)
    );
  });
}

for (const width of [375, 768, 1024, 1440]) {
  test(`navigation and direct links land on section content at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    for (const source of ["/", "/privacy/", "/permissions/"]) {
      await page.goto(source);
      await page.locator('header nav a[href="/#workflows"]').click();
      await expect(page).toHaveURL(/#workflows$/);
      await expect.poll(() => anchorLanding(page, "workflows")).toBe(true);
    }
    for (const [path, ids] of [
      ["/", homeAnchors],
      ["/get-started/", ["step-1", "step-2", "step-3", "step-4"]],
    ]) {
      for (const target of ids) {
        await page.goto(`${path}#${target}`);
        await expect
          .poll(() => anchorLanding(page, target), `${path}#${target}`)
          .toBe(true);
      }
    }
  });
}

test("section links retain landing position without JavaScript and with reduced motion", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    reducedMotion: "reduce",
    viewport: { width: 375, height: 800 },
  });
  const page = await context.newPage();
  try {
    for (const [path, ids] of [
      ["/", homeAnchors],
      ["/get-started/", ["step-1", "step-2", "step-3", "step-4"]],
    ]) {
      for (const target of ids) {
        await page.goto(new URL(`${path}#${target}`, baseURL).href);
        // Firefox with page scripts disabled can leave FontFaceSet.ready pending
        // after the font files are loaded. Poll the rendered faces themselves.
        await expect
          .poll(() =>
            page.evaluate(() =>
              [...document.fonts].every((face) => face.status !== "loading"),
            ),
          )
          .toBe(true);
        await expect
          .poll(() => anchorLanding(page, target), `${path}#${target}`)
          .toBe(true);
      }
    }
  } finally {
    await context.close();
  }
});

test("connection motion is bounded and does not replay after reentry", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.locator(".diagram").scrollIntoViewIfNeeded();
  await expect
    .poll(async () =>
      page
        .locator(".diagram")
        .evaluate((diagram) => diagram.getAnimations({ subtree: true }).length),
    )
    .toBeGreaterThan(0);
  const durations = await page
    .locator(".diagram")
    .evaluate((diagram) =>
      diagram
        .getAnimations({ subtree: true })
        .map((animation) => animation.effect.getComputedTiming().endTime),
    );
  expect(
    durations.every(
      (duration) => Number.isFinite(duration) && duration <= 5000,
    ),
  ).toBe(true);
  await page.locator(".diagram").evaluate((diagram) => {
    for (const animation of diagram.getAnimations({ subtree: true }))
      animation.finish();
  });
  await page.locator("h1").scrollIntoViewIfNeeded();
  await page.locator(".diagram").scrollIntoViewIfNeeded();
  expect(
    await page
      .locator(".diagram")
      .evaluate(
        (diagram) =>
          diagram
            .getAnimations({ subtree: true })
            .filter((animation) => animation.playState === "running").length,
      ),
  ).toBe(0);
});

for (const path of ["/", "/get-started/"]) {
  test(`${path} every active panel stays within the viewport`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const width of [320, 375, 768, 1440]) {
      await page.setViewportSize({ width, height: 1080 });
      await page.goto(path);
      for (const tab of await page.getByRole("tab").all()) {
        await tab.click();
        const id = await tab.getAttribute("aria-controls");
        await expect(page.locator(`[id="${id}"]`)).toBeVisible();
        const geometry = await page.evaluate(() => ({
          viewport: innerWidth,
          page: document.documentElement.scrollWidth,
        }));
        expect(
          geometry.page,
          `${path} ${id} at ${width}px`,
        ).toBeLessThanOrEqual(geometry.viewport);
      }
    }
  });
}
