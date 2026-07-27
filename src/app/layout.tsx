import type { Metadata, Viewport } from "next";
import { Archivo, Public_Sans, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { hasClerkKeys } from "@/lib/clerk-enabled";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

// Archivo carries a width axis, which is what makes the headline read as arena
// signage rather than another geometric sans.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Batch — Startup School Networking",
  description:
    "Find the people you shared a session with at YC Startup School. Browse attendees, see shared sessions, connect on LinkedIn.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Batch",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-180.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#ff5c00",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const body = (
    <html
      lang="en"
      className={`${archivo.variable} ${publicSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-concrete text-graphite">
        <SiteHeader />
        {children}
      </body>
    </html>
  );

  return hasClerkKeys ? <ClerkProvider>{body}</ClerkProvider> : body;
}
