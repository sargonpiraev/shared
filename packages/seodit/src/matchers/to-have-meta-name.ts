import type { Page } from "@playwright/test";

/**
 * meta name="…"
 *
 * Check that a named meta tag matches the expected content.
 *
 * ## Why is this important?
 *
 * Named meta tags carry page-level directives and descriptions used by crawlers and browsers.
 *
 * ## How to use this matcher?
 *
 * `toHaveMetaName(name, expected)` reads `meta[name="…"]` content.

 * ```typescript
 * await expect(page).toHaveMetaName("description", /Example Store/);
 * ```

 */
export async function toHaveMetaName(page: Page, name: string, expected: string | RegExp) {
  const selector = `meta[name="${name}"]`;
  const actual = await page.locator(selector).getAttribute("content");
  const pass = typeof expected === "string" ? actual === expected : !!actual && expected.test(actual);

  return {
    pass,
    message: () => `Expected meta[name]: ${expected}\nReceived: ${actual}`,
  };
}
