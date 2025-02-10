import { cn } from "@/lib/utils";

interface GameGridProps {
  gridContent: string[];
  columns: number;
  gridCol: string;
  currentCell: number;
  invalidRows: Set<number>;
  flippingRows: Set<number>;
  cellMatchClasses: string[];
}

export function GameGrid({
  gridContent,
  columns,
  gridCol,
  currentCell,
  invalidRows,
  flippingRows,
  cellMatchClasses,
}: GameGridProps) {
  return (
    <div className={`grid ${gridCol} gap-2 mb-8`}>
      {gridContent.map((content, index) => {
        const row = Math.floor(index / columns);
        const col = index % columns;
        const isInvalidRow = invalidRows.has(row);
        const isFlipping = flippingRows.has(row);
        const matchClass = cellMatchClasses[index] ? cellMatchClasses[index] : '';
        
        return (
          <div 
            key={index} 
            className={cn(`
              w-14 h-14 
              flex items-center justify-center 
              text-2xl font-bold 
              rounded-md 
              transition-all duration-200
              ${content ? 'border-2' : 'border border-violet-200/50'}
              ${index === currentCell ? 'ring-2 ring-violet-400' : ''}
              ${isInvalidRow && content ? 'border-red-400 text-red-500' : 'text-zinc-700'}
              ${isFlipping ? 'animate-flip' : ''}`, 
              matchClass === 'C' ? 'bg-green-500 text-white border-green-400' : 
              matchClass === 'P' ? 'bg-yellow-500 text-white border-yellow-400' : 
              matchClass === 'X' ? 'bg-zinc-400 text-white border-zinc-400' : 'bg-white',
            )}
            style={{
              animationDelay: isFlipping ? `${col * 100}ms` : '0ms'
            }}
          >
            {content}
          </div>
        );
      })}
    </div>
  );
} 