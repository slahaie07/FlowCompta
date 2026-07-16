import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VoyageMax — Les Meilleures Offres de Voyage en Temps Réel",
  description: "Découvrez les meilleures offres de voyage avec notre IA. Vols, hôtels et forfaits tout-inclus au meilleur prix garanti. Portail client exclusif.",
  keywords: "voyage, offres, vols, hôtels, forfaits, Canada, meilleur prix",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-full">{children}</body>
    </html>
  );
}
