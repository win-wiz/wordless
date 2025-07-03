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
  title: "Wordless Game - Online Word Puzzle | Play & Master",
  description: "Master Wordless Game - the ultimate word puzzle! Guess words in 6 tries with smart color hints. Play unlimited challenges from 3-8 letters. Free & addictive!",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  keywords: "Wordless Game, word puzzle, online word game, word guessing, vocabulary challenge, brain teaser",
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
        <Script 
          async 
          custom-element="amp-auto-ads"
          src="https://cdn.ampproject.org/v0/amp-auto-ads-0.1.js"
        />
        
        <Toaster position="top-right" richColors duration={2000} />
        <UseGoogleAnalysic />
      </body>
    </html>
  );
}
