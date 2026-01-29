import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Finn - Support",
  description: "Support page for Finn - Personal Finance Manager"
};

export default function FinnSupport() {
  return (
    <main className="relative min-h-screen px-6 pb-16 pt-12 text-textDark">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
        <header className="space-y-4">
          <span className="inline-flex w-fit items-center rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-textSubtle shadow-sm">
            Finn Support
          </span>
          <h1 className="font-display text-4xl font-bold text-textDark sm:text-5xl text-balance">
            Finn Support
          </h1>
          <p className="text-lg text-textSubtle text-pretty">
            We&apos;re here to help you manage your finances better with Finn.
          </p>
        </header>

        <section className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-sm backdrop-blur">
          <h2 className="text-2xl font-semibold text-textDark font-display">How can we help?</h2>
          <p className="mt-3 text-base text-textSubtle text-pretty">
            If you are experiencing issues with the app, have suggestions, or just want to say hi, please get in touch
            with our team.
          </p>
          <div className="mt-6 rounded-2xl border border-black/10 bg-white/70 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-textSubtle">Email Support</p>
            <a
              href="mailto:support@eduwaldo.com"
              className="mt-2 inline-flex text-2xl font-bold text-highlight underline decoration-2 underline-offset-4 transition-colors hover:text-textDark"
            >
              support@eduwaldo.com
            </a>
          </div>
        </section>

        <section className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-sm backdrop-blur">
          <h2 className="text-2xl font-semibold text-textDark font-display">Tips for faster support</h2>
          <p className="mt-3 text-base text-textSubtle text-pretty">
            To help us resolve your issue as quickly as possible, please include the following information in your email:
          </p>
          <ul className="mt-4 space-y-4 list-disc pl-5 text-sm text-textDark">
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

        <section className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-sm backdrop-blur">
          <h2 className="text-2xl font-semibold text-textDark font-display">Response Time</h2>
          <p className="mt-3 text-base text-textSubtle text-pretty">
            We are a small team, but we strive to respond to all support requests within 24-48 business hours.
          </p>
        </section>

        <footer className="border-t border-black/10 pt-6 text-sm text-textSubtle">
          <p>Last updated: January 24, 2026</p>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 font-medium">
            <a href="/privacy_policy.html" className="hover:underline">
              Privacy Policy
            </a>
            <span className="opacity-30 hidden sm:inline">|</span>
            <a href="/delete_request.html" className="hover:underline">
              Data Deletion Request
            </a>
            <span className="opacity-30 hidden sm:inline">|</span>
            <Link href="/" className="hover:underline">
              Go to Admin
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
