import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://portfolio-analytics-web.vercel.app"),
  title: {
    default: "Portfolio Analytics",
    template: "%s | Portfolio Analytics",
  },
  description:
    "Explainable portfolio analytics with deterministic financial metrics.",
  applicationName: "Portfolio Analytics",
  keywords: [
    "portfolio analytics",
    "FastAPI",
    "Next.js",
    "financial engineering",
    "risk metrics",
  ],
  openGraph: {
    title: "Portfolio Analytics",
    description:
      "Explainable portfolio risk built on deterministic financial metrics.",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Portfolio Analytics — Explainable risk. Deterministic metrics.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio Analytics",
    description:
      "Explainable portfolio risk built on deterministic financial metrics.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
