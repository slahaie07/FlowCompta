"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass shadow-2xl py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
              V
            </div>
            <span className="text-xl font-bold text-white">
              Voyage<span className="gradient-text">Max</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { href: "/#deals", label: "Offres Flash" },
              { href: "/#destinations", label: "Destinations" },
              { href: "/#features", label: "Fonctionnalités" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-all duration-200"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Live indicator + CTA */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-gray-300">
              <span className="live-dot"></span>
              <span>2,4M offres analysées</span>
            </div>
            <Link
              href="/portal"
              className="btn-secondary text-white text-sm px-4 py-2 rounded-lg"
            >
              Se connecter
            </Link>
            <Link
              href="/portal?tab=register"
              className="btn-primary text-white text-sm px-5 py-2 rounded-lg font-semibold"
            >
              Commencer gratuitement
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="flex flex-col gap-1.5 w-6">
              <span
                className={`block h-0.5 bg-white transition-all duration-300 ${
                  menuOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`block h-0.5 bg-white transition-all duration-300 ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 bg-white transition-all duration-300 ${
                  menuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden glass border-t border-white/10 mt-2">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-2">
            {[
              { href: "/#deals", label: "🔥 Offres Flash" },
              { href: "/#destinations", label: "🌍 Destinations" },
              { href: "/#features", label: "✨ Fonctionnalités" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition"
              >
                {item.label}
              </a>
            ))}
            <div className="border-t border-white/10 pt-3 mt-1 flex flex-col gap-2">
              <Link
                href="/portal"
                className="btn-secondary text-white text-sm px-4 py-3 rounded-lg text-center"
              >
                Se connecter
              </Link>
              <Link
                href="/portal?tab=register"
                className="btn-primary text-white text-sm px-4 py-3 rounded-lg font-semibold text-center"
              >
                Commencer gratuitement
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
