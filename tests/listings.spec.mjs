import { test, expect } from "@playwright/test";

// These are public placements, not a live-network or endorsement test.
test("directory strip uses readable local marks and direct listing links", async ({
  page,
}) => {
  await page.goto("/");
  const strip = page.getByRole("region", { name: "Featured on:" });
  const links = strip.getByRole("link");
  expect(
    await links.evaluateAll((nodes) => nodes.map((node) => node.href)),
  ).toEqual([
    "https://glama.ai/mcp/servers/pubship/pubship",
    "https://mcp.so/servers/pubship",
    "https://mcpservers.org/servers/pubship-mcp",
    "https://sourceweft.com/mcp/io.github.pubship%2Fpubship",
    "https://mcplookup.com/server/io.github.pubship/pubship",
    "https://cursor.directory/plugins/pubship",
    "https://github.com/punkpeye/awesome-mcp-servers#developer-tools",
  ]);
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    await expect(link).toHaveAccessibleName(/opens in a new tab/);
  }
  for (const img of await strip.locator("img").all()) {
    expect(
      await img.evaluate((node) => node.complete && node.naturalWidth > 0),
    ).toBe(true);
    expect(new URL(await img.getAttribute("src"), page.url()).origin).toBe(
      new URL(page.url()).origin,
    );
  }
  for (const width of [320, 375, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1080 });
    await page.evaluate(() => document.fonts.ready);
    const boxes = await links.evaluateAll((nodes) =>
      nodes.map((node) => {
        const box = node.getBoundingClientRect();
        return {
          left: box.left,
          right: box.right,
          top: box.top,
          bottom: box.bottom,
          height: box.height,
        };
      }),
    );
    for (const box of boxes) {
      expect(box.left).toBeGreaterThanOrEqual(0);
      expect(box.right).toBeLessThanOrEqual(width);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    for (let i = 0; i < boxes.length; i++)
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i],
          b = boxes[j];
        expect(
          a.right <= b.left ||
            b.right <= a.left ||
            a.bottom <= b.top ||
            b.bottom <= a.top,
        ).toBe(true);
      }
  }
  await expect(
    page.locator(".registry-listings").getByRole("link"),
  ).toHaveCount(4);
  await expect(strip).not.toContainText("GitHub MCP Registry");
});
