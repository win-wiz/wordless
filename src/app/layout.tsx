
import "@/styles/globals.css";
import { type Metadata } from "next";
import { Toaster } from "@/components/ui/sonner"
import Header from "@/components/header";
import Footer from "@/components/footer";
import { ScrollToTop } from "@/components/scroll-to-top";
import { UseGoogleAnalysic } from "@/components/use-google-analysic";


export const metadata: Metadata = {
  title: "Discover the Hidden Word! Wordless - A Wordle-Style Game with 3 to 8 Letter Words. Can You Guess the Mystery Word in Only 6 Tries?",
  description: "Embark on a boundless word-guessing adventure with Wordless! This game is a fresh take on the Wordle phenomenon, offering a vast array of words ranging from 3 to 8 letters. Unlike traditional Wordle, Wordless challenges you with an unlimited selection of words, keeping the excitement going. Test your vocabulary and deduction skills to uncover the secret word within a maximum of 6 attempts. Are you ready to put your word knowledge to the test and see how many words you can crack?",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  keywords: "wordless,wordly, wordle, game, puzzle, word, words, letters, play, online, guess，unlimited",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`bg-zinc-50`}>
        <Header />
        {children}
        <Footer />
        <ScrollToTop />
      </body>
      <Toaster position="top-right" richColors duration={2000} />
      <UseGoogleAnalysic />
    </html>
  );
}
