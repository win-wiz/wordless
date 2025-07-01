import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "./ui/dialog";
import { ShareDialog } from "./share-dialog";
import { Share2 } from "lucide-react";
import { useState } from "react";

interface ResultModalProps {
  isOpen: boolean;
  title: string;
  className?: string;
  titleClassName?: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  onNewGame: () => void;
  gameResult?: {
    isWin: boolean;
    attempts: number;
    maxAttempts: number;
    word: string;
    totalTime: number;
    wordLength: number;
    pattern?: string;
  };
}

export function ResultModal({ isOpen, onClose, title, description, titleClassName, children, className, onNewGame, gameResult }: ResultModalProps) {
    const [shareDialogOpen, setShareDialogOpen] = useState(false);

    return (
      <>
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className={cn("max-w-lg", className)}>
            <DialogHeader className={cn(titleClassName)}>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>
                {description}
              </DialogDescription>
            </DialogHeader>
            {children}
            
            {/* Share Button */}
            {gameResult && (
              <div className="border-t border-gray-200 pt-4">
                <div className="text-center">
                  <Button
                    onClick={() => setShareDialogOpen(true)}
                    className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 mx-auto"
                  >
                    <Share2 size={18} />
                    Share Result
                  </Button>
                  <p className="text-sm text-gray-600 mt-2">Share your achievement with friends!</p>
                </div>
              </div>
            )}
            
            <DialogFooter className="flex justify-center gap-y-2">
              <Button className="px-4 py-2 bg-violet-500 text-white rounded-md hover:bg-violet-600 transition-colors" onClick={onNewGame}>New Game</Button>
              <Button className="px-4 py-2 bg-white text-violet-600 rounded-md hover:bg-violet-50 transition-all font-medium text-lg border-2 border-violet-200" onClick={onClose}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Share Dialog */}
        {gameResult && (
          <ShareDialog
            isOpen={shareDialogOpen}
            onClose={() => setShareDialogOpen(false)}
            title="Share Your Result"
            description={gameResult.isWin ? "Show off your victory!" : "Challenge your friends to do better!"}
            gameResult={gameResult}
          />
        )}
      </>
    )
}