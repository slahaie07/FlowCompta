"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import type { TravelOffer, OffersPayload, OfferCategory } from "@/lib/types";

const REFRESH_MS = 2 * 60 * 1000;

const CATEGORY_CONFIG: Record<OfferCategory, { label: string; bg: string; icon: string }> = {
  flash:          { label: "Vente Flash",      bg: "bg-red-500",     icon: "⚡" },
  "last-minute":  { label: "Dernière Minute",  bg: "bg-orange-500",  icon: "🔥" },
  luxury:         { label: "Luxe",             bg: "bg-violet-600",  icon: "👑" },
  budget:         { label: "Budget",           bg: "bg-emerald-500", icon: "💰" },
};

function Countdown({ expiresAt }: { expiresAt: string }) {
  const [secs, setSecs] = useState(() =>
    Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
  );
  useEffect(() => {
    const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  if (secs <= 0) return <span className="text-red-400 text-xs font-bold">Expiré</span>;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return (
    <span className={`text-xs font-mono font-bold ${secs < 3600 ? "text-red-400 animate-pulse" : "text-orange-300"}`}>
      {h > 0 ? `${h}h ` : ""}{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}

function OfferCard({ offer }: { offer: TravelOffer }) {
  const cfg = CATEGORY_CONFIG[offer.category];
  const departure = new Date(offer.departureDate).toLocaleDateString("fr-CA", {
    day: "numeric", month: "short",
  });

  return (
    <div className="glass rounded-2xl overflow-hidden card-hover group relative flex flex-col">
      {offer.isHot && (
        <div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
          HOT
        </div>
      )}

      {/* Image */}
      <div className="relative h-44 overflow-hidden shrink-0">
        <img
          src={offer.image}
          alt={offer.destination}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className={`absolute top-3 left-3 ${cfg.bg} text-white text-xs font-bold px-2 py-1 rounded-full`}>
          {cfg.icon} {cfg.label}
        </div>
        <div className="absolute bottom-3 left-3 right-10">
          <h3 className="font-bold text-white text-sm leading-tight">
            {offer.emoji} {offer.destination}
          </h3>
          <p className="text-xs text-gray-300 mt-0.5">
            {offer.airline} · {offer.nights} nuits · départ {departure}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Hotel + stars */}
        <div className="flex items-center gap-1.5 mb-2 min-h-[20px]">
          <span className="text-amber-400 text-xs">{"★".repeat(offer.hotelStars)}</span>
          <span className="text-xs text-gray-400 truncate">{offer.hotelName}</span>
        </div>

        {/* Price row */}
        <div className="flex items-end justify-between mb-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs text-gray-500 line-through">{offer.originalPrice}$</span>
              <span className="text-red-400 text-xs font-bold">-{offer.discountPct}%</span>
            </div>
            <div>
              <span className="text-2xl font-black text-white">{offer.price}$</span>
              <span className="text-xs text-gray-400 ml-1">/ pers.</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-0.5">Expire dans</div>
            <Countdown expiresAt={offer.expiresAt} />
            {offer.seatsLeft <= 5 && (
              <div className="text-xs text-red-400 font-bold mt-0.5">
                {offer.seatsLeft} place{offer.seatsLeft > 1 ? "s" : ""} restante{offer.seatsLeft > 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {offer.includes.map(inc => (
            <span key={inc} className="text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">
              {inc}
            </span>
          ))}
        </div>

        <Link
          href="/portal"
          className="btn-primary text-white text-sm font-bold px-4 py-2 rounded-xl text-center block mt-auto"
        >
          Réserver maintenant →
        </Link>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="skeleton h-44 w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 rounded-full w-1/2" />
        <div className="skeleton h-6 rounded-full w-2/3" />
        <div className="skeleton h-3 rounded-full w-3/4" />
        <div className="skeleton h-10 rounded-xl w-full" />
      </div>
    </div>
  );
}

type TabKey = OfferCategory | "all";

export default function LiveOffersEngine() {
  const [data, setData]         = useState<OffersPayload | null>(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab]   = useState<TabKey>("all");
  const [countdown, setCountdown]   = useState(REFRESH_MS / 1000);
  const nextRefresh = useRef(Date.now() + REFRESH_MS);

  const fetchOffers = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const res = await fetch("/api/offers", { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      const payload: OffersPayload = await res.json();
      setData(payload);
      nextRefresh.current = Date.now() + REFRESH_MS;
    } catch {
      // keep previous data on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load + auto-refresh every 2 minutes
  useEffect(() => {
    fetchOffers();
    const iv = setInterval(() => fetchOffers(), REFRESH_MS);
    return () => clearInterval(iv);
  }, [fetchOffers]);

  // Countdown ticker
  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(Math.max(0, Math.round((nextRefresh.current - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const counts = (data?.offers ?? []).reduce<Record<TabKey, number>>(
    (acc, o) => { acc.all++; acc[o.category]++; return acc; },
    { all: 0, flash: 0, "last-minute": 0, luxury: 0, budget: 0 }
  );

  const tabs: Array<{ key: TabKey; label: string; icon: string }> = [
    { key: "all",          label: "Toutes",          icon: "🌍" },
    { key: "flash",        label: "Ventes Flash",    icon: "⚡" },
    { key: "last-minute",  label: "Dernière Minute", icon: "🔥" },
    { key: "luxury",       label: "Luxe",            icon: "👑" },
    { key: "budget",       label: "Budget",          icon: "💰" },
  ];

  const filtered = (data?.offers ?? []).filter(o => activeTab === "all" || o.category === activeTab);
  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;

  return (
    <section className="py-14 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="live-dot" />
              <span className="text-xs text-green-400 font-semibold uppercase tracking-widest">
                Moteur d'offres en direct
              </span>
            </div>
            <h2 className="text-3xl font-black text-white leading-tight">
              Offres <span className="gradient-text">Exclusives</span> — Live
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {data
                ? `${data.totalFound} offres disponibles · Mis à jour ${new Date(data.lastUpdated).toLocaleTimeString("fr-CA")}`
                : "Analyse des meilleures offres en cours..."}
            </p>
          </div>

          {/* Refresh controls */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="glass px-4 py-2.5 rounded-xl text-center min-w-[100px]">
              <div className="text-xs text-gray-500 mb-0.5">Prochain refresh</div>
              <div className={`font-mono font-bold text-sm ${countdown < 30 ? "text-orange-400 animate-pulse" : "text-white"}`}>
                {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
              </div>
            </div>
            <button
              onClick={() => fetchOffers(true)}
              disabled={refreshing}
              className="glass px-4 py-2.5 rounded-xl text-sm text-gray-300 hover:text-white transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <span className={`text-base ${refreshing ? "animate-spin" : ""}`}>↻</span>
              {refreshing ? "Chargement..." : "Rafraîchir"}
            </button>
          </div>
        </div>

        {/* Source badge */}
        {data && (
          <div className="inline-flex items-center gap-2 glass px-3 py-1.5 rounded-full text-xs text-gray-400 mb-6">
            <span className={data.source === "amadeus" ? "text-green-400" : "text-blue-400"}>●</span>
            {data.source === "amadeus"
              ? "Source: Amadeus GDS — offres réelles en direct"
              : "Mode démo · Connectez AMADEUS_CLIENT_ID pour les offres réelles"}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/20"
                  : "glass text-gray-400 hover:text-white"
              }`}
            >
              {tab.icon} {tab.label}
              {counts[tab.key] > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-white/20" : "bg-white/10"}`}>
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-500 py-16">Aucune offre dans cette catégorie</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(offer => <OfferCard key={offer.id} offer={offer} />)}
          </div>
        )}

        {/* Footer note */}
        <p className="text-center text-xs text-gray-600 mt-8">
          Rafraîchissement automatique toutes les 2 minutes · Prix en CAD toutes taxes incluses ·{" "}
          {data?.source === "amadeus"
            ? "Alimenté par Amadeus GDS"
            : "Pour activer les offres réelles: ajouter AMADEUS_CLIENT_ID + AMADEUS_CLIENT_SECRET dans .env.local"}
        </p>
      </div>
    </section>
  );
}
