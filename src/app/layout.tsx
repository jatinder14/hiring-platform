import type { Metadata } from "next";
import { SessionProvider } from "@/components/SessionProvider";
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from 'sonner';
import "./globals.css";

export const metadata: Metadata = {
  title: "HireU — Tech Talent Platform",
  description:
    "Hire top tech talent — AI/ML, Full Stack, Data Science, DevOps & QA. Explore domains and connect with vetted professionals.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SessionProvider>
          <NextTopLoader color="#00ffe6" showSpinner={false} />
          <Toaster richColors position="top-right" />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
