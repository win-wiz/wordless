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
}

export function ResultModal({ isOpen, onClose, title, description, titleClassName, children, className }: ResultModalProps) {
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
          <DialogFooter>
            <Button className="mt-5" onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
}