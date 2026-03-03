import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── Hero Section ── */}
      <section className="text-center pt-16 md:pt-20 pb-16 px-4">
        <span className="inline-block border border-border rounded-full px-4 py-1.5 text-sm text-text-muted mb-6">
          Smart Co-Living Platform
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-text mb-6 font-serif">
          Live together, <em className="text-accent">better</em>
        </h1>
        <p className="text-text-muted text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Domus centralizes task management, expense tracking, and communication
          for shared households — so everyone stays on the same page.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#get-started"
            className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-medium px-8 py-3 rounded-full transition-colors text-center"
          >
            Get Started Free
          </a>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto border border-border text-text font-medium px-8 py-3 rounded-full hover:bg-bg-card transition-colors text-center"
          >
            See How It Works
          </a>
        </div>
      </section>

      {/* ── Stats Preview ── */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="border border-border-light rounded-2xl p-4 md:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-bg-card-warm rounded-xl p-6">
              <div className="w-9 h-9 rounded-lg bg-accent-light/50 flex items-center justify-center mb-4 text-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-text">12</p>
              <p className="text-sm text-text-muted mt-1">Tasks This Week</p>
            </div>
            <div className="bg-bg-card-warm rounded-xl p-6">
              <div className="w-9 h-9 rounded-lg bg-accent-light/50 flex items-center justify-center mb-4 text-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="M12 6v12M8 10h8M9 14h6" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-text">€234</p>
              <p className="text-sm text-text-muted mt-1">Shared Expenses</p>
            </div>
            <div className="bg-bg-card-warm rounded-xl p-6">
              <div className="w-9 h-9 rounded-lg bg-accent-light/50 flex items-center justify-center mb-4 text-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-text">4</p>
              <p className="text-sm text-text-muted mt-1">Household Members</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="bg-bg-feature py-16 md:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-semibold text-primary tracking-widest uppercase text-center mb-3">
            Features
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-text text-center mb-4 font-serif">
            Everything your household needs
          </h2>
          <p className="text-text-muted text-center max-w-lg mx-auto mb-14">
            One platform to replace the chaos of group chats, spreadsheets, and
            sticky notes.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                  </svg>
                ),
                title: "Task Management",
                desc: "Create, assign, and track household chores with fair rotation and accountability.",
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><path d="M12 6v12M8 10h8M9 14h6" />
                  </svg>
                ),
                title: "Expense Tracking",
                desc: "Split bills, track shared costs, and settle balances with automated calculations.",
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                ),
                title: "Shared Notes",
                desc: "Structured communication through shared notes — no more lost messages.",
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                ),
                title: "Role-Based Access",
                desc: "Admins can manage settings while members focus on day-to-day coordination.",
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                ),
                title: "Works Everywhere",
                desc: "Progressive Web App that runs seamlessly on any device, online or offline.",
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
                  </svg>
                ),
                title: "Built for Teams",
                desc: "Designed for 2–10 person households — students, professionals, and families.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-bg-card rounded-xl border border-border-light p-6 md:p-8"
              >
                <div className="w-10 h-10 rounded-lg bg-accent-light/30 flex items-center justify-center mb-5 text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-text mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-16 md:py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-semibold text-primary tracking-widest uppercase text-center mb-3">
            How It Works
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-text text-center mb-14 font-serif">
            Get started in minutes
          </h2>
          <div className="flex flex-col gap-6">
            {[
              {
                num: "01",
                title: "Create Your Home",
                desc: "Set up your household in seconds and invite your roommates.",
              },
              {
                num: "02",
                title: "Organize Together",
                desc: "Assign tasks, log expenses, and share notes in one place.",
              },
              {
                num: "03",
                title: "Live in Harmony",
                desc: "Enjoy transparency, fairness, and fewer conflicts at home.",
              },
            ].map((step) => (
              <div
                key={step.num}
                className="flex items-center gap-4 md:gap-6 bg-bg-card border border-border-light rounded-xl px-6 md:px-8 py-6"
              >
                <span className="text-3xl md:text-4xl font-bold text-accent-light select-none">
                  {step.num}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-text">{step.title}</h3>
                  <p className="text-sm text-text-muted">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div
          className="rounded-2xl px-6 md:px-8 py-12 md:py-16 text-center"
          style={{
            background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
          }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 font-serif">
            Ready to simplify shared living?
          </h2>
          <p className="text-white/80 max-w-md mx-auto mb-8 text-sm md:text-base">
            Join thousands of households already using Domus to live together,
            better.
          </p>
          <a
            href="#get-started"
            className="inline-block bg-white text-text font-medium px-8 py-3 rounded-full hover:bg-white/90 transition-colors"
          >
            Start for Free
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
