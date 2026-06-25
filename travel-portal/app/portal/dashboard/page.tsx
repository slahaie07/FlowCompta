"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { destinations, flashDeals } from "@/lib/data";
import { formatCountdown, getRandomFluctuation } from "@/lib/utils";

const SECTIONS = [
  { id: "home", label: "Tableau de bord", icon: "🏠" },
  { id: "trips", label: "Mes voyages", icon: "✈️" },
  { id: "alerts", label: "Alertes prix", icon: "🔔" },
  { id: "points", label: "Mes points", icon: "⭐" },
  { id: "planner", label: "Planificateur IA", icon: "🤖" },
  { id: "profile", label: "Mon profil", icon: "👤" },
];

const UPCOMING = [
  {
    id: 1,
    dest: "Bali, Indonésie",
    emoji: "🌴",
    date: "15 Juil 2026",
    price: 899,
    status: "Confirmé",
    ref: "VM-2026-001",
    days: 20,
  },
];

const PAST = [
  {
    id: 1,
    dest: "Paris, France",
    emoji: "🗼",
    date: "12 Mar 2026",
    price: 649,
    status: "Complété",
    ref: "VM-2025-047",
    rating: 5,
  },
  {
    id: 2,
    dest: "Cancún, Mexique",
    emoji: "🌊",
    date: "28 Jan 2026",
    price: 1099,
    status: "Complété",
    ref: "VM-2024-189",
    rating: 4,
  },
];

const ALERTS = [
  { id: 1, dest: "Tokyo, Japon", emoji: "🌸", target: 1000, current: 1249, active: true },
  { id: 2, dest: "Maldives", emoji: "🏝️", target: 1500, current: 1899, active: true },
  { id: 3, dest: "New York", emoji: "🗽", target: 400, current: 389, active: false },
];

