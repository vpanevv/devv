"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { whatsappHref } from "@/lib/site";
import { Reveal } from "./Reveal";

type Status = "idle" | "sending" | "success" | "error";

const fieldClass =
  "w-full rounded-2xl border border-ink/12 bg-white px-4 py-3.5 text-base text-ink placeholder:text-ink/35 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/25";

export function ContactForm() {
  const t = useTranslations("contact");
  const f = useTranslations("floating");
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-ink/60 backdrop-blur-md sm:grid sm:grid-cols-5">
        <div className="p-8 sm:col-span-2 sm:p-10 lg:p-12">
          <Reveal>
            <h2 className="font-display text-3xl font-bold tracking-tight text-sand sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-4 text-sand/70">{t("subtitle")}</p>
          </Reveal>
        </div>

        <div className="bg-white/[0.04] p-8 sm:col-span-3 sm:p-10 lg:p-12">
          {status === "success" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex h-full flex-col items-start justify-center"
            >
              <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal">
                <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M4 12.5 9.5 18 20 6.5"
                    stroke="#fff"
                    strokeWidth="2.4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <h3 className="font-display text-2xl font-bold text-sand">{t("successTitle")}</h3>
              <p className="mt-2 max-w-md text-sand/70">{t("successBody")}</p>
              <a
                href={whatsappHref(f("prefill"))}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 rounded-full bg-teal px-6 py-3 font-bold text-white transition-transform hover:scale-[1.04]"
              >
                {t("continueWhatsapp")}
              </a>
            </motion.div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label htmlFor="lead-name" className="mb-1.5 block text-xs font-semibold tracking-wide text-sand/70 uppercase">
                  {t("name")}
                </label>
                <input id="lead-name" name="name" required minLength={2} autoComplete="name" className={fieldClass} />
              </div>
              <div className="sm:col-span-1">
                <label htmlFor="lead-phone" className="mb-1.5 block text-xs font-semibold tracking-wide text-sand/70 uppercase">
                  {t("phone")}
                </label>
                <input id="lead-phone" name="phone" type="tel" required minLength={6} autoComplete="tel" className={fieldClass} />
              </div>
              <div className="sm:col-span-1">
                <label htmlFor="lead-location" className="mb-1.5 block text-xs font-semibold tracking-wide text-sand/70 uppercase">
                  {t("location")}
                </label>
                <select id="lead-location" name="location" className={fieldClass} defaultValue="bansko">
                  <option value="bansko">{t("locations.bansko")}</option>
                  <option value="razlog">{t("locations.razlog")}</option>
                  <option value="banya">{t("locations.banya")}</option>
                  <option value="other">{t("locations.other")}</option>
                </select>
              </div>
              <div className="sm:col-span-1">
                <label htmlFor="lead-type" className="mb-1.5 block text-xs font-semibold tracking-wide text-sand/70 uppercase">
                  {t("type")}
                </label>
                <select id="lead-type" name="type" className={fieldClass} defaultValue="apartment">
                  <option value="apartment">{t("types.apartment")}</option>
                  <option value="house">{t("types.house")}</option>
                  <option value="studio">{t("types.studio")}</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <motion.button
                  type="submit"
                  disabled={status === "sending"}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full rounded-full bg-teal px-6 py-4 text-base font-bold text-white shadow-lg shadow-teal/25 disabled:opacity-60"
                >
                  {status === "sending" ? t("sending") : t("submit")}
                </motion.button>
                {status === "error" && (
                  <p role="alert" className="mt-3 text-sm text-sand">
                    {t("error")}
                  </p>
                )}
                <p className="mt-3 text-xs text-sand/65">{t("privacy")}</p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
