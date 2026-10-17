export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold">
                V
              </div>
              <span className="text-lg font-bold text-white">
                Voyage<span className="gradient-text">Max</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Le moteur de recherche voyage le plus intelligent du Canada.
              Prix garantis, offres exclusives, service en français.
            </p>
            <div className="flex gap-3">
              {["facebook", "instagram", "twitter", "tiktok"].map((s) => (
                <button
                  key={s}
                  className="w-8 h-8 glass rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition text-xs font-bold uppercase"
                >
                  {s[0].toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: "Voyages",
              links: ["Vols", "Hôtels", "Forfaits", "Croisières", "Voitures"],
            },
            {
              title: "Destinations",
              links: ["Mexique", "Europe", "Caraïbes", "Asie", "USA & Floride"],
            },
            {
              title: "Aide",
              links: [
                "Service client",
                "FAQ",
                "Annulations",
                "Assurance voyage",
                "Guide COVID",
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-semibold mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-gray-500 hover:text-gray-300 transition"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="glass rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1">
              <h4 className="text-white font-bold mb-1">
                🔔 Alertes Prix Exclusives
              </h4>
              <p className="text-sm text-gray-400">
                Recevez les meilleures offres directement dans votre boîte mail
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="votre@email.com"
                className="search-input px-4 py-2.5 rounded-xl text-sm flex-1 md:w-64"
              />
              <button className="btn-primary text-white text-sm font-bold px-5 py-2.5 rounded-xl whitespace-nowrap">
                S'abonner
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <p>© 2026 VoyageMax Inc. Tous droits réservés. Montréal, Canada 🍁</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-400 transition">
              Confidentialité
            </a>
            <a href="#" className="hover:text-gray-400 transition">
              Conditions
            </a>
            <a href="#" className="hover:text-gray-400 transition">
              Accessibilité
            </a>
          </div>
          <div className="flex items-center gap-2">
            <span>Paiements sécurisés:</span>
            <span className="glass px-2 py-0.5 rounded text-gray-400">VISA</span>
            <span className="glass px-2 py-0.5 rounded text-gray-400">MC</span>
            <span className="glass px-2 py-0.5 rounded text-gray-400">PayPal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
