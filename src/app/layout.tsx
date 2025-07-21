import "@/styles/globals.css";
import { type Metadata } from "next";
import { Toaster } from "@/components/ui/sonner"
import Header from "@/components/header";
import Footer from "@/components/footer";
import { ScrollToTop } from "@/components/scroll-to-top";
import { UseGoogleAnalysic } from "@/components/use-google-analysic";
import AdSenseInitializer from "@/components/adsense-initializer";
import Script from "next/script";


export const metadata: Metadata = {
  title: "Wordless Game - Free Online Word Puzzle & Brain Training Challenge",
  description: "Play Wordless Game online! Master the ultimate word puzzle with 6 tries to guess hidden words. Wordless Game features 3-8 letter challenges, smart color hints, and unlimited gameplay. Perfect brain training for vocabulary building and cognitive skills.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  keywords: "Wordless Game, word puzzle, online word game, word guessing, vocabulary challenge, brain teaser, wordle alternative, word training, cognitive skills, brain exercise, english learning, daily word puzzle, free word game, vocabulary building",
  creator: "Wordless Game Team",
  publisher: "Wordless Game",
  robots: "index, follow",
  openGraph: {
    title: "Wordless Game - Free Online Word Puzzle & Brain Training Challenge",
    description: "Play Wordless Game online! Master the ultimate word puzzle with 6 tries to guess hidden words. Features 3-8 letter challenges and smart color hints.",
    type: "website",
    siteName: "Wordless Game"
  }
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
        
        {/* AdSense 自动广告初始化 - 使用专门的组件 */}
        <AdSenseInitializer />
        
        {/* AMP自动广告标签 - 与常规AdSense冲突，已禁用 */}
        {/* <Script 
          async 
          custom-element="amp-auto-ads"
          src="https://cdn.ampproject.org/v0/amp-auto-ads-0.1.js"
        /> */}
        
        <Toaster position="top-right" richColors duration={2000} />
        <UseGoogleAnalysic />
      </body>
    </html>
  );
}
