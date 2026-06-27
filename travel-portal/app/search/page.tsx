"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { destinations } from "@/lib/data";
import { getRandomFluctuation } from "@/lib/utils";

function SearchContent() {
  const searchParams = useSearchParams();
  const dest = searchParams.get("dest") || "";
  const type = searchParams.get("type") || "forfait";
  const travelers = Number(searchParams.get("travelers") || 2);

  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("price");
  const [results, setResults] = useState(destinations);
  const [prices, setPrices] = useState<Record<number, number>>(
    Object.fromEntries(destinations.map((d) => [d.id, d.price]))
  );

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const id = destinations[Math.floor(Math.random() * destinations.length)].id;
      setPrices((prev) => ({
        ...prev,
        [id]: getRandomFluctuation(destinations.find((d) => d.id === id)!.price),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const sorted = [...results].sort((a, b) => {
    if (sortBy === "price") return prices[a.id] - prices[b.id];
    if (sortBy === "rating") return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="min-h-screen hero-bg">
      {/* Header */}
      <header className="glass border-b border-white/5 px-4 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold">
              V
            </div>
            <span className="font-bold text-white">
              Voyage<span className="gradient-text">Max</span>
            </span>
          </Link>

          <div className="flex-1 max-w-sm">
            <input
              type="text"
              defaultValue={dest}
              placeholder="Modifier la destination..."
              className="search-input w-full px-4 py-2 rounded-xl text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full text-xs text-gray-300">
              <span className="live-dot"></span>
              Prix en direct
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search info */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {dest
                ? `Résultats pour "${dest}"`
                : "Toutes les destinations"}
            </h1>
            <p className="text-sm text-gray-400">
              {loading ? "Analyse en cours..." : `${results.length} offres trouvées · ${travelers} voyageur(s)`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Trier par:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="search-input px-3 py-2 rounded-xl text-sm"
            >
              <option value="price">Prix croissant</option>
              <option value="rating">Meilleures notes</option>
            </select>
          </div>
        </div>

        {loading ? (
          /* Loading skeleton */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="glass rounded-2xl overflow-hidden">
                  <div className="skeleton h-48 w-full" />
                  <div className="p-4 space-y-3">
                    <div className="skeleton h-4 rounded-full w-3/4" />
                    <div className="skeleton h-3 rounded-full w-1/2" />
                    <div className="skeleton h-8 rounded-xl w-full" />
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sorted.map((result) => (
              <div key={result.id} className="glass rounded-2xl overflow-hidden card-hover group">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={result.image}
                    alt={result.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div
                    className={`absolute top-3 left-3 ${result.tagColor} text-white text-xs font-bold px-2 py-1 rounded-full`}
                  >
                    -{result.discount}%
                  </div>
                  <div className="absolute bottom-3 left-3 text-white">
                    <h3 className="font-bold">
                      {result.emoji} {result.name}
                    </h3>
                    <p className="text-xs text-gray-300">{result.duration}</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-amber-400 text-sm">
                      {"★".repeat(Math.floor(result.rating))}
                    </span>
                    <span className="text-sm text-white">{result.rating}</span>
                    <span className="text-xs text-gray-500">
                      ({result.reviews.toLocaleString("fr-CA")})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-500 line-through block">
                        {result.originalPrice * travelers}$
                      </span>
                      <span className="text-xl font-black text-white">
                        {prices[result.id] * travelers}$
                      </span>
                      <span className="text-xs text-gray-400 ml-1">
                        pour {travelers} pers.
                      </span>
                    </div>
                    <Link
                      href="/portal"
                      className="btn-primary text-white text-sm font-bold px-4 py-2 rounded-xl"
                    >
                      Réserver
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen hero-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
