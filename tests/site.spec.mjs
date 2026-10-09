import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const paths = [
  "/",
  "/get-started/",
  "/permissions/",
  "/privacy/",
  "/terms/",
  "/404.html",
];
const workflowIds = ["release", "quality", "change"];
const clientIds = ["claude", "codex", "cursor", "gemini", "generic"];
const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const audit = async (page) => {
  expect(
    (await new AxeBuilder({ page }).withTags(tags).analyze()).violations,
  ).toEqual([]);
};

test.beforeEach(async ({ page, baseURL }) => {
  await page.route("**/*", async (route) => {
    if (new URL(route.request().url()).origin === new URL(baseURL).origin)
      await route.continue();
    else await route.abort();
  });
});

for (const width of [320, 390, 768, 1440, 2560]) {
  test(`homepage works at ${width}px without overflow or accessibility violations`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1080 });
    const errors = [];
    const requests = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => requests.push(request.url()));
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await audit(page);
    expect(errors).toEqual([]);
    expect(
      requests.every(
        (url) => new URL(url).origin === new URL(page.url()).origin,
      ),
    ).toBe(true);
    await expect(page.locator("main")).toContainText(
      /No (?:project-run Google|PubShip-run) service/i,
    );
  });
}

for (const path of paths.slice(1)) {
  test(`${path} has accessible content and only local asset requests`, async ({
    page,
  }) => {
    const errors = [];
    const requests = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => requests.push(request.url()));
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 1080 });
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await audit(page);
    }
    expect(errors).toEqual([]);
    expect(
      requests.every(
        (url) => new URL(url).origin === new URL(page.url()).origin,
      ),
    ).toBe(true);
  });
}

for (const [path, prefix, ids] of [
  ["/", "wf", workflowIds],
  ["/", "client", clientIds],
  ["/get-started/", "client", clientIds],
]) {
  test(`${path} ${prefix} tabs have roving focus, linked panels and keyboard wraparound`, async ({
    page,
  }) => {
    await page.goto(path);
    const tab = (id) => page.locator(`#${prefix}-tab-${id}`);
    const panel = (id) => page.locator(`#${prefix}-panel-${id}`);
    const selected = async (id) => {
      for (const other of ids) {
        await expect(tab(other)).toHaveAttribute("role", "tab");
        await expect(tab(other)).toHaveAttribute(
          "aria-controls",
          `${prefix}-panel-${other}`,
        );
        await expect(tab(other)).toHaveAttribute(
          "aria-selected",
          String(other === id),
        );
        await expect(tab(other)).toHaveAttribute(
          "tabindex",
          other === id ? "0" : "-1",
        );
        await expect(panel(other)).toHaveAttribute(
          "aria-labelledby",
          `${prefix}-tab-${other}`,
        );
        if (other === id) await expect(panel(other)).toBeVisible();
        else await expect(panel(other)).toBeHidden();
      }
    };
    await selected(ids[0]);
    await tab(ids[0]).focus();
    for (let index = 1; index <= ids.length; index++) {
      await page.keyboard.press("ArrowRight");
      const id = ids[index % ids.length];
      await selected(id);
      await expect(tab(id)).toBeFocused();
    }
    for (const [key, id] of [
      ["ArrowLeft", ids.at(-1)],
      ["Home", ids[0]],
      ["End", ids.at(-1)],
    ]) {
      await page.keyboard.press(key);
      await selected(id);
      await expect(tab(id)).toBeFocused();
    }
    for (const id of ids) {
      await tab(id).click();
      await selected(id);
      await audit(page);
    }
  });
}

