import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Guia Brechó Admin",
  description: "Administração do Guia Brechó"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-background text-textDark">{children}</body>
    </html>
  );
}
