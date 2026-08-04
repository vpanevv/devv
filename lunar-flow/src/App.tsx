import Header from "./components/Header";
import Hero from "./components/Hero";

export default function App() {
  return (
    <div className="bg-cosmos relative min-h-svh overflow-x-hidden">
      {/* Global cosmos backdrop */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,oklch(22%_0.10_300)_0%,oklch(10%_0.04_285)_60%,oklch(8%_0.03_285)_100%)]"
      />
      <div className="relative">
        <Header />
        <main>
          <Hero />
        </main>
      </div>
    </div>
  );
}
