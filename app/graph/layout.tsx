import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knowledge Graph",
  description:
    "Interactive visualization of the theology's concept network — 55+ concepts across thinkers, frameworks, and crises",
  openGraph: {
    type: "website",
    title: "Knowledge Graph | The Republic of AI Agents",
    description:
      "Interactive force-directed visualization of the theology's concept network",
  },
  twitter: {
    card: "summary_large_image",
    title: "Knowledge Graph | The Republic of AI Agents",
    description:
      "Interactive force-directed visualization of the theology's concept network",
  },
};

export default function GraphLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="dark">{children}</div>;
}
