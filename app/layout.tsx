import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Caveat } from "next/font/google";
import "./globals.css";

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const sans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const handwritten = Caveat({
  variable: "--font-handwritten",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thisismaks.com"),
  title: {
    default: "Maks — Notes on design and technology",
    template: "%s — Maks",
  },
  description:
    "Notes on design, technology, and the things I’m learning along the way.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Maks — Notes on design and technology",
    description:
      "Notes on design, technology, and the things I’m learning along the way.",
    type: "website",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "Maks journal" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Maks — Notes on design and technology",
    description:
      "Notes on design, technology, and the things I’m learning along the way.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${serif.variable} ${sans.variable} ${handwritten.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
