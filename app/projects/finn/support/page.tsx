import { theme } from "@/theme";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Finn - Support",
  description: "Support page for Finn - Personal Finance Manager",
};

export default function FinnSupport() {
  const { colors } = theme;

  return (
    <main className="min-h-screen py-16 px-6 max-w-2xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4 font-display" style={{ color: colors.accent }}>
          Finn Support
        </h1>
        <p className="text-lg opacity-80">
          We&apos;re here to help you manage your finances better with Finn.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4" style={{ color: colors.textSubtle }}>
          How can we help?
        </h2>
        <p className="mb-6 leading-relaxed">
          If you are experiencing issues with the app, have suggestions, or just want to say hi,
          please get in touch with our team.
        </p>
        
        <div 
          className="p-8 rounded-2xl shadow-sm border" 
          style={{ 
            backgroundColor: colors.section, 
            borderColor: `${colors.textDark}20` // 20% opacity for border
          }}
        >
          <p className="text-sm font-medium uppercase tracking-wider mb-2 opacity-70">
            Email Support
          </p>
          <a 
            href="mailto:support@eduwaldo.com" 
            className="text-2xl font-bold underline decoration-2 underline-offset-4 transition-opacity hover:opacity-70"
            style={{ color: colors.accent }}
          >
            support@eduwaldo.com
          </a>
        </div>
      </section>

      <section className="mb-12 space-y-6">
        <h2 className="text-2xl font-semibold mb-2" style={{ color: colors.textSubtle }}>
          Tips for faster support
        </h2>
        <p className="mb-4">
          To help us resolve your issue as quickly as possible, please include the following information in your email:
        </p>
        <ul className="space-y-4 list-disc pl-5 leading-relaxed">
          <li>
            <strong>Describe the issue clearly:</strong> What were you trying to do, and what actually happened?
          </li>
          <li>
            <strong>Device Information:</strong> What device are you using (e.g., iPhone 15, Samsung S23)?
          </li>
          <li>
            <strong>OS Version:</strong> Which version of iOS or Android is your device running?
          </li>
          <li>
            <strong>Screenshots:</strong> If possible, attach screenshots or a screen recording of the problem.
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4" style={{ color: colors.textSubtle }}>
          Response Time
        </h2>
        <p className="leading-relaxed">
          We are a small team, but we strive to respond to all support requests within 24-48 business hours.
        </p>
      </section>

      <footer className="pt-8 border-t" style={{ borderColor: `${colors.textDark}20` }}>
        <p className="text-sm opacity-60">
          Last updated: January 24, 2026
        </p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium">
          <a href="/privacy_policy.html" className="hover:underline" style={{ color: colors.textSubtle }}>
            Privacy Policy
          </a>
          <span className="opacity-20 hidden sm:inline">|</span>
          <a href="/delete_request.html" className="hover:underline" style={{ color: colors.textSubtle }}>
            Data Deletion Request
          </a>
          <span className="opacity-20 hidden sm:inline">|</span>
          <Link href="/" className="hover:underline" style={{ color: colors.textSubtle }}>
            Go to Admin
          </Link>
        </div>
      </footer>
    </main>
  );
}
