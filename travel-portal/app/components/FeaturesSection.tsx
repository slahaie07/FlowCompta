"use client";

import { useState } from "react";
import { features, stats } from "@/lib/data";

export default function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <section id="features" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-6 text-center card-hover"
            >
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-black text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            ✨ Pourquoi Choisir{" "}
            <span className="gradient-text">VoyageMax</span>?
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            La technologie la plus avancée au service de votre voyage idéal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, i) => (
            <div
              key={i}
              className={`glass rounded-2xl p-6 card-hover cursor-pointer transition-all duration-300 ${
                activeFeature === i
                  ? "border border-blue-500/40 shadow-lg shadow-blue-500/10"
                  : ""
              }`}
              onMouseEnter={() => setActiveFeature(i)}
            >
              <div className="text-4xl mb-4">{feat.icon}</div>
              <div className="badge bg-blue-500/20 text-blue-400 border border-blue-500/20 mb-3 text-xs">
                {feat.highlight}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>

        {/* AI Planner CTA */}
        <div className="mt-12 glass rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-violet-600/10 to-pink-600/10" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="badge bg-violet-500/20 text-violet-400 border border-violet-500/20 mb-4">
                🤖 IA Exclusive
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Planificateur de Voyage par IA
              </h3>
              <p className="text-gray-400 mb-6">
                Décrivez votre voyage de rêve en quelques mots. Notre IA génère
                un itinéraire complet, optimisé et personnalisé en moins de 30
                secondes.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/portal?tab=register"
                  className="btn-primary text-white font-bold px-6 py-3 rounded-xl"
                >
                  🚀 Essayer Gratuitement
                </a>
                <a
                  href="#"
                  className="btn-secondary text-white px-6 py-3 rounded-xl"
                >
                  Voir la démo →
                </a>
              </div>
            </div>
            <div className="flex-shrink-0 glass-strong rounded-2xl p-5 w-full md:w-80">
              <p className="text-xs text-gray-500 mb-3">Exemple — Généré par IA:</p>
              <div className="space-y-2">
                {[
                  { day: "Jour 1", activity: "Arrivée · Temple Pura Besakih", icon: "🛬" },
                  { day: "Jour 2", activity: "Terrasses de riz d'Ubud", icon: "🌾" },
                  { day: "Jour 3", activity: "Plage de Seminyak · Spa", icon: "🏖️" },
                  { day: "Jour 4", activity: "Plongée · Récif de Nusa Penida", icon: "🤿" },
                  { day: "Jour 5", activity: "Coucher soleil Tanah Lot", icon: "🌅" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <span className="text-xs text-blue-400 font-semibold">
                        {item.day}
                      </span>
                      <p className="text-xs text-gray-300">{item.activity}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-center">
                <span className="text-xs text-gray-500">
                  ✨ Itinéraire Bali 7 jours · Généré en 4 secondes
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
