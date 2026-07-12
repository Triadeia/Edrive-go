import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Libert Drive | Painel de Marca",
  description: "Painel de branding, movimento e inteligencia do cliente da Libert Drive.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR" data-theme="night">
      <body className={sora.variable}>{children}</body>
    </html>
  );
}
