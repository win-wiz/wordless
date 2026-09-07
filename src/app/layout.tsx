import "@/styles/globals.css";
import { type Metadata } from "next";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner"
import Header from "@/components/header";
import Footer from "@/components/footer";
import { ScrollToTop } from "@/components/scroll-to-top";
import { UseGoogleAnalysic } from "@/components/use-google-analysic";
import AdSenseInitializer from "@/components/adsense-initializer";
import { AuthSessionProvider } from "@/components/auth/auth-session-provider";


export const metadata: Metadata = {
  title: "Wordless Game - Free Word Puzzle & Brain Training Online",
  description: "Play Wordless Game free! Challenge yourself with our addictive word puzzle featuring 6 attempts, smart hints, and 3-8 letter words. Perfect for vocabulary building.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  keywords: "Wordless Game, word puzzle, online word game, word guessing, vocabulary challenge, brain teaser, wordle alternative, word training, cognitive skills, brain exercise, english learning, daily word puzzle, free word game, vocabulary building",
  creator: "Wordless Game Team",
  publisher: "Wordless Game",
  robots: "index, follow",
  openGraph: {
    title: "Wordless Game - Free Word Puzzle & Brain Training Online",
    description: "Play Wordless Game free! Challenge yourself with our addictive word puzzle featuring 6 attempts, smart hints, and 3-8 letter words.",
    type: "website",
    siteName: "Wordless Game"
  }
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const shouldLoadAds = process.env.NODE_ENV === "production";

  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-1939625526338391" />
      </head>
      <body className={`bg-zinc-50`}>
        <AuthSessionProvider>
            <Suspense fallback={<div className="sticky top-0 z-30 h-[73px] w-full border-b border-violet-100/80 bg-white/90 backdrop-blur-xl" />}>
              <Header />
            </Suspense>
          {children}
          <Footer />
          <ScrollToTop />
        </AuthSessionProvider>
        {shouldLoadAds ? <AdSenseInitializer /> : null}
        
        {/* AMP auto-ads tag. Disabled because it conflicts with standard AdSense. */}
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
