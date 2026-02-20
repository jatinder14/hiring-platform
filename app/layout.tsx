import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HireU — Tech Talent Platform",
  description:
    "Hire top tech talent — AI/ML, Full Stack, Data Science, DevOps & QA. Explore domains and connect with vetted professionals.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
