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
  description: "Create, train, and integrate custom AI assistants for your website in minutes. Boost engagement with Rifat AI.",
  keywords: ["AI Chatbot", "SaaS", "Customer Support AI", "Next.js Chatbot", "Rifat CRM"],
  authors: [{ name: "Rakib Islam Rifat" }], //
  creator: "Rakib Islam Rifat", //
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://rifat-bot-helper.vercel.app/"),
  
  // 1. Social Media (Open Graph)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "",
    title: "Rifat AI - Intelligent Chatbot Solution",
    description: "The easiest way to add AI to your business. Train your bot on your data.",
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
        <Navbar/>
        {children}
         {/* LinkedIn Badge */}
            <div className="fixed bottom-6 right-6 z-50 group">
      <a
        href="https://www.linkedin.com/in/rakib-islam-rifatt/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 p-2 pr-4 rounded-full shadow-2xl hover:border-blue-500/50 transition-all duration-300 group-hover:scale-105"
      >
        {/* Profile Image or Initial */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden border border-zinc-600">
          <Image src={profieImage} alt="Profile" width={32} height={32} />
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold leading-none">
            Built By
          </span>
          <span className="text-sm text-zinc-200 font-medium leading-tight group-hover:text-blue-400">
            Rakib Islam Rifat
          </span>
        </div>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-zinc-500 group-hover:text-[#0077b5] transition-colors"
        >
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
          <rect x="2" y="9" width="4" height="12"></rect>
          <circle cx="4" cy="4" r="2"></circle>
        </svg>
      </a>

      <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-zinc-800 text-[11px] text-zinc-300 px-3 py-1.5 rounded-lg border border-zinc-700 whitespace-nowrap shadow-xl">
          Software Engineer
        </div>
      </div>
    </div>
        </body>
    </html>
      </ClerkProvider>
  );
}
