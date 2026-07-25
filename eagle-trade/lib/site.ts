/** Central place for contact details & placeholder imagery — swap for real assets ASAP. */

export const PHONE = "+359888123456";
export const PHONE_DISPLAY = "+359 888 123 456";
export const EMAIL = "office@eagletrade.bg";
export const SITE_URL = "https://eagletrade.bg";

export const whatsappHref = (prefill: string) =>
  `https://wa.me/${PHONE.replace("+", "")}?text=${encodeURIComponent(prefill)}`;

export const viberHref = () => `viber://chat?number=${encodeURIComponent(PHONE)}`;

const u = (id: string, w: number, q = 75) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=${q}`;

/** License-free Unsplash placeholders (source.unsplash.com is discontinued). */
export const IMAGES = {
  hero: u("1454496522488-7a8e488e8606", 2000, 70),
  house: u("1518780664697-55e3ad937233", 900),
  interior: u("1522708323590-d24dbb6b0267", 900),
};

/** Looping cinematic hero backdrop, served from public/.
 *  Web-optimized encode (1920w, H.264 CRF 28, no audio, faststart) of the
 *  2888x2160 master — 21MB -> 1.5MB so the hero paints without a stall. */
export const HERO_VIDEO = "/purple-desert-web.mp4";

/** Still frame of the hero video, used as the fixed page-wide backdrop. */
export const PAGE_BACKGROUND = "/desert-bg.jpg";