test("workflow examples preserve synthetic provenance and distinguish lifecycle, missing data and staging", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.locator("section").filter({ has: page.locator("#workflows") }),
  ).toContainText(/synthetic/i);
  const release = page.locator("#wf-panel-release");
  await expect(release).toContainText("list_releases");
  await expect(release).toContainText(/not published yet/i);
  const disclosure = release.locator("details");
  await expect(disclosure).not.toHaveAttribute("open", "");
  await disclosure.locator("summary").focus();
  // Native keyboard focus must not start a smooth viewport movement that can
  // make the next pointer action miss its control (observed in WebKit).
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe("auto");
  await page.keyboard.press("Enter");
  await expect(disclosure).toHaveAttribute("open", "");
  await expect(disclosure).toContainText("releaseLifecycleState");
  await expect(disclosure).toContainText("RELEASE_LIFECYCLE_STATE_IN_REVIEW");
  await page.locator("#wf-tab-quality").click();
  await expect(page.locator("#wf-tab-quality")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.locator("#wf-panel-quality")).toContainText(
    /not the same as zero/i,
  );
  await expect(
    page.getByRole("img", { name: /daily crash rate/i }),
  ).toHaveAccessibleName(/October 6: no row returned yet/i);
  await expect(page.locator("#wf-panel-quality")).toContainText(
    "America/Los_Angeles",
  );
  await page.locator("#wf-tab-change").click();
  const change = page.locator("#wf-panel-change");
  for (const text of [
    "prepare_store_listing_update",
    "apply_store_listing_update",
    "committed: false",
    "publication_verified: false",
    "single-use",
    "10 minutes",
    "GOOGLE_PLAY_WRITE_PACKAGES",
  ])
    await expect(change).toContainText(text);
  await expect(change).toContainText(
    /Nothing has been committed or published/i,
  );
  await expect(change).toContainText("Before:");
  await expect(change).toContainText("After:");
});

for (const failure of [false, true]) {
  test(`every copy control ${failure ? "selects exact text after clipboard denial" : "copies exact visible code and announces success"}`, async ({
    page,
  }) => {
    await page.addInitScript(
      (denied) =>
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: {
            writeText: async (text) => {
              if (denied) throw new Error("permission denied");
              window.copied = text;
            },
          },
        }),
      failure,
    );
    for (const path of ["/", "/get-started/"]) {
      await page.goto(path);
      const seen = new Set();
      for (const client of clientIds) {
        await page.locator(`#client-tab-${client}`).click();
        for (const button of await page.locator("[data-copy]:visible").all()) {
          const id = await button.getAttribute("data-copy");
          if (seen.has(id)) continue;
          seen.add(id);
          const code = page.locator(`[id="${id}"]`);
          const text = await code.textContent();
          expect(text.trim().length).toBeGreaterThan(0);
          await button.click();
          const block = button.locator(
            "xpath=ancestor::*[contains(concat(' ',normalize-space(@class),' '),' code-block ')][1]",
          );
          const status = block.getByRole("status");
          if (failure) {
            await expect(status).toContainText(/select|manual/i);
            expect(await page.evaluate(() => getSelection().toString())).toBe(
              text,
            );
          } else {
            await expect(status).toContainText(/copied/i);
            await expect(button).toContainText("Copied");
            expect(await page.evaluate(() => window.copied)).toBe(text);
          }
        }
      }
      expect(seen.size).toBeGreaterThanOrEqual(4);
    }
  });
}

test("unavailable clipboard API still selects code for manual copying", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", { value: undefined }),
  );
  await page.goto("/");
  const button = page.locator("[data-copy]:visible").first();
  const id = await button.getAttribute("data-copy");
  await button.click();
  expect(await page.evaluate(() => getSelection().toString())).toBe(
    await page.locator(`[id="${id}"]`).textContent(),
  );
  await expect(
    page.getByRole("status").filter({ hasText: /select|manual/i }),
  ).toBeVisible();
});

test("skip links move keyboard focus into main on every page", async ({
  page,
}) => {
  for (const path of paths) {
    await page.goto(path);
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Skip to content" }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main")).toBeFocused();
  }
});

