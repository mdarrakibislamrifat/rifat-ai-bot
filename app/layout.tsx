import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "./components/Navbar";
import Image from "next/image";
import profieImage from "./../public/Rifat_Profile.png";

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
    default: "Rifat AI | Build & Deploy Custom Chatbots",
    template: "%s | Rifat AI",
  },
  description:
    "Create, train, and integrate custom AI assistants for your website in minutes. Boost engagement with Rifat AI.",
  keywords: ["AI Chatbot", "SaaS", "Customer Support AI", "Next.js Chatbot"],
  authors: [{ name: "Rakib Islam Rifat" }], //
  creator: "Rakib Islam Rifat", //
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://rifat-bot-helper.vercel.app/",
  ),

  // 1. Social Media (Open Graph)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "",
    title: "Rifat AI - Intelligent Chatbot Solution",
    description:
      "The easiest way to add AI to your business. Train your bot on your data.",
    siteName: "Rifat AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Rifat AI Preview",
      },
    ],
  },

  // 2. Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Rifat AI | Custom Chatbot SaaS",
    description: "Train your own AI assistant and embed it anywhere.",
    images: ["/og-image.png"],
  },

  // 3. Icons (Favicon)
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <Navbar />
          {children}
          
        </body>
      </html>
    </ClerkProvider>
  );
}
