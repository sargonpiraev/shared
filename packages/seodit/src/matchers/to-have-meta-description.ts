import type { Page } from "@playwright/test";

/**
 * meta name="description"
 *
 * Check that `meta[name="description"]` matches the expected value.
 *
 * ## Why is this important?
 *
 * Meta description often becomes the SERP snippet. It should summarize the page and stay unique.
 *
 * ## How to use this matcher?
 *
 * `toHaveMetaDescription(expected)` reads `meta[name="description"]` content.

 * ```typescript
 * await expect(page).toHaveMetaDescription(/Example Store/);
 * ```

 */
export async function toHaveMetaDescription(page: Page, expected: string | RegExp) {
  const selector = 'meta[name="description"]';
  const actual = await page.locator(selector).getAttribute("content");
  const pass = typeof expected === "string" ? actual === expected : !!actual && expected.test(actual);

  return {
    pass,
    message: () => `Expected meta description: ${expected}\nReceived: ${actual}`,
  };
}
