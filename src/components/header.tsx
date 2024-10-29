'use client';

import Image from "next/image";
import logo from "@/../public/wordless.png";
import { CircleHelp } from "lucide-react";

export default function Header() {
  const scrollToHelp = () => {
    // 找到 Help 部分并平滑滚动
    const helpSection = document.getElementById('how-to-play');
    if (helpSection) {
      helpSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <header className="w-full bg-gradient-to-b from-zinc-50 to-transparent py-3 md:py-4">
      <div className="container mx-auto max-w-screen-md px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 md:space-x-3">
          <Image 
            src={logo} 
            alt="logo" 
            width={28} 
            height={28} 
            className="opacity-90 md:w-8 md:h-8" 
          />
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-zinc-800 to-violet-500 bg-clip-text text-transparent">
            Wordless
          </h1>
        </div>
        <div>
          <CircleHelp 
            onClick={scrollToHelp}
            className="w-5 h-5 md:w-6 md:h-6 text-zinc-600 hover:text-violet-500 transition-colors cursor-pointer" 
          />
        </div>
      </div>
    </header>
  );
}