test("internal links, assets, redirects and unavailable routes resolve correctly", async ({
  page,
  request,
}) => {
  const destinations = new Set();
  for (const path of paths) {
    await page.goto(path);
    for (const href of await page
      .locator("a[href]")
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")))) {
      const url = new URL(href, page.url());
      if (url.origin === new URL(page.url()).origin)
        destinations.add(url.pathname + url.hash);
    }
  }
  for (const target of destinations) {
    expect((await request.get(target.split("#")[0])).status(), target).toBe(
      200,
    );
    await page.goto(target);
    const hash = new URL(page.url()).hash;
    if (hash)
      await expect(
        page.locator(`[id="${decodeURIComponent(hash.slice(1))}"]`),
        target,
      ).toHaveCount(1);
  }
  for (const asset of [
    "/assets/mark.svg",
    "/assets/site.css",
    "/assets/site.js",
    "/assets/social.png",
    "/robots.txt",
    "/sitemap.xml",
    "/.well-known/security.txt",
  ])
    expect((await request.get(asset)).status(), asset).toBe(200);
  for (const path of ["/get-started", "/permissions", "/privacy", "/terms"]) {
    const redirect = await request.get(path, {
      maxRedirects: 0,
      headers: { Host: "pubship.dev" },
    });
    expect([301, 308]).toContain(redirect.status());
    expect(redirect.headers().location).toBe(`${path}/`);
  }
  for (const path of [
    "/this-page-does-not-exist",
    "/.git/config",
    "/design-assets/Home.dc.html",
  ])
    expect((await request.get(path)).status(), path).toBe(404);
});

test("text remains accessible during entrance and panel transitions", async ({
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
  await audit(page);
  await page.locator("#wf-tab-quality").click();
  await page.locator("#wf-panel-quality").evaluate((element) => {
    for (const animation of element.getAnimations()) {
      animation.pause();
      animation.currentTime = 60;
    }
  });
  await audit(page);
});

test("reduced motion disables scrolling and all entrance, panel and connection animations", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const path of ["/", "/get-started/", "/permissions/"]) {
    await page.goto(path);
    expect(
      await page.evaluate(
        () => getComputedStyle(document.documentElement).scrollBehavior,
      ),
    ).toBe("auto");
    for (const tab of await page.getByRole("tab").all()) await tab.click();
    await page.locator("footer").scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  }
});

test("every workflow and setup panel stays readable without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  try {
    for (const path of ["/", "/get-started/"]) {
      await page.goto(new URL(path, baseURL).href);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      for (const panel of await page.locator("[data-tab-panel]").all()) {
        await expect(panel).toBeVisible();
        await expect(panel.getByRole("heading").first()).toBeVisible();
      }
      await expect(page.locator("[data-tab-panel]")).toHaveCount(
        path === "/" ? 8 : 5,
      );
      for (const button of await page.locator("[data-copy]").all())
        await expect(button).toBeHidden();
      for (const list of await page.locator("[data-tablist]").all())
        await expect(list).toBeHidden();
      await expect(page.locator("#client-panel-generic")).toContainText(
        '"mcpServers"',
      );
      await expect(page.locator("#client-panel-codex")).toContainText(
        "codex mcp list",
      );
    }
  } finally {
    await context.close();
  }
});

test("setup and permission boundaries stay explicit", async ({ page }) => {
  await page.goto("/get-started/");
  for (let step = 1; step <= 4; step++)
    await expect(page.locator(`#step-${step}`)).toBeVisible();
  await expect(page.locator("main")).toContainText(/Never paste the key/i);
  await expect(page.locator("main")).toContainText(
    /no credentials and makes no Google call/i,
  );
  await expect(page.locator("#step-4")).toContainText("uvx pubship --check");
  for (const name of ["GOOGLE_APPLICATION_CREDENTIALS", "GOOGLE_PLAY_PACKAGES"])
    await expect(page.locator("#client-panel-claude")).toContainText(name);
  await page.goto("/permissions/");
  for (const name of [
    "GOOGLE_PLAY_PACKAGES",
    "GOOGLE_PLAY_SENSITIVE_READ_PACKAGES",
    "GOOGLE_PLAY_WRITE_PACKAGES",
    "GOOGLE_PLAY_TRACK_PACKAGES",
    "GOOGLE_PLAY_EDIT_PACKAGES",
  ])
    await expect(page.locator("main")).toContainText(name);
  await expect(page.locator("main")).toContainText(
    "Voided-purchase data is disabled",
  );
  await expect(page.locator("main")).toContainText(/synthetic providers/i);
  await expect(page.locator("main")).toContainText(/10 minutes/i);
});

