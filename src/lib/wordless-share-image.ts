import { formatTime } from "@/lib/utils";
import type { DailyChallengeCommunityStats } from "@/types/auth";

export interface WordlessShareImageGameResult {
  isWin: boolean;
  attempts: number;
  maxAttempts: number;
  word: string;
  totalTime: number;
  wordLength: number;
  pattern?: string;
  communityStats?: DailyChallengeCommunityStats | null;
}

interface CreateWordlessShareImageOptions {
  gameResult: WordlessShareImageGameResult;
  shareUrl: string;
}

type DistributionRow = {
  label: string;
  count: number;
  percentage: number;
  fillColor: string;
};

const WIDTH = 1080;
const HEIGHT = 1350;
const CARD_X = 54;
const CARD_Y = 54;
const CARD_WIDTH = WIDTH - CARD_X * 2;
const CARD_HEIGHT = HEIGHT - CARD_Y * 2;

function formatPercentage(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: value > 0 && value < 10 ? 1 : 0,
    maximumFractionDigits: value > 0 && value < 10 ? 1 : 0,
  }).format(value);
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + width - safeRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  ctx.lineTo(x + width, y + height - safeRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  ctx.lineTo(x + safeRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  ctx.lineTo(x, y + safeRadius);
  ctx.quadraticCurveTo(x, y, x + safeRadius, y);
  ctx.closePath();
}

function fillRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillStyle: string | CanvasGradient,
) {
  ctx.save();
  roundedRect(ctx, x, y, width, height, radius);
  ctx.fillStyle = fillStyle;
  ctx.fill();
  ctx.restore();
}

function strokeRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  strokeStyle: string,
  lineWidth = 1,
) {
  ctx.save();
  roundedRect(ctx, x, y, width, height, radius);
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
  ctx.restore();
}

function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options?: {
    font?: string;
    color?: string;
    align?: CanvasTextAlign;
  },
) {
  ctx.save();
  ctx.font = options?.font ?? "500 24px Inter, Arial, sans-serif";
  ctx.fillStyle = options?.color ?? "#18181b";
  ctx.textAlign = options?.align ?? "left";
  ctx.fillText(text, x, y);
  ctx.restore();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      currentLine = candidate;
      return;
    }

    if (currentLine) {
      lines.push(currentLine);
    }
    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  options?: {
    font?: string;
    color?: string;
  },
) {
  ctx.save();
  ctx.font = options?.font ?? "500 24px Inter, Arial, sans-serif";
  ctx.fillStyle = options?.color ?? "#18181b";
  const lines = wrapText(ctx, text, maxWidth);
  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });
  ctx.restore();
  return lines.length;
}

function getPalette(isWin: boolean) {
  if (isWin) {
    return {
      headerStart: "#f5f3ff",
      headerEnd: "#ffffff",
      accent: "#8b5cf6",
      accentSoft: "#f3e8ff",
      accentBorder: "#e9d5ff",
      statusCopy: {
        kicker: "ROUND COMPLETE",
        title: "You Won!",
        description: "Amazing work! You've mastered this challenge!",
      },
    };
  }

  return {
    headerStart: "#fff1f2",
    headerEnd: "#ffffff",
    accent: "#f43f5e",
    accentSoft: "#ffe4e6",
    accentBorder: "#fecdd3",
    statusCopy: {
      kicker: "ROUND OVER",
      title: "Challenge Incomplete",
      description: "Out of attempts this time. The answer stays hidden here.",
    },
  };
}

function getDistributionRows(
  stats: DailyChallengeCommunityStats,
  maxAttempts: number,
): DistributionRow[] {
  const rows = [
    ...stats.guessDistribution.slice(0, maxAttempts).map((count, index) => ({
      label: String(index + 1),
      count,
      fillColor: "#8b5cf6",
    })),
    {
      label: "Unsolved",
      count: stats.failedCount,
      fillColor: "#a1a1aa",
    },
  ];

  return rows.map((row) => ({
    ...row,
    percentage: stats.totalCompleted > 0 ? (row.count / stats.totalCompleted) * 100 : 0,
  }));
}

function parsePatternRows(pattern: string | undefined) {
  if (!pattern) {
    return [];
  }

  return pattern
    .split("\n")
    .map((line) => Array.from(line.trim()).filter(Boolean))
    .filter((line) => line.length > 0);
}

function getTileColor(symbol: string) {
  if (symbol === "🟩") {
    return "#8b5cf6";
  }
  if (symbol === "🟨") {
    return "#a78bfa";
  }
  return "#e4e4e7";
}

