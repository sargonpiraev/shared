import { getTranslations, setRequestLocale } from "next-intl/server";

import { buildPageMetadata } from "@/lib/metadata";

type ProductsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: ProductsPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "products" });

  return buildPageMetadata({
    locale,
    path: "products",
    title: t("title"),
    description: t("description"),
  });
}

export default async function ProductsPage({ params }: ProductsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("products");

  return (
    <main>
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
    </main>
  );
}
