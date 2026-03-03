import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FiCheckSquare, FiDollarSign, FiUsers, FiMessageSquare, FiShield, FiSmartphone } from "react-icons/fi";

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
            href="/auth?mode=register"
            className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-medium px-8 py-3 rounded-full transition-colors text-center"
          >
            Get Started
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
                <FiCheckSquare size={18} />
              </div>
              <p className="text-3xl font-bold text-text">12</p>
              <p className="text-sm text-text-muted mt-1">Tasks This Week</p>
            </div>
            <div className="bg-bg-card-warm rounded-xl p-6">
              <div className="w-9 h-9 rounded-lg bg-accent-light/50 flex items-center justify-center mb-4 text-primary">
                <FiDollarSign size={18} />
              </div>
              <p className="text-3xl font-bold text-text">€234</p>
              <p className="text-sm text-text-muted mt-1">Shared Expenses</p>
            </div>
            <div className="bg-bg-card-warm rounded-xl p-6">
              <div className="w-9 h-9 rounded-lg bg-accent-light/50 flex items-center justify-center mb-4 text-primary">
                <FiUsers size={18} />
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
                icon: <FiCheckSquare size={20} />,
                title: "Task Management",
                desc: "Create, assign, and track household chores with fair rotation and accountability.",
              },
              {
                icon: <FiDollarSign size={20} />,
                title: "Expense Tracking",
                desc: "Split bills, track shared costs, and settle balances with automated calculations.",
              },
              {
                icon: <FiMessageSquare size={20} />,
                title: "Shared Notes",
                desc: "Structured communication through shared notes — no more lost messages.",
              },
              {
                icon: <FiShield size={20} />,
                title: "Role-Based Access",
                desc: "Admins can manage settings while members focus on day-to-day coordination.",
              },
              {
                icon: <FiSmartphone size={20} />,
                title: "Works Everywhere",
                desc: "Progressive Web App that runs seamlessly on any device, online or offline.",
              },
              {
                icon: <FiUsers size={20} />,
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
            href="/auth?mode=register"
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