function drawBackground(ctx: CanvasRenderingContext2D, isWin: boolean) {
  const background = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  background.addColorStop(0, isWin ? "#faf7ff" : "#fff5f7");
  background.addColorStop(0.5, "#f8fafc");
  background.addColorStop(1, "#f4f4f5");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const glow = ctx.createRadialGradient(WIDTH / 2, 120, 80, WIDTH / 2, 120, 520);
  glow.addColorStop(0, isWin ? "rgba(139, 92, 246, 0.16)" : "rgba(244, 63, 94, 0.16)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, WIDTH, 520);
}

function drawCard(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.shadowColor = "rgba(15, 23, 42, 0.14)";
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 26;
  fillRoundedRect(ctx, CARD_X, CARD_Y, CARD_WIDTH, CARD_HEIGHT, 36, "#ffffff");
  ctx.restore();

  strokeRoundedRect(ctx, CARD_X, CARD_Y, CARD_WIDTH, CARD_HEIGHT, 36, "#ede9fe", 1.5);
}

function drawHeader(ctx: CanvasRenderingContext2D, gameResult: WordlessShareImageGameResult) {
  const palette = getPalette(gameResult.isWin);
  const headerGradient = ctx.createLinearGradient(0, CARD_Y, 0, CARD_Y + 250);
  headerGradient.addColorStop(0, palette.headerStart);
  headerGradient.addColorStop(1, palette.headerEnd);
  fillRoundedRect(ctx, CARD_X, CARD_Y, CARD_WIDTH, 250, 36, headerGradient);

  drawText(ctx, palette.statusCopy.kicker, CARD_X + 104, CARD_Y + 62, {
    font: "700 18px Inter, Arial, sans-serif",
    color: palette.accent,
  });
  drawText(ctx, palette.statusCopy.title, CARD_X + 104, CARD_Y + 128, {
    font: "700 68px Inter, Arial, sans-serif",
    color: "#09090b",
  });
  drawWrappedText(
    ctx,
    palette.statusCopy.description,
    CARD_X + 48,
    CARD_Y + 188,
    CARD_WIDTH - 96,
    34,
    {
      font: "500 25px Inter, Arial, sans-serif",
      color: "#71717a",
    },
  );

  fillRoundedRect(ctx, CARD_X + 40, CARD_Y + 34, 48, 48, 24, palette.accentSoft);
  strokeRoundedRect(ctx, CARD_X + 40, CARD_Y + 34, 48, 48, 24, palette.accentBorder);
  drawText(ctx, gameResult.isWin ? "✦" : "•", CARD_X + 64, CARD_Y + 67, {
    font: "700 24px Inter, Arial, sans-serif",
    color: palette.accent,
    align: "center",
  });

  ctx.save();
  ctx.strokeStyle = "#ede9fe";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(CARD_X, CARD_Y + 250);
  ctx.lineTo(CARD_X + CARD_WIDTH, CARD_Y + 250);
  ctx.stroke();
  ctx.restore();
}

function drawStatsRow(ctx: CanvasRenderingContext2D, gameResult: WordlessShareImageGameResult) {
  const centerY = CARD_Y + 320;
  const centerX = CARD_X + CARD_WIDTH / 2;
  drawText(ctx, "Attempts", centerX - 160, centerY, {
    font: "500 26px Inter, Arial, sans-serif",
    color: "#a1a1aa",
    align: "center",
  });
  drawText(ctx, `${gameResult.attempts}/${gameResult.maxAttempts}`, centerX - 70, centerY, {
    font: "700 28px Inter, Arial, sans-serif",
    color: "#18181b",
    align: "center",
  });
  drawText(ctx, "|", centerX, centerY, {
    font: "500 26px Inter, Arial, sans-serif",
    color: "#d4d4d8",
    align: "center",
  });
  drawText(ctx, "Time", centerX + 90, centerY, {
    font: "500 26px Inter, Arial, sans-serif",
    color: "#a1a1aa",
    align: "center",
  });
  drawText(ctx, formatTime(gameResult.totalTime), centerX + 190, centerY, {
    font: "700 28px Inter, Arial, sans-serif",
    color: "#18181b",
    align: "center",
  });

  ctx.save();
  ctx.strokeStyle = "#f1f5f9";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(CARD_X, CARD_Y + 385);
  ctx.lineTo(CARD_X + CARD_WIDTH, CARD_Y + 385);
  ctx.stroke();
  ctx.restore();
}

function drawDistributionPanel(
  ctx: CanvasRenderingContext2D,
  gameResult: WordlessShareImageGameResult,
  stats: DailyChallengeCommunityStats,
) {
  const rows = getDistributionRows(stats, gameResult.maxAttempts);
  const peakCount = Math.max(...rows.map((row) => row.count), 1);
  const solveRate = stats.totalCompleted > 0 ? (stats.totalWins / stats.totalCompleted) * 100 : 0;
  const panelX = CARD_X + 44;
  const panelY = CARD_Y + 430;
  const panelWidth = CARD_WIDTH - 88;
  const barX = panelX + 105;
  const barWidth = panelWidth - 240;

  drawText(ctx, "TODAY", panelX, panelY, {
    font: "700 17px Inter, Arial, sans-serif",
    color: "#a1a1aa",
  });
  drawText(
    ctx,
    `${stats.totalCompleted} players finished · ${stats.totalWins} solved (${formatPercentage(solveRate)}%)`,
    panelX + panelWidth,
    panelY,
    {
      font: "500 18px Inter, Arial, sans-serif",
      color: "#71717a",
      align: "right",
    },
  );

  rows.forEach((row, index) => {
    const y = panelY + 52 + index * 60;
    const barHeight = 42;
    const fillWidth = row.count > 0 ? Math.max(48, (row.count / peakCount) * barWidth) : 0;
    const percentageLabel = row.count > 0 ? `${formatPercentage(row.percentage)}%` : "0%";

    drawText(ctx, row.label, panelX, y + 29, {
      font: "700 18px Inter, Arial, sans-serif",
      color: row.label === "Unsolved" ? "#52525b" : "#3f3f46",
    });

    fillRoundedRect(ctx, barX, y, barWidth, barHeight, 12, "#f4f4f5");

    if (row.count > 0) {
      fillRoundedRect(ctx, barX, y, fillWidth, barHeight, 12, row.fillColor);
      drawText(ctx, String(row.count), barX + fillWidth - 18, y + 28, {
        font: "700 18px Inter, Arial, sans-serif",
        color: "#ffffff",
        align: "right",
      });
    }

    drawText(ctx, percentageLabel, panelX + panelWidth, y + 29, {
      font: "700 18px Inter, Arial, sans-serif",
      color: row.count === 0 ? "#a1a1aa" : "#71717a",
      align: "right",
    });
  });
}

function drawPatternPanel(
  ctx: CanvasRenderingContext2D,
  gameResult: WordlessShareImageGameResult,
) {
  const rows = parsePatternRows(gameResult.pattern);
  const fallbackRows = rows.length > 0
    ? rows
    : Array.from({ length: Math.min(gameResult.maxAttempts, 6) }, () =>
        Array.from({ length: gameResult.wordLength }, () => "⬜"),
      );
  const columns = Math.max(...fallbackRows.map((row) => row.length), gameResult.wordLength);
  const gap = 16;
  const tileSize = 68;
  const boardWidth = columns * tileSize + (columns - 1) * gap;
  const panelX = CARD_X + (CARD_WIDTH - boardWidth) / 2;
  const panelY = CARD_Y + 470;

  drawText(ctx, "TODAY", CARD_X + 44, CARD_Y + 430, {
    font: "700 17px Inter, Arial, sans-serif",
    color: "#a1a1aa",
  });
  drawText(
    ctx,
    gameResult.isWin ? "A strong finish worth sharing." : "A close run, with no spoiler.",
    CARD_X + CARD_WIDTH - 44,
    CARD_Y + 430,
    {
      font: "500 18px Inter, Arial, sans-serif",
      color: "#71717a",
      align: "right",
    },
  );

  fallbackRows.forEach((row, rowIndex) => {
    row.forEach((symbol, columnIndex) => {
      const x = panelX + columnIndex * (tileSize + gap);
      const y = panelY + rowIndex * (tileSize + gap);
      fillRoundedRect(ctx, x, y, tileSize, tileSize, 16, getTileColor(symbol));
    });
  });
}

function drawFooter(ctx: CanvasRenderingContext2D, shareUrl: string) {
  const footerY = CARD_Y + CARD_HEIGHT - 90;
  ctx.save();
  ctx.strokeStyle = "#f1f5f9";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(CARD_X, footerY - 38);
  ctx.lineTo(CARD_X + CARD_WIDTH, footerY - 38);
  ctx.stroke();
  ctx.restore();

  drawText(ctx, "Play Wordless Game", CARD_X + 44, footerY - 2, {
    font: "700 18px Inter, Arial, sans-serif",
    color: "#a1a1aa",
  });
  drawText(ctx, shareUrl, CARD_X + 44, footerY + 34, {
    font: "500 22px Inter, Arial, sans-serif",
    color: "#52525b",
  });
}

export async function createWordlessShareImageBlob({
  gameResult,
  shareUrl,
}: CreateWordlessShareImageOptions) {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas rendering is unavailable.");
  }

  drawBackground(ctx, gameResult.isWin);
  drawCard(ctx);
  drawHeader(ctx, gameResult);
  drawStatsRow(ctx, gameResult);

  if (gameResult.communityStats && gameResult.communityStats.totalCompleted > 0) {
    drawDistributionPanel(ctx, gameResult, gameResult.communityStats);
  } else {
    drawPatternPanel(ctx, gameResult);
  }

  drawFooter(ctx, shareUrl);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to generate share image."));
        return;
      }

      resolve(blob);
    }, "image/png");
  });
}
