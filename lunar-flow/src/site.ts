/**
 * Single source of truth for contact details and the page's section map.
 *
 * TODO: replace CONTACT_EMAIL and CONTACT_PHONE with Магдалена's real details
 * before launch — they are placeholders.
 */
export const CONTACT_EMAIL = "hello@example.com";
export const CONTACT_PHONE = "+359 000 000 000";

export const INSTAGRAM_HANDLE = "@magdalena.bangeeva";
export const INSTAGRAM_URL = "https://instagram.com/magdalena.bangeeva";

export type NavLink = { label: string; href: string };
export type NavItem = NavLink & { children?: NavLink[] };

/** Drives both the desktop dropdowns and the mobile panel. */
export const NAV_ITEMS: NavItem[] = [
  { label: "За мен", href: "#about" },
  {
    label: "Услуги",
    href: "#services",
    children: [
      { label: "Астрологични консултации", href: "#services" },
      { label: "Годишен хороскоп", href: "#packages" },
      { label: "Таро и нумерология", href: "#tarot" },
    ],
  },
  {
    label: "Продукти",
    href: "#products",
    children: [
      { label: "Дни с финансова активност", href: "#products" },
      { label: "Езотерични продукти", href: "#shop" },
    ],
  },
  { label: "Отзиви", href: "#testimonials" },
  { label: "Въпроси", href: "#faq" },
];
