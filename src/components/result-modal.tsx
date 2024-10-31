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

interface ResultModalProps {
  isOpen: boolean;
  title: string;
  className?: string;
  titleClassName?: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  onNewGame: () => void;
}

export function ResultModal({ isOpen, onClose, title, description, titleClassName, children, className, onNewGame }: ResultModalProps) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={cn(className)}>
          <DialogHeader className={cn(titleClassName)}>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>
          {children}
          <DialogFooter className="flex justify-center">
            <Button className="px-4 py-2 bg-violet-500 text-white rounded-md hover:bg-violet-600 transition-colors" onClick={onNewGame}>New Game</Button>
            <Button className="px-4 py-2 bg-white text-violet-600 rounded-md hover:bg-violet-50 transition-all font-medium text-lg border-2 border-violet-200" onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
}