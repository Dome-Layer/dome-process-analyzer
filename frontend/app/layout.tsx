import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Process Analyzer — Dome",
  description: "Map, govern, and automate your business processes.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-64.png", type: "image/png", sizes: "64x64" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
};

// Runs before first paint — prevents theme flash. Reads cookie first (shared
// across all *.domelayer.com subdomains), then falls back to localStorage.
const themeScript = `
(function() {
  try {
    var cookie = document.cookie.split('; ').find(function(r){ return r.startsWith('dome-theme='); });
    var cookieVal = cookie ? cookie.split('=')[1] : null;
    var saved = (cookieVal === 'dark' || cookieVal === 'light') ? cookieVal : localStorage.getItem('dome-theme');
    var theme = (saved === 'dark' || saved === 'light')
      ? saved
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
          <Header />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
