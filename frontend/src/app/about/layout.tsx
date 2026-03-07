import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Domus",
  description:
    "Learn how Domus makes shared living work with transparency, fairness, and harmony.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
