import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 md:px-8 py-4 border-b border-border-light max-w-7xl mx-auto">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/Domus_l.png" alt="Domus logo" width={32} height={32} />
        <span className="text-lg font-semibold text-text">Domus</span>
      </Link>
      <div className="flex items-center gap-4 md:gap-8">
        <Link
          href="/#features"
          className="hidden sm:inline text-sm text-text-muted hover:text-text"
        >
          Features
        </Link>
        <Link
          href="/about"
          className="hidden sm:inline text-sm text-text-muted hover:text-text"
        >
          About
        </Link>
        <Link
          href="/auth"
          className="bg-button-primary hover:bg-button-primary-hover text-white text-sm font-medium px-5 py-2 rounded-full transition-colors"
        >
          Login
        </Link>
      </div>
    </nav>
  );
}
