import { cn } from "@/lib/utils";
import type { CellState } from "@/lib/game-state";

interface GameGridProps {
  gridContent: string[];
  columns: number;
  gridCol: string;
  currentCell: number;
  showActiveCellHighlight: boolean;
  currentRow: number;
  invalidRows: Set<number>;
  flippingRows: Set<number>;
  cellStates: CellState[];
  isCurrentRowReady: boolean;
  isInteractionLocked: boolean;
  isLoadingWord: boolean;
  deletingCells: Map<number, { content: string; state: CellState }>;
  poppingCells: Set<number>;
}

export function GameGrid({
  gridContent,
  columns,
  gridCol,
  currentCell,
  showActiveCellHighlight,
  currentRow,
  invalidRows,
  flippingRows,
  cellStates,
  isCurrentRowReady,
  isInteractionLocked,
  isLoadingWord,
  deletingCells,
  poppingCells,
}: GameGridProps) {
  return (
    <div className={cn(`grid ${gridCol} mb-8 gap-2`, isLoadingWord && 'opacity-75')}>
      {gridContent.map((content, index) => {
        const row = Math.floor(index / columns);
        const col = index % columns;
        const isInvalidRow = invalidRows.has(row);
        const isFlipping = flippingRows.has(row);
        const isActiveRow = row === currentRow && !isInteractionLocked;
        const deletingSnapshot = deletingCells.get(index);
        const isDeleting = Boolean(deletingSnapshot);
        const isPopping = poppingCells.has(index);
        const cellState = deletingSnapshot?.state ?? cellStates[index] ?? 'empty';
        const cellContent = deletingSnapshot?.content ?? content;
        
        return (
          <div 
            key={index} 
            className={cn(`
              w-14 h-14 
              flex items-center justify-center 
              text-2xl font-bold 
              rounded-md 
              transition-all duration-200 ease-out
              ${content ? 'border-2' : 'border border-violet-200/50'}
              ${showActiveCellHighlight && index === currentCell ? 'ring-2 ring-violet-400 ring-offset-2 ring-offset-white scale-[1.02]' : ''}
              ${isActiveRow && !content ? 'bg-violet-50/60 border-violet-200' : ''}
              ${isCurrentRowReady && row === currentRow ? 'shadow-[0_0_0_1px_rgba(139,92,246,0.18),0_8px_24px_rgba(139,92,246,0.12)]' : ''}
              ${isInvalidRow && content ? 'border-red-400 text-red-500' : 'text-zinc-700'}
              ${isInvalidRow ? 'animate-shake' : ''}
              ${isDeleting ? 'animate-cellDelete' : ''}
              ${isPopping ? 'animate-cellPop' : ''}
              ${isFlipping ? 'animate-flip' : ''}`,
              cellState === 'correct' ? 'bg-green-500 text-white border-green-400' :
              cellState === 'present' ? 'bg-yellow-500 text-white border-yellow-400' :
              cellState === 'absent' ? 'bg-zinc-400 text-white border-zinc-400' : 'bg-white',
            )}
            style={{
              animationDelay: isFlipping ? `${col * 100}ms` : '0ms'
            }}
          >
            {cellContent}
          </div>
        );
      })}
    </div>
  );
} 
