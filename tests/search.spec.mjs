import { test, expect } from "@playwright/test";

test("search metadata stays specific, canonical and available without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const expected = [
    ["/", "PubShip · MCP server for Google Play Console"],
    ["/get-started/", "Set up an MCP server for Google Play · PubShip"],
    ["/permissions/", "Google Play MCP permissions and credentials · PubShip"],
    [
      "/guides/check-google-play-release/",
      "Check Google Play releases with MCP · PubShip guide",
    ],
  ];
  const descriptions = [];
  for (const [path, title] of expected) {
    const response = await page.goto(new URL(path, baseURL).href);
    expect(response.status()).toBe(200);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://pubship.dev${path}`,
    );
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      title,
    );
    const description = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    descriptions.push(description);
    await expect(
      page.locator('meta[property="og:description"]'),
    ).toHaveAttribute("content", description);
    expect(response.headers()["x-robots-tag"] || "").not.toMatch(/noindex/i);
    const robotsDirectives = await page
      .locator('meta[name="robots"]')
      .evaluateAll((nodes) => nodes.map((node) => node.content).join(","));
    expect(robotsDirectives).not.toMatch(/noindex/i);
    expect(robotsDirectives).toContain("max-image-preview:large");
  }
  expect(new Set(descriptions).size).toBe(expected.length);
  await page.goto(baseURL);
  await expect(
    page.locator('[itemscope][itemtype="https://schema.org/WebSite"]'),
  ).toHaveCount(1);
  await expect(page.locator('body > meta[itemprop="name"]')).toHaveAttribute(
    "content",
    "PubShip",
  );
  await expect(page.locator('[itemprop="url"]')).toHaveAttribute(
    "href",
    "https://pubship.dev/",
  );
  const answers = page.locator(".search-answers details");
  await expect(answers).toHaveCount(4);
  for (const answer of await answers.all()) {
    await answer.locator("summary").click();
    await expect(answer.locator("p")).toBeVisible();
  }
  await expect(page.locator(".search-answers")).toContainText(
    "not an official Google product",
  );
  await expect(page.locator(".search-answers")).toContainText("cloud AI model");
  await page.goto(new URL("/404.html", baseURL).href);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex",
  );
  await context.close();
});

test("breadcrumbs, source identity and canonical index redirects stay truthful", async ({
  page,
  request,
}) => {
  await page.goto("/");
  const source = page.locator(
    '[itemtype="https://schema.org/SoftwareSourceCode"]',
  );
  await expect(source.locator('[itemprop="name"]')).toHaveAttribute(
    "content",
    "PubShip",
  );
  await expect(source.locator('[itemprop="codeRepository"]')).toHaveAttribute(
    "href",
    "https://github.com/pubship/pubship",
  );
  await expect(source.locator('[itemprop="license"]')).toHaveAttribute(
    "href",
    "https://spdx.org/licenses/AGPL-3.0-only.html",
  );
  await expect(
    page.locator('[itemprop="aggregateRating"], [itemprop="review"]'),
  ).toHaveCount(0);
  for (const path of [
    "/",
    "/get-started/",
    "/permissions/",
    "/privacy/",
    "/terms/",
    "/guides/check-google-play-release/",
  ]) {
    const response = await request.get(path + "index.html?ref=example", {
      maxRedirects: 0,
    });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe(path + "?ref=example");
    await page.goto(path);
    if (path === "/") continue;
    const trail = page.getByRole("navigation", {
      name: "Breadcrumb",
      exact: true,
    });
    await expect(trail).toBeVisible();
    await expect(trail).toHaveAttribute(
      "itemtype",
      "https://schema.org/BreadcrumbList",
    );
    await expect(
      trail.getByRole("link", { name: "Home", exact: true }),
    ).toHaveAttribute("href", "/");
    await expect(trail.locator('[itemprop="position"]')).toHaveCount(2);
    await expect(trail.locator('[aria-current="page"]')).toBeVisible();
  }
  expect(
    (await request.get("/unknown/index.html", { maxRedirects: 0 })).status(),
  ).toBe(404);
});

test("release guide teaches read-only calls and preserves publication limits", async ({
  page,
}) => {
  await page.goto("/guides/check-google-play-release/");
  const examples = await page.locator("code[data-tool]").evaluateAll((nodes) =>
    nodes.map((node) => ({
      tool: node.dataset.tool,
      args: JSON.parse(node.textContent),
    })),
  );
  expect(examples).toEqual([
    {
      tool: "list_releases",
      args: { package: "com.example.app", track: "production" },
    },
    {
      tool: "list_releases",
      args: { package: "com.example.app", track: "internal" },
    },
    {
      tool: "describe_api_method",
      args: { method: "playdeveloperreporting.vitals.crashrate.get" },
    },
    {
      tool: "read_reporting",
      args: {
        method: "playdeveloperreporting.vitals.crashrate.get",
        parameters: { name: "apps/com.example.app/crashRateMetricSet" },
      },
    },
  ]);
  for (const text of [
    "In review is not published",
    "Retrieval time is not publication time",
    "synthetic package",
    "no live Google account was queried",
    "does not return a daily crash-rate time series",
    "does not authenticate with Google",
  ]) {
    await expect(page.locator("main")).toContainText(text);
  }
});
