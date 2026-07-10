import { assertSeoditRouteBasics, createSeoditPageRoutes } from "@sargonpiraev/seodit";

import { routing } from "@/i18n/routing";
import { SITE_NAME, SITE_URL } from "@/lib/metadata";
import { expect, test } from "@/test/seodit";

const routes = createSeoditPageRoutes(routing, import.meta.url, {
  origin: SITE_URL,
});

for (const route of routes) {
  test(route.pathname, async ({ page }) => {
    await page.goto(route.pathname);

    await assertSeoditRouteBasics(expect, page, route);
    await expect(page).toHaveMetaTitle(/.+/);
    await expect(page).toHaveMetaDescription(/.+/);
    await expect(page).toHaveOpenGraphUrl(route.absoluteUrl());
    await expect(page).toHaveOpenGraphSiteName(SITE_NAME);
    await expect(page).toHaveOpenGraphType("website");
    await expect(page).toHaveTwitterCard("summary_large_image");
    await expect(page).toHaveJsonLd({ "@type": "Organization" });
  });
}
