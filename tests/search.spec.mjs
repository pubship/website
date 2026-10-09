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
  }
  expect(new Set(descriptions).size).toBe(expected.length);
  await page.goto(baseURL);
  await expect(
    page.locator('[itemscope][itemtype="https://schema.org/WebSite"]'),
  ).toHaveCount(1);
  await expect(page.locator('[itemprop="name"]')).toHaveAttribute(
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
