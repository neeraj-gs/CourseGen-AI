import type { Metadata } from "next";
import { Lexend, IBM_Plex_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/Providers";
import { getBaseUrl } from "@/lib/env";
import { isAppConfigured } from "@/lib/demo-mode";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
});

// Used only for indices — unit numbers, chapter counts, the demo's runtime.
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: "CourseGenX-AI",
  description:
    "An AI powered course generation platform. Pick any topic, customise the units, and get a full syllabus with hand-picked YouTube lessons and summaries.",
  openGraph: {
    title: "CourseGenX-AI",
    description:
      "Generate a customised course on any topic, complete with videos and summaries.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // next-themes writes the theme class on <html> before hydration, which React
    // otherwise reports as a hydration mismatch.
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          lexend.variable,
          plexMono.variable,
          "font-sans antialiased min-h-screen pt-20"
        )}
      >
        <ThemeProvider authEnabled={isAppConfigured()}>
          <Toaster position="top-center" />
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
