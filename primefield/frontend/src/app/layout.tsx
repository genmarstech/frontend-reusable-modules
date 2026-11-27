import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Motion from "@/components/Motion";
import "./globals.css";
import "./enhance.css";

// Fonts are self-hosted at build time, so a visitor's browser never
// contacts Google and the text does not jump when the font arrives.
const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["500", "700", "800"], variable: "--font-bricolage" });
const body = Instrument_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-instrument" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.primefieldagricultureltd.com"),
  title: { default: "Prime Field Agriculture", template: "%s · Prime Field Agriculture" },
  description: "Prime Field Agriculture Limited exports coffee, nuts, spices, pulses, oils and sisal fibre from Kenya and Tanzania.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <Header />
        <main id="top">{children}</main>
        <Footer />
        <Motion />
      </body>
    </html>
  );
}
