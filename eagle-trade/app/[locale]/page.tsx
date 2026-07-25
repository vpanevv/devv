import { setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/ContactForm";
import { FAQ } from "@/components/FAQ";
import { FloatingButtons } from "@/components/FloatingButtons";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Services } from "@/components/Services";
import { Testimonials } from "@/components/Testimonials";
import { TrustStrip } from "@/components/TrustStrip";
import { WhyUs } from "@/components/WhyUs";
import { PAGE_BACKGROUND } from "@/lib/site";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      {/* Fixed page-wide backdrop: still frame of the hero video, held behind
          every section so the whole page shares one cinematic scene. The scrim
          keeps body copy at accessible contrast over the artwork. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${PAGE_BACKGROUND})` }}
        />
        {/* Scrim tuned so the artwork stays clearly visible while muted body
            copy still clears WCAG AA over the brightest part of the sky. */}
        <div className="absolute inset-0 bg-ink/68" />
      </div>

      <Header />
      <main>
        <Hero />
        {/* Transparent so the fixed backdrop shows through; individual
            sections add their own tints for rhythm. */}
        <div className="relative z-10">
          <TrustStrip />
          <Services />
          <HowItWorks />
          <WhyUs />
          <Testimonials />
          <FAQ />
          <ContactForm />
        </div>
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
      <FloatingButtons />
    </>
  );
}