test("discovery files expose canonical pages and truthful documentation links", async ({
  page,
  request,
}) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(sitemap.headers()["content-type"]).toContain("xml");
  await page.goto("/");
  const locations = await page.evaluate(
    (source) => {
      const document = new DOMParser().parseFromString(
        source,
        "application/xml",
      );
      if (document.querySelector("parsererror"))
        throw new Error("Invalid sitemap XML");
      return [...document.querySelectorAll("loc")].map(
        (node) => node.textContent,
      );
    },
    await sitemap.text(),
  );
  expect(locations.sort()).toEqual(
    paths
      .filter((path) => path !== "/404.html")
      .map((path) => `https://pubship.dev${path}`)
      .sort(),
  );
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
  expect(await (await request.get("/robots.txt")).text()).toContain(
    "Sitemap: https://pubship.dev/sitemap.xml",
  );
  const llms = await request.get("/llms.txt");
  expect(llms.status()).toBe(200);
  expect(llms.headers()["content-type"]).toContain("text/plain");
  const text = await llms.text();
  expect(text).toMatch(/^# PubShip\n\n> /);
  for (const claim of [
    "No project-run Google service",
    "main/docs/api-methods.md",
    "170 enabled methods are implemented",
    "Voided purchases are disabled by policy",
  ])
    expect(text).toContain(claim);
  expect(text).not.toMatch(/<html|client_secret|access_token/);
});

test("all pages retain legal notices and have no hosted sign-in", async ({
  page,
  request,
}) => {
  for (const path of paths) {
    await page.goto(path);
    await expect(page.locator("footer")).toContainText(
      "PubShip is an independent open-source project",
    );
    await expect(page.locator(".footer-trademark")).toHaveText(
      "PubShip™ is a trademark of Denys Vorobyov.",
    );
    await expect(page.locator(".footer-trademark a")).toHaveAttribute(
      "href",
      "https://vorobyov.me",
    );
    await expect(page.locator("footer")).not.toContainText("Built by Dennis");
    await expect(page.locator('a[href*="/google/callback"], form')).toHaveCount(
      0,
    );
    expect(await page.locator("body").textContent()).not.toContain("—");
  }
  for (const [path, heading] of [
    ["/privacy/", "A clear boundary"],
    ["/terms/", "Open source."],
  ]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      heading,
    );
    await expect(page.locator("main")).toContainText(
      "The project does not operate a Google-connected service",
    );
  }
  const security = await request.get("/.well-known/security.txt");
  expect(security.status()).toBe(200);
  expect(await security.text()).toContain(
    "Contact: mailto:security@pubship.dev",
  );
});

test("social SVG opens directly with local fonts and no CSP or console errors", async ({
  page,
}) => {
  const errors = [];
  const requests = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("request", (request) => requests.push(request.url()));
  const response = await page.goto("/assets/social.svg");
  expect(response.status()).toBe(200);
  await expect(page.locator("svg").first()).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() =>
        [...document.fonts]
          .filter((face) => face.status === "loaded")
          .map((face) => face.family.replaceAll('"', ""))
          .sort(),
      ),
    )
    .toEqual(["PubShipBody", "PubShipHeading"]);
  expect(
    requests.every((url) => new URL(url).origin === new URL(page.url()).origin),
  ).toBe(true);
  expect(requests.map((url) => new URL(url).pathname)).toEqual(
    expect.arrayContaining([
      "/assets/social-fonts.css",
      "/assets/fonts/bricolage-grotesque.woff2",
      "/assets/fonts/ibm-plex-sans.woff2",
    ]),
  );
  expect(errors).toEqual([]);
});
