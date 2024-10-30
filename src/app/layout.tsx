import "@/styles/globals.css";

import { Inter } from 'next/font/google'
import { type Metadata } from "next";
import { Toaster } from "@/components/ui/sonner"
import Header from "@/components/header";
import Footer from "@/components/footer";
import { ScrollToTop } from "@/components/scroll-to-top";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Word Puzzle - Challenge Your Word Power",
  description: "A fun word guessing game to test your vocabulary",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-zinc-50`}>
        <Header />
        {children}
        <Footer />
        <ScrollToTop />
      </body>
      <Toaster position="top-right" richColors duration={2000} />
    </html>
  );
}
