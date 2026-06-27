"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function PortalPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") === "register" ? "register" : "login";
  const [tab, setTab] = useState<"login" | "register">(defaultTab as "login" | "register");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Login form
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  // Register form
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    newsletter: true,
    termsAccepted: false,
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      router.push("/portal/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.termsAccepted) return;
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      setSuccess(true);
      await new Promise((r) => setTimeout(r, 1000));
      router.push("/portal/dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen hero-bg flex items-center justify-center px-4">
        <div className="glass-strong rounded-3xl p-10 text-center max-w-md w-full">
          <div className="text-6xl mb-4 animate-float">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Bienvenue dans VoyageMax!
          </h2>
          <p className="text-gray-400">
            Votre compte a été créé. Redirection vers votre tableau de bord...
          </p>
          <div className="mt-4 flex justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-bg flex flex-col">
      {/* Back */}
      <div className="p-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition text-sm"
        >
          ← Retour à l'accueil
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl">
                V
              </div>
              <span className="text-2xl font-bold text-white">
                Voyage<span className="gradient-text">Max</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm">
              {tab === "login"
                ? "Connectez-vous pour accéder à vos offres exclusives"
                : "Créez votre compte et économisez dès aujourd'hui"}
            </p>
          </div>

          {/* Card */}
          <div className="glass-strong rounded-3xl p-8 shadow-2xl">
            {/* Tabs */}
            <div className="flex gap-1 mb-6 p-1 glass rounded-xl">
              <button
                onClick={() => setTab("login")}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  tab === "login"
                    ? "tab-active shadow"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Se connecter
              </button>
              <button
                onClick={() => setTab("register")}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  tab === "register"
                    ? "tab-active shadow"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Créer un compte
              </button>
            </div>

            {/* Social login */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: "Google", icon: "G", color: "from-red-500 to-orange-400" },
                { label: "Apple", icon: "🍎", color: "from-gray-600 to-gray-800" },
              ].map((social) => (
                <button
                  key={social.label}
                  className="btn-secondary text-white text-sm py-3 rounded-xl flex items-center justify-center gap-2 font-medium"
                >
                  <span
                    className={`w-5 h-5 rounded bg-gradient-to-br ${social.color} flex items-center justify-center text-xs text-white font-bold`}
                  >
                    {social.icon}
                  </span>
                  Continuer avec {social.label}
                </button>
              ))}
            </div>

            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center">
                <span className="glass px-3 text-xs text-gray-500">
                  ou par email
                </span>
              </div>
            </div>

            {/* Login form */}
            {tab === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 ml-1">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    required
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    placeholder="votre@email.com"
                    className="search-input w-full px-4 py-3 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-gray-400 ml-1">
                      Mot de passe
                    </label>
                    <a
                      href="#"
                      className="text-xs text-blue-400 hover:text-blue-300 transition"
                    >
                      Mot de passe oublié?
                    </a>
                  </div>
                  <input
                    type="password"
                    required
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    placeholder="••••••••"
                    className="search-input w-full px-4 py-3 rounded-xl text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Connexion en cours...
                    </>
                  ) : (
                    "Se connecter →"
                  )}
                </button>
              </form>
            )}

            {/* Register form */}
            {tab === "register" && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 ml-1">
                      Prénom
                    </label>
                    <input
                      type="text"
                      required
                      value={registerData.firstName}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          firstName: e.target.value,
                        })
                      }
                      placeholder="Marie"
                      className="search-input w-full px-4 py-3 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 ml-1">
                      Nom
                    </label>
                    <input
                      type="text"
                      required
                      value={registerData.lastName}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          lastName: e.target.value,
                        })
                      }
                      placeholder="Tremblay"
                      className="search-input w-full px-4 py-3 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 ml-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, email: e.target.value })
                    }
                    placeholder="votre@email.com"
                    className="search-input w-full px-4 py-3 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 ml-1">
                    Téléphone (optionnel)
                  </label>
                  <input
                    type="tel"
                    value={registerData.phone}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, phone: e.target.value })
                    }
                    placeholder="+1 (514) 000-0000"
                    className="search-input w-full px-4 py-3 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 ml-1">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        password: e.target.value,
                      })
                    }
                    placeholder="8 caractères minimum"
                    className="search-input w-full px-4 py-3 rounded-xl text-sm"
                  />
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5">
                      <input
                        type="checkbox"
                        checked={registerData.newsletter}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            newsletter: e.target.checked,
                          })
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          registerData.newsletter
                            ? "bg-blue-500 border-blue-500"
                            : "border-gray-600 bg-transparent"
                        }`}
                      >
                        {registerData.newsletter && (
                          <span className="text-white text-xs">✓</span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 leading-relaxed">
                      📧 Recevoir les offres exclusives et alertes de prix (vous
                      pouvez vous désabonner à tout moment)
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="relative mt-0.5">
                      <input
                        type="checkbox"
                        required
                        checked={registerData.termsAccepted}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            termsAccepted: e.target.checked,
                          })
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          registerData.termsAccepted
                            ? "bg-blue-500 border-blue-500"
                            : "border-gray-600 bg-transparent"
                        }`}
                      >
                        {registerData.termsAccepted && (
                          <span className="text-white text-xs">✓</span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 leading-relaxed">
                      J'accepte les{" "}
                      <a href="#" className="text-blue-400 hover:underline">
                        conditions d'utilisation
                      </a>{" "}
                      et la{" "}
                      <a href="#" className="text-blue-400 hover:underline">
                        politique de confidentialité
                      </a>
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading || !registerData.termsAccepted}
                  className="btn-primary w-full text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Création du compte...
                    </>
                  ) : (
                    "🚀 Créer mon compte gratuitement"
                  )}
                </button>

                {/* Benefits */}
                <div className="glass rounded-xl p-4">
                  <p className="text-xs font-semibold text-white mb-2">
                    ✨ Inclus avec votre compte:
                  </p>
                  <ul className="space-y-1">
                    {[
                      "💰 500 points de bienvenue (valeur 50$)",
                      "🔔 Alertes de prix illimitées",
                      "🤖 Planificateur IA gratuit",
                      "📱 App mobile exclusive",
                    ].map((b) => (
                      <li key={b} className="text-xs text-gray-400">
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </form>
            )}
          </div>

          <p className="text-center text-xs text-gray-600 mt-6">
            🔒 Vos données sont protégées par chiffrement SSL 256-bit
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PortalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen hero-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PortalPageContent />
    </Suspense>
  );
}
