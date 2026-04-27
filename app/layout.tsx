import type { Metadata } from "next";
import { Cormorant_Garamond, Jost, DM_Mono } from "next/font/google";
import "./globals.css";

const heading = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const body = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const mono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kabila — African Peoples & Lineages",
  description:
    "Ethnic groups, clans, lineage systems, and language families — structured, open, and built for researchers, educators, and diaspora communities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${heading.variable} ${body.variable} ${mono.variable}`}
    >
      <body style={{ fontFamily: "var(--font-body), sans-serif" }}>
        <div className="bg-grid" />
        <div className="orb orb-red" />
        <div className="orb orb-teal" />
        <div className="orb orb-gold" />
        {children}
      </body>
    </html>
  );
}
