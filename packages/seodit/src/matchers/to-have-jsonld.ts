import type { Page } from "@playwright/test";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function collectJsonLdCandidates(data: unknown): Record<string, unknown>[] {
  const candidates: Record<string, unknown>[] = [];

  function visit(value: unknown): void {
    if (Array.isArray(value)) {
      for (const item of value) {
        visit(item);
      }
      return;
    }

    if (!isRecord(value)) return;

    candidates.push(value);
    visit(value["@graph"]);
  }

  visit(data);
  return candidates;
}

function deepPartialMatch(expected: unknown, actual: unknown): boolean {
  if (expected === actual) return true;

  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) return false;
    return expected.every((expectedItem) =>
      actual.some((actualItem) => deepPartialMatch(expectedItem, actualItem)),
    );
  }

  if (!isRecord(expected)) return expected === actual;
  if (!isRecord(actual)) return false;

  return Object.entries(expected).every(([key, value]) => {
    if (!(key in actual)) return false;
    return deepPartialMatch(value, actual[key]);
  });
}

/**
 * JSON-LD object
 *
 * Check that the page includes a JSON-LD entity matching the expected object.
 *
 * ## Why is this important?
 *
 * Structured data tells search engines what the page means. Asserting a concrete JSON-LD object pins the fields your route guarantees — `@type`, `name`, `url`, and so on — without requiring the entire Schema.org payload.
 *
 * ## How to use this matcher?
 *
 * `toHaveJsonLd(expected)` reads every `script[type="application/ld+json"]`, flattens `@graph`, and passes when any entity partially matches `expected`.
 *
 * ```typescript
 * import { test, expect } from "@/test/seodit";
 *
 * test("/en", async ({ page }) => {
 *   await page.goto("/en");
 *
 *   await expect(page).toHaveJsonLd({
 *     "@type": "Organization",
 *     name: "Example Store",
 *   });
 * });
 * ```
 *
 * ## Further reading
 *
 * - [Google Search Central — Structured data](https://developers.google.com/search/docs/appearance/structured-data)
 * - [Schema.org](https://schema.org/)
 */
export async function toHaveJsonLd(page: Page, expected: Record<string, unknown>) {
  const scripts = page.locator('script[type="application/ld+json"]');
  const count = await scripts.count();
  const candidates: Record<string, unknown>[] = [];

  for (let i = 0; i < count; i++) {
    const raw = await scripts.nth(i).textContent();
    if (!raw?.trim()) continue;
    candidates.push(...collectJsonLdCandidates(JSON.parse(raw)));
  }

  const pass = candidates.some((candidate) => deepPartialMatch(expected, candidate));

  return {
    pass,
    message: () => `Expected JSON-LD: ${JSON.stringify(expected)}\nReceived: ${JSON.stringify(candidates)}`,
  };
}
