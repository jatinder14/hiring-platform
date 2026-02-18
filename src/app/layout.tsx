import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
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
    <ClerkProvider
      localization={{
        signIn: {
          start: {
            title: "Login",
          },
        },
        // Force keys for custom error messages as requested by user
        ...({
          unstable__errors: {
            identification_not_found: "u dont have account and create one",
            invalid_credentials: "invalid input",
            form_password_incorrect: "invalid input",
          },
          formFieldLabel__optional: "",
          optionalTag: "",
          formFieldLabel__firstName: "First Name",
          formFieldLabel__lastName: "Last Name",
          formFieldInputPlaceholder__firstName: "First Name",
          formFieldInputPlaceholder__lastName: "Last Name",
        } as any)
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning>
          <NextTopLoader color="#00ffe6" showSpinner={false} />
          {children}
          <Toaster position="top-right" richColors closeButton />
        </body>
      </html>
    </ClerkProvider>
  );
}
