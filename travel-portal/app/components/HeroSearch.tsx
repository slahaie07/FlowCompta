"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { liveSearchSuggestions, popularSearches } from "@/lib/data";
import { getRandomFluctuation } from "@/lib/utils";

const SEARCH_TABS = [
  { id: "forfait", label: "Forfaits", icon: "🌴" },
  { id: "vol", label: "Vols", icon: "✈️" },
  { id: "hotel", label: "Hôtels", icon: "🏨" },
  { id: "activite", label: "Activités", icon: "🎯" },
];

export default function HeroSearch() {
  const router = useRouter();
  const [tab, setTab] = useState("forfait");
  const [destination, setDestination] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [livePrice, setLivePrice] = useState(899);
  const [priceDir, setPriceDir] = useState<"up" | "down">("down");
  const [departure, setDeparture] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [travelers, setTravelers] = useState(2);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = liveSearchSuggestions.filter((s) =>
    destination.length > 0
      ? s.query.toLowerCase().includes(destination.toLowerCase())
      : true
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setLivePrice((p) => {
        const next = getRandomFluctuation(p);
        setPriceDir(next < p ? "down" : "up");
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async () => {
    if (!destination) {
      inputRef.current?.focus();
      return;
    }
    setSearching(true);
    await new Promise((r) => setTimeout(r, 800));
    router.push(
      `/search?dest=${encodeURIComponent(destination)}&type=${tab}&dep=${departure}&ret=${returnDate}&travelers=${travelers}`
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Live price ticker */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="glass rounded-full px-4 py-1.5 flex items-center gap-2">
          <span className="live-dot"></span>
          <span className="text-xs text-gray-400">Prix Bali en temps réel:</span>
          <span
            className={`text-sm font-bold transition-colors ${
              priceDir === "down" ? "text-green-400" : "text-red-400"
            }`}
          >
            {priceDir === "down" ? "▼" : "▲"} {livePrice}$ CAD
          </span>
        </div>
        <div className="glass rounded-full px-4 py-1.5 flex items-center gap-2">
          <span className="text-xs text-amber-400">⚡</span>
          <span className="text-xs text-gray-300">Prix garanti le plus bas</span>
        </div>
      </div>

      {/* Search card */}
      <div className="glass-strong rounded-3xl p-2 shadow-2xl">
        {/* Tabs */}
        <div className="flex gap-1 p-1 mb-2">
          {SEARCH_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                tab === t.id
                  ? "tab-active shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <span>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Search fields */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 p-2">
          {/* Destination */}
          <div className="md:col-span-2 relative">
            <label className="block text-xs text-gray-500 mb-1 ml-1">
              {tab === "vol" ? "Destination" : "Destination / Hôtel"}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                🔍
              </span>
              <input
                ref={inputRef}
                type="text"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Où voulez-vous aller?"
                className="search-input w-full pl-10 pr-4 py-3.5 rounded-xl text-sm font-medium"
              />
              {destination && (
                <button
                  onClick={() => setDestination("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Autocomplete suggestions */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 glass-strong rounded-2xl overflow-hidden z-50 shadow-2xl">
                {destination.length === 0 && (
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-xs text-gray-500 mb-2">Recherches populaires</p>
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.slice(0, 4).map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            setDestination(s);
                            setShowSuggestions(false);
                          }}
                          className="text-xs px-3 py-1 glass rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {suggestions.slice(0, 5).map((s) => (
                  <button
                    key={s.query}
                    onClick={() => {
                      setDestination(s.query);
                      setShowSuggestions(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/10 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🌍</span>
                      <div>
                        <p className="text-sm text-white font-medium">{s.query}</p>
                        <p className="text-xs text-gray-500">
                          {s.country} · {s.type}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-green-400 font-semibold">
                      {s.deals} offres
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dates */}
          <div>
            <label className="block text-xs text-gray-500 mb-1 ml-1">Départ</label>
            <input
              type="date"
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
              className="search-input w-full px-3 py-3.5 rounded-xl text-sm"
              style={{ colorScheme: "dark" }}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 ml-1">Retour</label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="search-input w-full px-3 py-3.5 rounded-xl text-sm"
              style={{ colorScheme: "dark" }}
            />
          </div>
        </div>

        {/* Bottom row: travelers + search */}
        <div className="flex items-center gap-2 p-2 pt-0">
          <div className="glass rounded-xl flex items-center gap-3 px-4 py-3 flex-1">
            <span className="text-gray-400">👤</span>
            <span className="text-sm text-gray-400">Voyageurs</span>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setTravelers((t) => Math.max(1, t - 1))}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition text-sm font-bold"
              >
                −
              </button>
              <span className="text-white font-semibold w-4 text-center">
                {travelers}
              </span>
              <button
                onClick={() => setTravelers((t) => Math.min(10, t + 1))}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition text-sm font-bold"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={searching}
            className="btn-primary text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 text-sm disabled:opacity-70 flex-shrink-0"
          >
            {searching ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"></span>
                <span>Analyse en cours...</span>
              </>
            ) : (
              <>
                <span>🔍</span>
                <span>Trouver les meilleures offres</span>
              </>
            )}
          </button>
        </div>

        {/* Trust signals */}
        <div className="flex items-center justify-center gap-6 px-4 pb-3 pt-1">
          {[
            { icon: "✅", text: "Prix garanti le plus bas" },
            { icon: "🔒", text: "Paiement sécurisé" },
            { icon: "↩️", text: "Annulation gratuite" },
          ].map((t) => (
            <span key={t.text} className="text-xs text-gray-500 flex items-center gap-1">
              <span>{t.icon}</span>
              <span>{t.text}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
