import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-bg-card-warm border-t border-border-light">
      <div className="max-w-5xl mx-auto px-6 md:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image src="/Domus_l.png" alt="Domus logo" width={32} height={32} />
              <span className="text-lg font-semibold text-text">Domus</span>
            </div>
            <p className="text-sm text-text-muted leading-relaxed">
              The smart co-living platform that brings transparency, fairness,
              and harmony to shared households.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-text mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/#features"
                  className="text-sm text-text-muted hover:text-text"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-text-muted hover:text-text"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-text mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-sm text-text-muted hover:text-text"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-text-muted hover:text-text"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-10 pt-6 text-center">
          <p className="text-sm text-text-light">
            © 2026 Domus. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
