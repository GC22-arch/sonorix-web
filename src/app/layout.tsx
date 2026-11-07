import type { Metadata, Viewport } from "next";
import { Orbitron } from "next/font/google";
import { Credit } from "@/shared/components/credit";
import { PwaRegister } from "@/shared/components/pwa-register";
import "./globals.css";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["600", "800"], variable: "--font-orbitron" });

export const metadata: Metadata = {
  title: "Sonorix",
  description: "Dictado por voz con IA · TECH // SOUND · by GC",
  icons: { icon: "/icon.svg", apple: "/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "Sonorix", statusBarStyle: "black-translucent" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#06070d",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={orbitron.variable}>
      <body className="flex min-h-dvh flex-col font-sans">
        <div className="flex-1">{children}</div>
        <Credit />
        <PwaRegister />
      </body>
    </html>
  );
}
