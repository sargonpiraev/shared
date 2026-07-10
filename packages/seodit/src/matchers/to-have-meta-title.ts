import type { Page } from "@playwright/test";

/**
 * title
 *
 * Check that the document `<title>` matches the expected value.
 *
 * ## Why is this important?
 *
 * The document title is a primary ranking and SERP signal. It should describe the page and stay unique across routes.
 *
 * ## How to use this matcher?
 *
 * `toHaveMetaTitle(expected)` reads the `<title>` text and compares it with the expected value.

 * ```typescript
 * await expect(page).toHaveMetaTitle("Example Store");
 * ```

 *
 * ## Further reading
 *
 * - [Google Search Central — Title links](https://developers.google.com/search/docs/appearance/title-link)
 */
export async function toHaveMetaTitle(page: Page, expected: string | RegExp) {
  const selector = 'title';
  const actual = (await page.locator(selector).textContent())?.trim() ?? null;
  const pass = typeof expected === "string" ? actual === expected : !!actual && expected.test(actual);

  return {
    pass,
    message: () => `Expected title: ${expected}\nReceived: ${actual}`,
  };
}
