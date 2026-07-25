import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Providers } from "@/components/Providers";
import { EMAIL, PHONE, SITE_URL } from "@/lib/site";
import "../globals.css";

// Both faces ship full Cyrillic coverage (Fraunces does not — hence Playfair).
// Bulgarian is covered by the base `cyrillic` subset; `cyrillic-ext` only adds
// glyphs for other languages, so it is left out to save a font request.
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-playfair",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: locale === "bg" ? "/" : "/en",
      languages: { bg: "/", en: "/en", "x-default": "/" },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: locale === "bg" ? "/" : "/en",
      siteName: "Eagle Trade",
      locale: locale === "bg" ? "bg_BG" : "en_US",
      type: "website",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: locale === "bg" ? "Игъл Трейд" : "Eagle Trade",
    url: SITE_URL,
    telephone: PHONE,
    email: EMAIL,
    description:
      locale === "bg"
        ? "Управление на имоти, почистване, ремонти и трансфери в района на Банско, Разлог и Баня."
        : "Property management, cleaning, repairs and transfers in the Bansko, Razlog & Banya area.",
    areaServed: [
      { "@type": "City", name: "Bansko" },
      { "@type": "City", name: "Razlog" },
      { "@type": "City", name: "Banya" },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bansko",
      addressCountry: "BG",
    },
    priceRange: "€€",
  };

  return (
    <html lang={locale} className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
