"use client";

import { useState, useEffect } from "react";

const tickerItems = [
  { text: "✈️  Marie T. vient de réserver Bali pour 899$", type: "booking" },
  { text: "🔥  FLASH: Paris à partir de 649$ — 7 places restantes!", type: "deal" },
  { text: "📉  Le prix Miami vient de baisser de 23%", type: "drop" },
  { text: "✈️  Jean-L. vient de réserver Tokyo pour 1 249$", type: "booking" },
  { text: "⚡  Offre Cancún expire dans 2h — seulement 2 places!", type: "urgent" },
  { text: "🌟  Sophie L. vient d'économiser 487$ sur son vol Paris", type: "saving" },
  { text: "📉  Dubai vient de baisser: maintenant 1 399$ (-26%)", type: "drop" },
  { text: "✈️  147 personnes consultent Santorin en ce moment", type: "activity" },
  { text: "🔔  Alerte Prix: Mexique toute inclusion à 299$ (limité!)", type: "deal" },
  { text: "✅  2 247 réservations confirmées aujourd'hui", type: "stat" },
];

export default function LiveTicker() {
  const [liveCount, setLiveCount] = useState(1847);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount((c) => c + Math.floor(Math.random() * 3));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const doubled = [...tickerItems, ...tickerItems];

  return (
    <div className="bg-gradient-to-r from-blue-900/40 via-violet-900/40 to-blue-900/40 border-y border-white/5 py-2.5 overflow-hidden">
      <div className="flex items-center gap-6">
        <div className="flex-shrink-0 pl-4 flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-full px-3 py-1 ml-2">
          <span className="live-dot" style={{ background: "#ef4444" }}></span>
          <span className="text-xs font-bold text-red-400 uppercase tracking-wider">LIVE</span>
          <span className="text-xs text-red-300">{liveCount.toLocaleString("fr-CA")}</span>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="flex gap-12 animate-ticker whitespace-nowrap">
            {doubled.map((item, i) => (
              <span
                key={i}
                className={`text-xs font-medium flex-shrink-0 ${
                  item.type === "deal" || item.type === "urgent"
                    ? "text-amber-400"
                    : item.type === "drop"
                    ? "text-green-400"
                    : item.type === "saving"
                    ? "text-emerald-400"
                    : "text-gray-300"
                }`}
              >
                {item.text}
                {i < doubled.length - 1 && (
                  <span className="text-white/20 ml-12">•</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
