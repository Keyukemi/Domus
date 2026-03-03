import type { Metadata } from "next";
import { Nunito, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: "italic",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Domus — Smart Co-Living Platform",
  description:
    "Domus centralizes task management, expense tracking, and communication for shared households.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${nunito.variable} ${instrumentSerif.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
