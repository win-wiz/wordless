
import "@/styles/globals.css";
import { type Metadata } from "next";
import { Toaster } from "@/components/ui/sonner"
import Header from "@/components/header";
import Footer from "@/components/footer";
import { ScrollToTop } from "@/components/scroll-to-top";
import { UseGoogleAnalysic } from "@/components/use-google-analysic";
import Script from "next/script";


export const metadata: Metadata = {
  title: "Unlimited Wordless Online: Guess the Word in 6 Tries!",
  description: "Wordless Online: Endless Word Challenges Dive into Wordless, the unlimited word-guessing game. Test your skills with a new word every time, ranging from 3 to 8 letters. Can you solve them all in just 6 tries? Sharpen your vocabulary and have fun with Wordless online.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  keywords: "wordless,wordly, wordle, game, puzzle, word, words, letters, play, online, guess，unlimited",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-1939625526338391" />
      </head>
      <body className={`bg-zinc-50`}>
        <Header />
        {children}
        <Footer />
        <ScrollToTop />

        {/* AdSense 脚本 - 统一管理 */}
        <Script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1939625526338391"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
      <Toaster position="top-right" richColors duration={2000} />
      <UseGoogleAnalysic />
    </html>
  );
}
