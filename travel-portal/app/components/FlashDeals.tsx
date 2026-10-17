"use client";

import { useState, useEffect, useRef } from "react";
import { flashDeals } from "@/lib/data";
import { formatCountdown } from "@/lib/utils";

export default function FlashDeals() {
  const [timers, setTimers] = useState<Record<number, number>>(
    Object.fromEntries(flashDeals.map((d) => [d.id, d.expiresIn]))
  );
  const [flashing, setFlashing] = useState<Record<number, boolean>>({});
  const flashTimeoutsRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => {
          if (next[Number(k)] > 0) next[Number(k)]--;
        });
        return next;
      });
    }, 1000);
    return () => {
      clearInterval(interval);
      flashTimeoutsRef.current.forEach(clearTimeout);
      flashTimeoutsRef.current.clear();
    };
  }, []);

  const handleBook = (id: number) => {
    const existing = flashTimeoutsRef.current.get(id);
    if (existing) clearTimeout(existing);
    setFlashing((f) => ({ ...f, [id]: true }));
    const t = setTimeout(() => setFlashing((f) => ({ ...f, [id]: false })), 300);
    flashTimeoutsRef.current.set(id, t);
  };

  return (
    <section id="deals" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="live-dot"></span>
              <span className="text-xs font-bold text-red-400 uppercase tracking-widest">
                OFFRES FLASH EN DIRECT
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              ⚡ Saisir Avant Expiration
            </h2>
            <p className="text-gray-400 mt-2">
              Offres exclusives mises à jour en temps réel par notre IA
            </p>
          </div>
          <a
            href="/search"
            className="hidden md:flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition"
          >
            Voir toutes les offres →
          </a>
        </div>

        {/* Deals grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {flashDeals.map((deal) => {
            const time = formatCountdown(timers[deal.id] ?? deal.expiresIn);
            const savings = Math.round(
              ((deal.originalPrice - deal.price) / deal.originalPrice) * 100
            );
            const isUrgent = (timers[deal.id] ?? deal.expiresIn) < 3600;

            return (
              <div
                key={deal.id}
                className={`glass rounded-2xl p-5 card-hover relative overflow-hidden transition-all duration-300 ${
                  flashing[deal.id] ? "scale-98 brightness-110" : ""
                }`}
              >
                {/* Hot badge */}
                {isUrgent && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-red-500/20 border border-red-500/40 rounded-full px-2 py-1">
                    <span className="animate-blink">🔥</span>
                    <span className="text-xs font-bold text-red-400">URGENT</span>
                  </div>
                )}

                {/* Savings badge */}
                <div className="absolute top-0 left-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-br-xl">
                  -{savings}%
                </div>

                <div className="flex items-start gap-4 mt-2">
                  <div className="text-4xl">{deal.logo}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white text-lg leading-tight">
                        {deal.route}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                      <span>✈️ {deal.airline}</span>
                      <span>⏱ {deal.duration}</span>
                      <span
                        className={`badge ${
                          deal.class === "Business"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : deal.class === "Tout inclus"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        }`}
                      >
                        {deal.class}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>📅 {deal.departure}</span>
                      <span>·</span>
                      <span className="text-orange-400 font-medium">
                        🔴 {deal.seats} places restantes
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                  {/* Countdown */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">Expire dans:</p>
                    <div className="flex items-center gap-1">
                      <span className="countdown-digit">{time.hours}</span>
                      <span className="text-gray-500 font-bold text-sm">:</span>
                      <span className="countdown-digit">{time.minutes}</span>
                      <span className="text-gray-500 font-bold text-sm">:</span>
                      <span className="countdown-digit text-red-400">{time.seconds}</span>
                    </div>
                  </div>

                  {/* Price + CTA */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="block text-xs text-gray-500 line-through">
                        {deal.originalPrice}$
                      </span>
                      <span className="text-2xl font-black text-white">
                        {deal.price}$
                        <span className="text-xs font-normal text-gray-400 ml-1">
                          CAD/pers.
                        </span>
                      </span>
                    </div>
                    <button
                      onClick={() => handleBook(deal.id)}
                      className="btn-primary text-white font-bold px-5 py-2.5 rounded-xl text-sm whitespace-nowrap"
                    >
                      Réserver →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
