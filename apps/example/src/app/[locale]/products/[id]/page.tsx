import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { JsonLd } from "@/components/json-ld";
import {
  FIXTURE_PRODUCT,
  getFixtureProductDescription,
  getFixtureProductTitle,
} from "@/lib/fixtures";
import { buildPageMetadata } from "@/lib/metadata";

const metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4100");

type ProductDetailPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { locale, id } = await params;

  if (id !== FIXTURE_PRODUCT.id) {
    return {};
  }

  return buildPageMetadata({
    locale,
    path: `products/${id}`,
    title: getFixtureProductTitle(locale),
    description: getFixtureProductDescription(locale),
  });
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { locale, id } = await params;

  if (id !== FIXTURE_PRODUCT.id) {
    notFound();
  }

  setRequestLocale(locale);
  const title = getFixtureProductTitle(locale);
  const description = getFixtureProductDescription(locale);

  return (
    <main>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Product",
            name: title,
            url: new URL(`/${locale}/products/${id}`, metadataBase).toString(),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: locale === "ru" ? "Главная" : "Home",
                item: new URL(`/${locale}`, metadataBase).toString(),
              },
              {
                "@type": "ListItem",
                position: 2,
                name: locale === "ru" ? "Товары" : "Products",
                item: new URL(`/${locale}/products`, metadataBase).toString(),
              },
              {
                "@type": "ListItem",
                position: 3,
                name: title,
                item: new URL(`/${locale}/products/${id}`, metadataBase).toString(),
              },
            ],
          },
        ]}
      />
      <h1>{title}</h1>
      <p>{description}</p>
    </main>
  );
}
