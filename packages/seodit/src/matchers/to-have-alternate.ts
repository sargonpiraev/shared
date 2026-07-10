import type { Page } from "@playwright/test";

/**
 * link rel="alternate" hreflang
 *
 * Check that an hreflang alternate points to the expected URL.
 *
 * ## Why is this important?
 *
 * Hreflang alternates tell search engines which locale URL is the counterpart for each language version.
 *
 * ## How to use this matcher?
 *
 * `toHaveAlternate(hreflang, expected)` reads `link[rel="alternate"][hreflang="…"]` href.

 * ```typescript
 * await expect(page).toHaveAlternate("ru", "https://example.com/ru");
 * ```

 *
 * ## Further reading
 *
 * - [Google Search Central — Localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)
 */
export async function toHaveAlternate(page: Page, hreflang: string, expected: string | RegExp) {
  const selector = `link[rel="alternate"][hreflang="${hreflang}"]`;
  const actual = await page.locator(selector).getAttribute("href");
  const pass = typeof expected === "string" ? actual === expected : !!actual && expected.test(actual);

  return {
    pass,
    message: () => `Expected alternate: ${expected}\nReceived: ${actual}`,
  };
}
