"use client";

import { useState, useEffect, useRef } from "react";
import { destinations, categories } from "@/lib/data";
import { getRandomFluctuation } from "@/lib/utils";

export default function DestinationGrid() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [prices, setPrices] = useState<Record<number, number>>(
    Object.fromEntries(destinations.map((d) => [d.id, d.price]))
  );
  const [priceChanges, setPriceChanges] = useState<Record<number, "up" | "down" | null>>(
    {}
  );
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Live price simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const id = destinations[Math.floor(Math.random() * destinations.length)].id;
      setPrices((prev) => {
        const base = destinations.find((d) => d.id === id)!.price;
        const next = getRandomFluctuation(base);
        setPriceChanges((c) => ({ ...c, [id]: next < prev[id] ? "down" : "up" }));
        const t = setTimeout(
          () => setPriceChanges((c) => ({ ...c, [id]: null })),
          2000
        );
        timeoutsRef.current.push(t);
        return { ...prev, [id]: next };
      });
    }, 2500);
    return () => {
      clearInterval(interval);
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, []);

  const filtered =
    activeCategory === "all"
      ? destinations
      : destinations.filter((d) => d.category === activeCategory);

  return (
    <section id="destinations" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            🌍 Destinations <span className="gradient-text">Les Plus Populaires</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Prix mis à jour en temps réel · Meilleure offre garantie
          </p>
        </div>

        {/* Category filter */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === cat.id
                  ? "tab-active shadow-lg"
                  : "glass text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((dest, idx) => {
            const currentPrice = prices[dest.id];
            const change = priceChanges[dest.id];

            return (
              <div
                key={dest.id}
                className="glass rounded-2xl overflow-hidden card-hover cursor-pointer group"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  {/* Tag */}
                  <div
                    className={`absolute top-3 left-3 ${dest.tagColor} text-white text-xs font-bold px-3 py-1 rounded-full`}
                  >
                    {dest.tag}
                  </div>

                  {/* Availability */}
                  {dest.availability <= 4 && (
                    <div className="absolute top-3 right-3 bg-red-500/80 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <span className="animate-blink">🔴</span>
                      {dest.availability} places
                    </div>
                  )}

                  {/* Price change indicator */}
                  {change && (
                    <div
                      className={`absolute bottom-3 right-3 font-bold text-sm rounded-full px-2 py-1 ${
                        change === "down"
                          ? "bg-green-500/90 text-white"
                          : "bg-red-500/90 text-white"
                      }`}
                    >
                      {change === "down" ? "▼ Prix baisse!" : "▲ Prix monte"}
                    </div>
                  )}

                  {/* Bottom info */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-bold text-xl">
                      {dest.emoji} {dest.name}
                    </h3>
                    <p className="text-gray-300 text-sm">{dest.duration}</p>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  {/* Includes */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {dest.includes.map((inc) => (
                      <span
                        key={inc}
                        className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full"
                      >
                        {inc}
                      </span>
                    ))}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex text-amber-400 text-sm">
                      {"★".repeat(Math.floor(dest.rating))}
                    </div>
                    <span className="text-sm font-semibold text-white">
                      {dest.rating}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({dest.reviews.toLocaleString("fr-CA")} avis)
                    </span>
                  </div>

                  {/* Price + CTA */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-500 line-through block">
                        {dest.originalPrice}$ CAD
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`text-2xl font-black transition-colors ${
                            change === "down"
                              ? "text-green-400"
                              : change === "up"
                              ? "text-red-400"
                              : "text-white"
                          }`}
                        >
                          {currentPrice}$
                        </span>
                        <span className="text-xs text-gray-400">CAD/pers.</span>
                      </div>
                      <span className="text-xs text-green-400 font-semibold">
                        Économisez {dest.originalPrice - currentPrice}$
                      </span>
                    </div>
                    <button className="btn-primary text-white text-sm font-bold px-5 py-2.5 rounded-xl">
                      Voir l'offre
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Show more */}
        <div className="text-center mt-10">
          <a
            href="/search"
            className="btn-secondary text-white font-semibold px-8 py-3 rounded-xl inline-flex items-center gap-2"
          >
            <span>🔍</span>
            <span>Explorer toutes les destinations</span>
          </a>
        </div>
      </div>
    </section>
  );
}
