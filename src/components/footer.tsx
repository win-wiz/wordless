"use client";

import Link from "next/link";
import LinksComp from "./links-comp";
import { usePathname } from "next/navigation";
// import { EmailLink, FeedbackLink } from "./email-link";

export default function Footer() {
  const pathname = usePathname();

  const handleHowToPlayClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // 如果不在首页，先阻止默认行为
    if (pathname !== '/') {
      e.preventDefault();
      // 跳转到首页并添加hash
      window.location.href = '/#how-to-play';
    }
  };

  return (
    <footer className="w-full bg-gradient-to-t from-zinc-50/50 to-transparent py-8 mt-20">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="flex flex-col items-center space-y-8">
          {/* Logo and Description */}
          <div className="text-center">
            <h2 className="text-xl font-bold bg-gradient-to-r from-zinc-800 to-violet-500 bg-clip-text text-transparent mb-2">
              Wordless Game
            </h2>
            <p className="text-zinc-500 text-sm max-w-md">
              Master the ultimate Wordless Game experience! Challenge your brain with engaging word puzzles, 
              smart color hints, and unlimited Wordless Game challenges. Perfect for vocabulary building and cognitive training.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link 
              href="/#how-to-play" 
              onClick={handleHowToPlayClick}
              className="text-zinc-600 hover:text-violet-500 transition-colors"
            >
              How to Play Wordless Game
            </Link>
            <Link href="/privacy-policy" className="text-zinc-600 hover:text-violet-500 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-zinc-600 hover:text-violet-500 transition-colors">
              Terms of Service
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm">
            Friends: 
            <Link href="https://emojis.click/en" target="_blank" className="text-zinc-600 hover:text-violet-500 transition-colors">
              EmojiClick
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            {/* <EmailLink>
              Contact Us
            </EmailLink>
            <FeedbackLink /> */}
            <LinksComp />
          </div>


          {/* Copyright */}
          <div className="text-zinc-400 text-sm">
            <p>© {new Date().getFullYear()} WinWiz. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}