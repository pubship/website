import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const width of [320, 390, 768, 1440, 2560]) {
  test(`homepage works at ${width}px without overflow or accessibility violations`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1080 });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const requests = [];
    page.on("request", (request) => requests.push(request.url()));
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(audit.violations).toEqual([]);
    expect(errors).toEqual([]);
    expect(
      requests.every(
        (url) => new URL(url).origin === new URL(page.url()).origin,
      ),
    ).toBe(true);
    await expect(
      page.locator(".hero-note").filter({
        hasText:
          "Run locally with your own credentials. No project-run Google service.",
      }),
    ).toBeVisible();
  });
}

test("demo tabs support keyboard navigation and identify synthetic data", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "Release", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Reviews", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#demo-reviews")).toBeVisible();
  await expect(page.locator("#demo-release")).toBeHidden();
  await page.keyboard.press("End");
  await expect(page.locator("#demo-reports")).toBeVisible();
  await expect(
    page.getByText("A missing row does not mean zero installs."),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Illustrative responses · Synthetic data · Not a live connection",
    ),
  ).toBeVisible();
  await page.keyboard.press("Home");
  await expect(page.locator("#demo-release")).toBeVisible();
});

test("copy success is announced and copies exactly the visible commands", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async (text) => {
          window.copied = text;
        },
      },
    }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Copy commands" }).click();
  await expect(page.getByRole("status")).toContainText("Commands copied");
  expect(await page.evaluate(() => window.copied)).toBe(
    await page.locator("#install-command").textContent(),
  );
});

test("denied clipboard access gives a usable manual fallback", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async () => {
          throw new Error("permission denied");
        },
      },
    }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Copy commands" }).click();
  await expect(page.getByRole("status")).toContainText(
    "selected for manual copying",
  );
  expect(await page.evaluate(() => window.getSelection().toString())).toBe(
    await page.locator("#install-command").textContent(),
  );
});

test("skip link moves keyboard focus into main", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
});

test("privacy page, internal links and assets resolve", async ({
  page,
  request,
}) => {
  await page.goto("/");
  const links = await page
    .locator('a[href^="#"]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")));
  for (const href of links) await expect(page.locator(href)).toHaveCount(1);
  for (const asset of [
    "/assets/mark.svg",
    "/assets/site.css",
    "/assets/site.js",
    "/assets/social.png",
    "/robots.txt",
    "/sitemap.xml",
    "/.well-known/security.txt",
  ])
    expect((await request.get(asset)).status()).toBe(200);
  const redirect = await request.get("/privacy", {
    maxRedirects: 0,
    headers: { Host: "pubship.dev" },
  });
  expect([301, 308]).toContain(redirect.status());
  expect(redirect.headers().location).toBe("/privacy/");
  await page.getByRole("link", { name: "Privacy", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "A clear boundary",
  );
  for (const [label, heading] of [
    ["Privacy", "A clear boundary"],
    ["Terms", "Open source."],
  ]) {
    await page.getByRole("link", { name: label, exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      heading,
    );
    await expect(page.locator(".note").first()).toContainText(
      "The project does not operate a Google-connected service",
    );
    await expect(page.locator(".note").first()).toContainText("website");
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(audit.violations).toEqual([]);
  }
  expect((await request.get("/this-page-does-not-exist")).status()).toBe(404);
  expect((await request.get("/.git/config")).status()).toBe(404);
});

test("text stays readable during entrance and tab transitions", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.evaluate(() => {
    for (const animation of document.getAnimations()) {
      animation.pause();
      animation.currentTime = 130;
    }
  });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const entrance = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(entrance.violations).toEqual([]);
  await page.getByRole("tab", { name: "Reviews", exact: true }).click();
  await page.locator("#demo-reviews").evaluate((element) => {
    for (const animation of element.getAnimations()) {
      animation.pause();
      animation.currentTime = 60;
    }
  });
  const panel = await new AxeBuilder({ page })
    .include(".demo")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(panel.violations).toEqual([]);
});

test("reduced motion disables scrolling and entrance animations", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe("auto");
  expect(
    await page
      .locator(".hero h1")
      .evaluate((element) => getComputedStyle(element).animationName),
  ).toBe("none");
  await page.getByRole("tab", { name: "Reviews", exact: true }).click();
  expect(
    await page
      .locator("#demo-reviews")
      .evaluate((element) => getComputedStyle(element).animationName),
  ).toBe("none");
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});

test("core content and setup stay usable without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(process.env.SITE_TEST_URL || "http://127.0.0.1:4173");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("#install-command")).toContainText("uvx pubship");
  await expect(
    page.getByRole("button", { name: "Copy commands" }),
  ).toBeHidden();
  await context.close();
});

test("discovery files expose canonical pages and truthful documentation links", async ({
  page,
  request,
}) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(sitemap.headers()["content-type"]).toContain("xml");
  const xml = await sitemap.text();
  await page.goto("/");
  const locations = await page.evaluate((source) => {
    const document = new DOMParser().parseFromString(source, "application/xml");
    if (document.querySelector("parsererror"))
      throw new Error("Invalid sitemap XML");
    return [...document.querySelectorAll("loc")].map(
      (node) => node.textContent,
    );
  }, xml);
  expect(locations).toEqual([
    "https://pubship.dev/",
    "https://pubship.dev/privacy/",
    "https://pubship.dev/terms/",
  ]);
  for (const canonical of locations) {
    await page.goto(new URL(canonical).pathname);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      canonical,
    );
    await expect(page.locator('link[rel="describedby"]')).toHaveAttribute(
      "href",
      "/llms.txt",
    );
  }
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain(
    "Sitemap: https://pubship.dev/sitemap.xml",
  );
  const llms = await request.get("/llms.txt");
  expect(llms.status()).toBe(200);
  expect(llms.headers()["content-type"]).toContain("text/plain");
  const text = await llms.text();
  expect(text).toMatch(/^# PubShip\n\n> /);
  expect(text).toContain("No project-run Google service");
  expect(text).toContain("main/docs/api-methods.md");
  expect(text).toContain("170 enabled methods are implemented");
  expect(text).toContain("Voided purchases are disabled by policy");
  expect(text).toContain("No project-run Google service");
  expect(text).not.toMatch(/<html|client_secret|access_token/);
});

test("all pages retain legal notices and no hosted sign-in", async ({
  page,
  request,
}) => {
  for (const path of ["/", "/privacy/", "/terms/", "/404.html"]) {
    await page.goto(path);
    await expect(page.locator("footer")).toContainText(
      "PubShip is an independent open-source project",
    );
    await expect(page.locator(".footer-trademark")).toHaveText(
      "PubShip™ is a trademark of Denys Vorobyov.",
    );
    await expect(page.locator("footer")).not.toContainText("Built by Dennis");
    await expect(page.locator(".footer-trademark a")).toHaveAttribute(
      "href",
      "https://vorobyov.me",
    );
    await expect(page.locator('a[href*="/google/callback"], form')).toHaveCount(
      0,
    );
  }
  const security = await request.get("/.well-known/security.txt");
  expect(security.status()).toBe(200);
  expect(await security.text()).toContain(
    "Contact: mailto:security@pubship.dev",
  );
});
