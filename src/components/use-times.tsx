import { formatTime } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export default function UseTimes({
  showKeyboard,
  onTimeChange
}: {
  showKeyboard: boolean,
  onTimeChange: (time: number) => void
}) {
  const [timer, setTimer] = useState(1); // 计时器
  const timerRef = useRef<NodeJS.Timeout | null>(null); // 获取定时器
  const [isTimerRunning, setIsTimerRunning] = useState(false); // 是否运行计时器

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
    // debugger;
    if (showKeyboard) { 
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(false);
    }
  }, [showKeyboard]);
  
  return showKeyboard && (
      <div className="absolute top-20 right-5">
          <p>Total time: <span className="inline-block md:w-20 w-14">{formatTime(timer)}</span></p>
      </div>
  )
}