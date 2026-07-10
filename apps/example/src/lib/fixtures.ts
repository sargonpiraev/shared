export const FIXTURE_PRODUCT = {
  id: "alpha",
  titles: {
    en: "Example product",
    ru: "Пример товара",
  },
  descriptions: {
    en: "A minimal fixture product for the seodit example app.",
    ru: "Минимальный товар-фикстура для примера seodit.",
  },
} as const;

export function getFixtureProductTitle(locale: string) {
  return FIXTURE_PRODUCT.titles[locale as keyof typeof FIXTURE_PRODUCT.titles] ?? FIXTURE_PRODUCT.titles.en;
}

export function getFixtureProductDescription(locale: string) {
  return (
    FIXTURE_PRODUCT.descriptions[locale as keyof typeof FIXTURE_PRODUCT.descriptions] ??
    FIXTURE_PRODUCT.descriptions.en
  );
}
