import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Gamepad2, ChevronDown } from "lucide-react";
import React from "react";

const GamesDropdownComponent = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [open, handleClickOutside]);

  const handleToggle = useCallback(() => {
    setOpen((v) => !v);
  }, []);

  const menu = useMemo(() => (
    <div className="absolute left-0 mt-2 w-[240px] bg-white border border-zinc-200 rounded-lg shadow-lg z-20">
      <ul className="py-2">
        <li>
          <a href="/waffle-game" className="block px-4 py-2 hover:bg-zinc-100 text-zinc-700">🧇 Waffle Game</a>
        </li>
        <li>
          <a href="/emoji-memory-game" className="block px-4 py-2 hover:bg-zinc-100 text-zinc-700">🧠 Emoji Memory Game</a>
        </li>
        <li>
          <a href="/emoji-kitchen-game" className="block px-4 py-2 hover:bg-zinc-100 text-zinc-700">👨‍🍳 Emoji Kitchen Game</a>
        </li>
        {/* 可继续添加更多游戏 */}
      </ul>
    </div>
  ), []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-zinc-100 transition relative focus:outline-none"
        onClick={handleToggle}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Gamepad2 className="w-5 h-5 text-violet-500" />
        <span className="text-violet-500 font-medium text-lg select-none ml-1">More Games</span>
        <ChevronDown className="w-4 h-4 text-violet-400 ml-1" />
        {/* 红点 */}
        <span className="absolute -top-1.5 -right-1 w-4 h-4 flex items-center justify-center">
          {/* 扩散光圈动画 */}
          <span className="absolute w-5 h-5 rounded-full bg-red-400 opacity-30 animate-pulse-dot2" />
          {/* 红点本体 */}
          <span className="relative block w-3 h-3 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg opacity-90" />
        </span>
      </button>
      {/* 下拉菜单 */}
      {open && menu}
    </div>
  );
};

export const GamesDropdown = React.memo(GamesDropdownComponent);

<style jsx global>{`
@keyframes pulse-dot2 {
  0% { transform: scale(1); opacity: 0.3; }
  70% { transform: scale(1.5); opacity: 0.08; }
  100% { transform: scale(2); opacity: 0; }
}
.animate-pulse-dot2 {
  animation: pulse-dot2 1.8s infinite cubic-bezier(0.4,0,0.6,1);
}
`}</style> 