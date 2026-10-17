import type { Metadata } from "next";
import "./globals.css";
import {AuthCallback} from './auth-client';
import {DiagnosticCenter} from './diagnostic-center';

export const metadata: Metadata = {
  title: "Paki Diyabet Rehberim | Takip ve eğitim",
  description: "Tip 1 ve Tip 2 diyabet için kişisel sağlık günlüğü ve kaynaklı eğitim.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {capable: true, title: "Paki", statusBarStyle: "default"},
  icons: {
    apple: "/icons/icon-192.png",
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased"><AuthCallback/>{children}<DiagnosticCenter/></body>
    </html>
  );
}
