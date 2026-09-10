"use client";

import { useMemo, useState } from "react";
import { Share2 } from "lucide-react";

import { buildShareText } from "@/lib/strands-engine";
import { readStrandsStats } from "@/lib/strands-stats";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type StrandsWinModalProps = {
  isOpen: boolean;
  isPractice: boolean;
  isWon: boolean;
  theme: string;
  totalHintsUsed: number;
  onClose: () => void;
};

export default function StrandsWinModal({
  isOpen,
  isPractice,
  isWon,
  theme,
  totalHintsUsed,
  onClose,
}: StrandsWinModalProps) {
  const [copied, setCopied] = useState(false);

  // 练习局不加载统计
  const stats = useMemo(
    () => (isOpen && !isPractice ? readStrandsStats() : null),
    [isOpen, isPractice],
  );

  const shareText = useMemo(
    () =>
      buildShareText({
        theme,
        hintsUsed: totalHintsUsed,
        isPractice,
        url: typeof window !== "undefined" ? window.location.href : "",
      }),
    [theme, totalHintsUsed, isPractice],
  );

  const handleShare = async () => {
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({ text: shareText });
        return;
      }
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // 用户取消分享或剪贴板不可用，静默
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="max-w-sm rounded-3xl border border-stone-200 bg-[#fdfbf7]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-stone-800">
            {isWon ? "You solved it!" : "Strands Stats"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <p className="text-center text-sm text-stone-600">
            Theme: <span className="font-semibold text-stone-800">{theme}</span>
          </p>
          <p className="text-sm text-stone-600">
            Hints used:{" "}
            <span className="font-semibold text-stone-800">
              {totalHintsUsed === 0 ? "None" : totalHintsUsed}
            </span>
          </p>

          {stats ? (
            <div className="grid w-full grid-cols-4 gap-2 text-center">
              {[
                { label: "Played", value: stats.played },
                { label: "Won", value: stats.won },
                { label: "Streak", value: stats.currentStreak },
                { label: "Perfect", value: stats.perfectGames },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-stone-200 bg-white px-2 py-3"
                >
                  <div className="text-xl font-bold text-stone-800">{item.value}</div>
                  <div className="text-[11px] font-medium uppercase tracking-wide text-stone-500">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {isWon ? (
            <button
              type="button"
              onClick={() => void handleShare()}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-stone-800 text-sm font-semibold text-white transition-colors hover:bg-stone-900"
            >
              <Share2 className="h-4 w-4" />
              {copied ? "Copied!" : "Share result"}
            </button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
