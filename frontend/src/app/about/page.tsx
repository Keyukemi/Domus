import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "About — Domus",
  description:
    "Learn how Domus makes shared living work with transparency, fairness, and harmony.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── Hero ── */}
      <section className="text-center pt-16 md:pt-20 pb-16 px-4">
        <span className="inline-block border border-border rounded-full px-4 py-1.5 text-sm text-text-muted mb-6">
          About Domus
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-text mb-6 font-serif">
          Making shared living work
        </h1>
        <p className="text-text-muted text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Domus was born from a simple observation: shared households use dozens
          of disconnected tools for tasks, expenses, and communication — leading
          to confusion, unfairness, and unnecessary conflict.
        </p>
      </section>

      {/* ── Problem / Solution ── */}
      <section className="max-w-4xl mx-auto px-4 pb-16 md:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-bg-card border border-border-light rounded-xl p-8">
            <h2 className="text-xl font-bold text-text mb-4 font-serif">
              The Problem
            </h2>
            <p className="text-sm text-text-muted leading-relaxed">
              Chores pile up unevenly. Bills are tracked in messy spreadsheets.
              Important messages get buried in group chats. Existing tools solve
              only one piece — forcing households to juggle multiple
              disconnected apps.
            </p>
          </div>
          <div className="bg-bg-card border border-border-light rounded-xl p-8">
            <h2 className="text-xl font-bold text-text mb-4 font-serif">
              Our Solution
            </h2>
            <p className="text-sm text-text-muted leading-relaxed">
              Domus is a single Progressive Web Application that centralizes
              task management, expense tracking, and communication with
              role-based access — accessible on any device, designed for real
              households.
            </p>
          </div>
        </div>
      </section>

      {/* ── Core Values ── */}
      <section className="bg-bg-feature py-16 md:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-text text-center mb-14 font-serif">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                ),
                title: "Transparency",
                desc: "Every task, expense, and decision is visible to all household members. No guesswork.",
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ),
                title: "Fairness",
                desc: "Automated rotation and balanced splitting ensure equal contribution from everyone.",
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                  </svg>
                ),
                title: "Harmony",
                desc: "By reducing friction, Domus helps roommates focus on what matters — living well together.",
              },
            ].map((value) => (
              <div
                key={value.title}
                className="bg-bg-card rounded-xl border border-border-light p-8 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-accent-light/30 flex items-center justify-center mx-auto mb-5 text-primary">
                  {value.icon}
                </div>
                <h3 className="text-lg font-bold text-text mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who is Domus for? ── */}
      <section className="py-16 md:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-text text-center mb-14 font-serif">
            Who is Domus for?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                title: "Students",
                desc: "Sharing dorms or apartments during university.",
              },
              {
                title: "Young Professionals",
                desc: "Co-living in urban apartments to split costs.",
              },
              {
                title: "Families & Groups",
                desc: "Any multi-person household seeking coordination.",
              },
            ].map((audience) => (
              <div
                key={audience.title}
                className="bg-bg-card-warm rounded-xl border border-border-light p-8 text-center"
              >
                <h3 className="text-lg font-bold text-text mb-2">
                  {audience.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {audience.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
