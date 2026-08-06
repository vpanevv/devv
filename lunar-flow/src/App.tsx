import { useEffect } from "react";
import About from "./components/About";
import Contact from "./components/Contact";
import Faq from "./components/Faq";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Products from "./components/Products";
import Services from "./components/Services";
import Shop from "./components/Shop";
import Testimonials from "./components/Testimonials";
import Tarot from "./components/Tarot";

/**
 * Flags each section with data-inview so index.css can park the decorative
 * animations inside anything that is scrolled out of view.
 */
function useInViewSections() {
  useEffect(() => {
    const sections = [
      ...document.querySelectorAll<HTMLElement>("main > section, footer"),
    ];
    // Fail open: start visible so nothing is ever frozen if the observer is
    // late or unsupported. The first callback parks whatever is off-screen.
    sections.forEach((el) => el.setAttribute("data-inview", "true"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          (entry.target as HTMLElement).setAttribute(
            "data-inview",
            entry.isIntersecting ? "true" : "false",
          );
        });
      },
      // Start a little before the section arrives so nothing pops in mid-scroll.
      { rootMargin: "200px 0px" },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function App() {
  useInViewSections();

  return (
    <div className="bg-cosmos relative min-h-svh overflow-x-hidden">
      {/* Global cosmos backdrop */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,oklch(22%_0.10_300)_0%,oklch(10%_0.04_285)_60%,oklch(8%_0.03_285)_100%)]"
      />
      <span id="top" aria-hidden className="absolute top-0" />
      <div className="relative">
        <Header />
        <main>
          <Hero />
          <About />
          <Services />
          <Tarot />
          <Products />
          <Shop />
          <Testimonials />
          <Faq />
          <Contact />
        </main>
        <Footer />
      </div>
    </div>
  );
}
