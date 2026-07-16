"use client";

import { useState } from "react";
import { testimonials } from "@/lib/data";

export default function Testimonials() {
  const [active, setActive] = useState(0);

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/5 to-transparent" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            💬 Ce Que Disent Nos{" "}
            <span className="gradient-text">Voyageurs</span>
          </h2>
          <p className="text-gray-400">
            Plus de 247 000 Canadiens nous font confiance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div
              key={t.id}
              className={`glass rounded-2xl p-6 card-hover cursor-pointer transition-all duration-300 ${
                active === i ? "border border-amber-500/30" : ""
              }`}
              onClick={() => setActive(i)}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array(t.rating)
                  .fill(0)
                  .map((_, j) => (
                    <span key={j} className="text-amber-400 text-lg">
                      ★
                    </span>
                  ))}
              </div>

              {/* Text */}
              <p className="text-gray-300 text-sm leading-relaxed mb-5 italic">
                "{t.text}"
              </p>

              {/* Savings badge */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-4">
                <span className="text-green-400 font-bold text-sm">
                  💰 Économisé: {t.savings}$ CAD
                </span>
                <span className="text-gray-500 text-xs ml-2">· {t.trip}</span>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-gray-500 text-xs">{t.location}</p>
                </div>
                <div className="ml-auto">
                  <span className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-full">
                    Vérifié ✓
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust banner */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "🏆", text: "Meilleur Prix Garanti", sub: "Ou remboursement 110%" },
            { icon: "🔐", text: "Paiement Crypté SSL", sub: "Visa, MC, PayPal acceptés" },
            { icon: "📞", text: "Support 24/7", sub: "Agents humains disponibles" },
            { icon: "✈️", text: "Partenaires Certifiés", sub: "+200 compagnies aériennes" },
          ].map((item, i) => (
            <div
              key={i}
              className="glass rounded-xl p-4 flex items-center gap-3"
            >
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-white font-semibold text-sm">{item.text}</p>
                <p className="text-gray-500 text-xs">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
