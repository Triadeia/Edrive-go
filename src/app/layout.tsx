import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Libre_Baskerville, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const libre = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-libre",
  display: "swap",
});

export const metadata: Metadata = {
  title: "eDrive Go | Movimento do Motorista Livre",
  description: "Branding Book, movimento e inteligencia do cliente da eDrive Go.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${manrope.variable} ${libre.variable}`}>{children}</body>
    </html>
  );
}
