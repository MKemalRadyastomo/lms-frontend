import { RootProvider } from "@/components/providers/root-provider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { useTranslation } from "@/lib/i18n.server"; // Import useTranslation from server-side i18n
import { headers } from 'next/headers'; // Import headers

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LMS - Learning Management System",
  description:
    "A modern learning management system for students and instructors",
  keywords: ["learning", "education", "courses", "online learning", "LMS"],
  authors: [{ name: "LMS Team" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = headers();
  const acceptLanguage = headersList.get('accept-language') || 'en-US'; // Default to en-US if header is missing
  const lng = acceptLanguage.split(',')[0].split('-')[0]; // Extract primary language (e.g., 'en' from 'en-US,en;q=0.9')

  const { i18n } = await useTranslation(lng, 'common'); // Use detected language

  return (
    <html lang={i18n.language} dir={i18n.dir()} suppressHydrationWarning> {/* Add lang and dir attributes */}
      <body className={inter.className}>
        <RootProvider resources={i18n.services.resourceStore.data}>{children}</RootProvider> {/* Pass resources to RootProvider */}
      </body>
    </html>
  );
}
