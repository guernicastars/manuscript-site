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
  title: {
    default: "The Republic of AI Agents",
    template: "%s | The Republic of AI Agents",
  },
  description:
    "A Theological-Technical Framework for Prophetic Intelligence — by Yevhen Shcherbinin",
  metadataBase: new URL("https://republic-of-ai-agents.vercel.app"),
  openGraph: {
    type: "website",
    siteName: "The Republic of AI Agents",
    title: "The Republic of AI Agents",
    description:
      "A Theological-Technical Framework for Prophetic Intelligence — synthesizing complexity science, causal inference, and Abrahamic theology.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Republic of AI Agents",
    description:
      "A Theological-Technical Framework for Prophetic Intelligence — by Yevhen Shcherbinin",
  },
  authors: [{ name: "Yevhen Shcherbinin" }],
  creator: "Yevhen Shcherbinin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
