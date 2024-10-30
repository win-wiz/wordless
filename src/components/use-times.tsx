import { formatTime } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

export default function UseTimes({
  showKeyboard,
  onTimeChange
}: {
  showKeyboard: boolean,
  onTimeChange: (time: number) => void
}) {
  const [timer, setTimer] = useState(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    if (isTimerRunning) {
        let count = 1;
        timerRef.current = setInterval(() => {
            count++;
            setTimer(prevTimer => prevTimer + 1);
            onTimeChange(count);
        }, 1000);
    } else if (timerRef.current) {
        clearInterval(timerRef.current);
        setTimer(0);
    }

    return () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    };
  }, [isTimerRunning]);

  useEffect(() => {
    if (showKeyboard) { 
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(false);
    }
  }, [showKeyboard]);
  
  return showKeyboard && (
    <div className="absolute -top-4 sm:-top-6 md:-top-12 right-0">
      <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-violet-100">
        <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-violet-500" />
        <span className="text-sm md:text-base text-violet-700 font-medium">
          {formatTime(timer)}
        </span>
      </div>
    </div>
  )
}