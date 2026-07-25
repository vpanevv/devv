import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["bg", "en"],
  defaultLocale: "bg",
  // "/" serves Bulgarian, "/en" serves English
  localePrefix: "as-needed",
  localeCookie: {
    // Persist the visitor's language choice
    maxAge: 60 * 60 * 24 * 365,
  },
});

export type Locale = (typeof routing.locales)[number];
