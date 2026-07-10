import type { Page } from "@playwright/test";

/**
 * self hreflang alternate
 *
 * Check that the self-locale hreflang alternate points to the expected URL.
 *
 * ## Why is this important?
 *
 * Each localized page should include a self-referencing hreflang alternate for its own locale.
 *
 * ## How to use this matcher?
 *
 * `toHaveSelfAlternate(locale, expected)` reads `link[rel="alternate"][hreflang="<locale>"]` href.

 * ```typescript
 * await expect(page).toHaveSelfAlternate("en", "https://example.com/en");
 * ```

 */
export async function toHaveSelfAlternate(page: Page, locale: string, expected: string | RegExp) {
  const selector = `link[rel="alternate"][hreflang="${locale}"]`;
  const actual = await page.locator(selector).getAttribute("href");
  const pass = typeof expected === "string" ? actual === expected : !!actual && expected.test(actual);

  return {
    pass,
    message: () => `Expected self alternate: ${expected}\nReceived: ${actual}`,
  };
}
