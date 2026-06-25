import Navbar from "./components/Navbar";
import LiveTicker from "./components/LiveTicker";
import HeroSearch from "./components/HeroSearch";
import FlashDeals from "./components/FlashDeals";
import DestinationGrid from "./components/DestinationGrid";
import FeaturesSection from "./components/FeaturesSection";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen hero-bg">
      <Navbar />

      {/* Live ticker */}
      <div className="pt-16">
        <LiveTicker />
      </div>

      {/* Hero */}
      <section className="relative pt-16 pb-20 px-4 overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8">
            <span className="live-dot"></span>
            <span className="text-xs text-gray-300">
              Nouveau: Planificateur de voyage IA disponible!
            </span>
            <span className="text-xs text-blue-400 font-semibold">
              Essayer →
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
            Voyagez Plus.
            <br />
            <span className="gradient-text">Payez Moins.</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 mb-4 max-w-3xl mx-auto leading-relaxed">
            Notre IA analyse{" "}
            <span className="text-white font-semibold">2,4 millions d'offres</span>{" "}
            en temps réel pour vous garantir le meilleur prix sur chaque voyage.
          </p>

          <p className="text-base text-gray-500 mb-10">
            🍁 Service en français · Prix en CAD · Pour les Canadiens
          </p>

          {/* Search widget */}
          <HeroSearch />

          {/* Social proof */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {["MT", "JB", "SL", "RP", "CA"].map((initials, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-gray-800 flex items-center justify-center text-xs font-bold text-white"
                    style={{
                      background: `hsl(${i * 60 + 200}, 70%, 50%)`,
                    }}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <span className="text-sm text-gray-400">
                <span className="text-white font-semibold">247 000+</span>{" "}
                Canadiens nous font confiance
              </span>
            </div>
            <div className="flex items-center gap-1">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <span key={i} className="text-amber-400 text-lg">
                    ★
                  </span>
                ))}
              <span className="text-sm text-gray-400 ml-1">
                4,9/5 (12 453 avis)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Sections */}
      <div className="section-divider" />
      <FlashDeals />
      <div className="section-divider" />
      <DestinationGrid />
      <div className="section-divider" />
      <FeaturesSection />
      <div className="section-divider" />
      <Testimonials />
      <div className="section-divider" />
      <Footer />
    </div>
  );
}
