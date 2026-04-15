import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/hooks/useAuth";

// Inter for body text - modern, clean
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Fraunces for headings - elegant, editorial feel
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Akanut — Recettes Saines & Personnalisées",
  description: "Générez des recettes délicieuses et nutritives avec les ingrédients que vous avez. Application de cuisine intelligente avec filtres diététiques, nutrition et favoris.",
  keywords: ["cuisine", "recettes", "sain", "nutrition", "ingrédients", "végétarien", "sans gluten", "recettes rapides", "akanut"],
  authors: [{ name: "Akanut" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
  openGraph: {
    title: "Akanut — Recettes Saines",
    description: "Transformez vos ingrédients en recettes délicieuses avec calcul nutritionnel automatique",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Akanut",
    description: "Des recettes saines avec vos ingrédients",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#2d5a3d" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Akanut" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
      </head>
      <body
        className={`${inter.variable} ${fraunces.variable} antialiased bg-background text-foreground font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <I18nProvider>
              {children}
              <Toaster />
            </I18nProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
