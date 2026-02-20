import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const bodyFont = Manrope({ subsets: ["latin", "latin-ext"], variable: "--font-body", display: "swap" });
const displayFont = Fraunces({ subsets: ["latin", "latin-ext"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: "Guia Brechó Admin",
  description: "Administração do Guia Brechó",
  themeColor: "#f7f2eb",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body className="bg-background text-textDark antialiased">
        <a href="#main-content" className="skip-link">
          Pular para o conteúdo
        </a>
        <div id="main-content" className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
