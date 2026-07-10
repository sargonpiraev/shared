import type { Page } from "@playwright/test";

/**
 * x-default hreflang alternate
 *
 * Check that the x-default hreflang alternate points to the expected URL.
 *
 * ## Why is this important?
 *
 * x-default marks the fallback URL for users whose locale is not listed in hreflang alternates.
 *
 * ## How to use this matcher?
 *
 * `toHaveXDefaultAlternate(expected)` reads `link[rel="alternate"][hreflang="x-default"]` href.

 * ```typescript
 * await expect(page).toHaveXDefaultAlternate("https://example.com/en");
 * ```

 */
export async function toHaveXDefaultAlternate(page: Page, expected: string | RegExp) {
  const selector = 'link[rel="alternate"][hreflang="x-default"]';
  const actual = await page.locator(selector).getAttribute("href");
  const pass = typeof expected === "string" ? actual === expected : !!actual && expected.test(actual);

  return {
    pass,
    message: () => `Expected x-default alternate: ${expected}\nReceived: ${actual}`,
  };
}