export default function Dashboard() {
  const [section, setSection] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [points, setPoints] = useState(2847);
  const [plannerInput, setPlannerInput] = useState("");
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [itinerary, setItinerary] = useState<null | string[]>(null);
  const [alertPrices, setAlertPrices] = useState<Record<number, number>>(
    Object.fromEntries(ALERTS.map((a) => [a.id, a.current]))
  );

  // Simulate live prices in alert
  useEffect(() => {
    const interval = setInterval(() => {
      setAlertPrices((prev) => {
        const id = ALERTS[Math.floor(Math.random() * ALERTS.length)].id;
        const base = ALERTS.find((a) => a.id === id)!.current;
        return { ...prev, [id]: getRandomFluctuation(base) };
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const generateItinerary = async () => {
    if (!plannerInput.trim()) return;
    setPlannerLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setItinerary([
      `Jour 1 — Arrivée et découverte du centre-ville. Hôtel: Boutique 4★ (inclus).`,
      `Jour 2 — Visite des sites emblématiques. Tour guidé VIP en matinée.`,
      `Jour 3 — Excursion en dehors de la ville. Déjeuner traditionnel inclus.`,
      `Jour 4 — Journée plage / spa / activités selon préférence.`,
      `Jour 5 — Shopping et marché local. Dîner gastronomique.`,
      `Jour 6 — Excursion optionnelle ou temps libre. Soirée culturelle.`,
      `Jour 7 — Départ. Transfert aéroport inclus.`,
    ]);
    setPlannerLoading(false);
  };

  return (
    <div className="min-h-screen hero-bg flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 glass border-r border-white/5 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:block flex-shrink-0`}
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 p-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold">
              V
            </div>
            <span className="text-lg font-bold text-white">
              Voyage<span className="gradient-text">Max</span>
            </span>
          </Link>

          {/* User info */}
          <div className="glass rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold">
                MT
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Marie Tremblay</p>
                <p className="text-xs text-gray-500">membre@email.com</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Points Voyageur</p>
                <p className="text-lg font-bold text-amber-400">
                  ⭐ {points.toLocaleString("fr-CA")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Niveau</p>
                <p className="text-sm font-bold text-violet-400">🥇 Or</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSection(s.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                  section === s.id
                    ? "tab-active"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <span className="text-lg">{s.icon}</span>
                {s.label}
                {s.id === "alerts" && (
                  <span className="ml-auto bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {ALERTS.filter((a) => a.active).length}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Bottom */}
          <div className="pt-4 border-t border-white/5">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-white hover:bg-white/10 transition"
            >
              <span>🏠</span> Retour au site
            </Link>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition">
              <span>🚪</span> Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-auto">
        {/* Top bar */}
        <header className="glass border-b border-white/5 px-6 py-4 flex items-center gap-4 sticky top-0 z-20">
          <button
            className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">
              {SECTIONS.find((s) => s.id === section)?.icon}{" "}
              {SECTIONS.find((s) => s.id === section)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-full text-xs text-gray-300">
              <span className="live-dot"></span>
              Offres en direct
            </div>
            <Link
              href="/"
              className="btn-primary text-white text-sm px-4 py-2 rounded-xl font-semibold"
            >
              + Nouveau voyage
            </Link>
          </div>
        </header>

        <div className="flex-1 p-6">
          {/* Dashboard home */}
          {section === "home" && (
            <div className="space-y-6">
              {/* Welcome */}
              <div className="glass rounded-2xl p-6 bg-gradient-to-br from-blue-600/10 to-violet-600/10">
                <h2 className="text-xl font-bold text-white mb-1">
                  Bonjour, Marie! 👋
                </h2>
                <p className="text-gray-400 text-sm">
                  Vous avez 1 voyage à venir dans{" "}
                  <span className="text-white font-semibold">20 jours</span>.
                  Votre prochaine aventure à Bali vous attend!
                </p>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Voyages réservés", value: "3", icon: "✈️", color: "text-blue-400" },
                  { label: "Points gagnés", value: "2 847", icon: "⭐", color: "text-amber-400" },
                  { label: "Économies totales", value: "1 440$", icon: "💰", color: "text-green-400" },
                  { label: "Alertes actives", value: "2", icon: "🔔", color: "text-violet-400" },
                ].map((stat, i) => (
                  <div key={i} className="glass rounded-2xl p-4">
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className={`text-xl font-black ${stat.color}`}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Upcoming trip */}
              {UPCOMING.map((trip) => (
                <div
                  key={trip.id}
                  className="glass rounded-2xl p-6 border border-blue-500/20"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="badge bg-green-500/20 text-green-400 border border-green-500/20 mb-2">
                        ✅ {trip.status}
                      </div>
                      <h3 className="text-xl font-bold text-white">
                        {trip.emoji} {trip.dest}
                      </h3>
                      <p className="text-sm text-gray-400">
                        📅 {trip.date} · Réf: {trip.ref}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Prix payé</p>
                      <p className="text-2xl font-black text-white">
                        {trip.price}$
                      </p>
                      <p className="text-xs text-green-400">Économisé 400$</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-primary text-white text-sm px-4 py-2 rounded-lg">
                      📋 Voir les détails
                    </button>
                    <button className="btn-secondary text-white text-sm px-4 py-2 rounded-lg">
                      📱 Carte d'embarquement
                    </button>
                    <button className="btn-secondary text-white text-sm px-4 py-2 rounded-lg">
                      🧳 Check-list voyage
                    </button>
                  </div>
                </div>
              ))}

              {/* Recommended deals */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">
                  🎯 Offres Recommandées Pour Vous
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {destinations.slice(0, 2).map((dest) => (
                    <div key={dest.id} className="glass rounded-xl p-4 flex gap-4 card-hover">
                      <img
                        src={dest.image}
                        alt={dest.name}
                        className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-sm">
                          {dest.emoji} {dest.name}
                        </h4>
                        <p className="text-xs text-gray-400 mb-2">
                          {dest.duration} · {dest.includes.join(", ")}
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs text-gray-500 line-through">
                              {dest.originalPrice}$
                            </span>
                            <span className="text-lg font-black text-white ml-2">
                              {dest.price}$
                            </span>
                          </div>
                          <button className="btn-primary text-white text-xs px-3 py-1.5 rounded-lg">
                            Réserver
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Trips section */}
          {section === "trips" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-gray-400 mb-3 uppercase tracking-wider text-xs">
                  Voyage à venir
                </h3>
                {UPCOMING.map((trip) => (
                  <div key={trip.id} className="glass rounded-2xl p-5 mb-3 border border-blue-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{trip.emoji}</div>
                        <div>
                          <h4 className="font-bold text-white">{trip.dest}</h4>
                          <p className="text-sm text-gray-400">
                            {trip.date} · {trip.ref}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="badge bg-green-500/20 text-green-400 border border-green-500/20">
                          ✅ Confirmé
                        </span>
                        <span className="text-xl font-black text-white">
                          {trip.price}$
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-400 mb-3 uppercase tracking-wider text-xs">
                  Voyages passés
                </h3>
                {PAST.map((trip) => (
                  <div key={trip.id} className="glass rounded-2xl p-5 mb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{trip.emoji}</div>
                        <div>
                          <h4 className="font-bold text-white">{trip.dest}</h4>
                          <p className="text-sm text-gray-400">
                            {trip.date} · {trip.ref}
                          </p>
                          <div className="flex gap-0.5 mt-1">
                            {Array(trip.rating)
                              .fill(0)
                              .map((_, i) => (
                                <span key={i} className="text-amber-400 text-sm">★</span>
                              ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="badge bg-gray-500/20 text-gray-400 border border-gray-500/20">
                          Complété
                        </span>
                        <span className="text-xl font-black text-white">
                          {trip.price}$
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alerts section */}
          {section === "alerts" && (
            <div className="space-y-4">
              <div className="glass-strong rounded-2xl p-5 border border-blue-500/20">
                <p className="text-sm text-gray-400 mb-1">
                  🔔 Recevez une notification instantanée dès que le prix baisse sous votre cible.
                </p>
              </div>
              {ALERTS.map((alert) => {
                const current = alertPrices[alert.id];
                const reached = current <= alert.target;
                return (
                  <div key={alert.id} className="glass rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{alert.emoji}</span>
                        <div>
                          <h4 className="font-bold text-white">{alert.dest}</h4>
                          <p className="text-sm text-gray-400">
                            Cible: <span className="text-white font-semibold">{alert.target}$</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Prix actuel</p>
                        <p
                          className={`text-xl font-black transition-colors ${
                            reached ? "text-green-400" : "text-white"
                          }`}
                        >
                          {current}$
                        </p>
                        {reached ? (
                          <span className="badge bg-green-500/20 text-green-400 border border-green-500/20 text-xs">
                            🎯 Cible atteinte!
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">
                            Encore {current - alert.target}$ à baisser
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              <button className="btn-primary text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2">
                <span>+</span>
                <span>Ajouter une alerte</span>
              </button>
            </div>
          )}

          {/* Points section */}
          {section === "points" && (
            <div className="space-y-5">
              <div className="glass rounded-2xl p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Vos Points Voyageur</p>
                    <p className="text-5xl font-black text-amber-400">
                      {points.toLocaleString("fr-CA")}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      ≈ <span className="text-white font-semibold">{Math.round(points * 0.01)}$</span> de valeur
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Statut</p>
                    <p className="text-2xl font-black text-violet-400">🥇 Or</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(5000 - (points % 5000)).toLocaleString()} pts vers Platine
                    </p>
                  </div>
                </div>
                <div className="h-2 glass rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all"
                    style={{ width: `${(points % 5000) / 50}%` }}
                  />
                </div>
              </div>

              <div>
                <h3 className="font-bold text-white mb-3">Historique des points</h3>
                {[
                  { action: "Réservation Bali", points: 899, date: "Il y a 3 jours", type: "+" },
                  { action: "Réservation Paris", points: 649, date: "Il y a 3 mois", type: "+" },
                  { action: "Bonus inscription", points: 500, date: "Il y a 6 mois", type: "+" },
                  { action: "Échangé contre réduction", points: 200, date: "Il y a 8 mois", type: "-" },
                ].map((h, i) => (
                  <div key={i} className="flex items-center justify-between glass rounded-xl p-4 mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {h.type === "+" ? "⭐" : "🔄"}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-white">{h.action}</p>
                        <p className="text-xs text-gray-500">{h.date}</p>
                      </div>
                    </div>
                    <span
                      className={`font-bold ${
                        h.type === "+" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {h.type}{h.points} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Planner */}
          {section === "planner" && (
            <div className="space-y-5 max-w-2xl">
              <div className="glass-strong rounded-2xl p-6 bg-gradient-to-br from-violet-500/10 to-blue-500/5">
                <h2 className="text-xl font-bold text-white mb-2">
                  🤖 Planificateur de Voyage IA
                </h2>
                <p className="text-sm text-gray-400">
                  Décrivez votre voyage idéal et notre IA génère un itinéraire
                  complet et personnalisé en quelques secondes.
                </p>
              </div>

              <div className="glass rounded-2xl p-5">
                <label className="block text-sm font-medium text-white mb-3">
                  Décrivez votre voyage:
                </label>
                <textarea
                  value={plannerInput}
                  onChange={(e) => setPlannerInput(e.target.value)}
                  placeholder="Ex: 7 jours à Bali pour un couple, budget 2000$, on aime la plage, la culture et les spas. On part en juillet..."
                  className="search-input w-full px-4 py-3 rounded-xl text-sm h-28 resize-none"
                />
                <button
                  onClick={generateItinerary}
                  disabled={plannerLoading || !plannerInput.trim()}
                  className="btn-primary text-white font-bold px-6 py-3 rounded-xl mt-3 flex items-center gap-2 disabled:opacity-50"
                >
                  {plannerLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      IA en cours de génération...
                    </>
                  ) : (
                    <>✨ Générer mon itinéraire</>
                  )}
                </button>
              </div>

              {itinerary && (
                <div className="glass rounded-2xl p-5">
                  <h3 className="font-bold text-white mb-4">
                    📋 Votre Itinéraire Personnalisé
                  </h3>
                  <div className="space-y-2">
                    {itinerary.map((day, i) => (
                      <div
                        key={i}
                        className="flex gap-3 p-3 glass rounded-xl"
                      >
                        <div className="w-7 h-7 rounded-full bg-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs flex-shrink-0">
                          {i + 1}
                        </div>
                        <p className="text-sm text-gray-300">{day}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button className="btn-primary text-white text-sm px-4 py-2 rounded-lg">
                      💾 Sauvegarder
                    </button>
                    <button className="btn-secondary text-white text-sm px-4 py-2 rounded-lg">
                      📤 Partager
                    </button>
                    <button className="btn-secondary text-white text-sm px-4 py-2 rounded-lg">
                      ✈️ Réserver ce voyage
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profile */}
          {section === "profile" && (
            <div className="space-y-5 max-w-lg">
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-2xl">
                    MT
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Marie Tremblay</h3>
                    <p className="text-gray-400 text-sm">Membre depuis janvier 2025</p>
                    <p className="text-violet-400 text-sm font-semibold">🥇 Statut Or</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { label: "Prénom", value: "Marie" },
                    { label: "Nom", value: "Tremblay" },
                    { label: "Email", value: "marie.t@example.com" },
                    { label: "Téléphone", value: "+1 (514) 555-0123" },
                    { label: "Ville", value: "Montréal, QC" },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="block text-xs text-gray-500 mb-1.5">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        defaultValue={field.value}
                        className="search-input w-full px-4 py-3 rounded-xl text-sm"
                      />
                    </div>
                  ))}
                  <button className="btn-primary text-white font-bold px-6 py-3 rounded-xl w-full">
                    💾 Sauvegarder les modifications
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
