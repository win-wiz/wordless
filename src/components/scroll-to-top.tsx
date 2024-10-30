"use client"

import { useCallback, useEffect, useState } from "react"
import { ArrowUpToLine } from "lucide-react"
import { cn } from "../lib/utils"
import { Button } from "./ui/button"
import React from 'react';

export function ScrollToTop() {
  const [showTopBtn, setShowTopBtn] = useState(false)

  const handleScroll = useCallback(() => {
    setShowTopBtn(window.scrollY > window.innerHeight / 2)
  }, [])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  const scrollToTop = () => {
    window.scroll({
      top: 0,
      left: 0,
      behavior: "smooth",
    })
  }

  return (
    <Button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-8 rounded-full right-8 z-50 bg-violet-500 hover:bg-violet-600 shadow-lg transition-all duration-300 ease-in-out",
        "hover:scale-110",
        showTopBtn
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none cursor-default",
      )}
      size="icon"
    >
      <ArrowUpToLine className="h-5 w-5" aria-hidden="true" />
    </Button>
  )
}
