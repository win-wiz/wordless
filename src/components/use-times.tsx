'use client'

import { useEffect, useState, useCallback, useRef } from "react"
import { formatTime } from "@/lib/utils"
import { Clock } from "lucide-react"
import { memo } from "react"

interface UseTimesProps {
  showKeyboard: boolean
  hasFirstInput: boolean
  isGameOver: boolean
  onTimeChange: (time: number) => void
}

// 创建记忆化的时钟图标组件
const ClockIcon = memo(() => (
  <Clock className="w-4 h-4 text-violet-500" />
));

ClockIcon.displayName = 'ClockIcon';

// 创建记忆化的时间显示组件
const TimeDisplay = memo(({ time }: { time: number }) => (
  <span className="text-violet-700 font-medium min-w-[48px] text-center">
    {formatTime(time)}
  </span>
));

TimeDisplay.displayName = 'TimeDisplay';

function UseTimes({ showKeyboard, hasFirstInput, isGameOver, onTimeChange }: UseTimesProps) {
  const [time, setTime] = useState(1)
  const [isRunning, setIsRunning] = useState(false)
  const timeRef = useRef(1)
  const onTimeChangeRef = useRef(onTimeChange)

  // 更新 ref
  useEffect(() => {
    onTimeChangeRef.current = onTimeChange
  }, [onTimeChange])

  // 更新时间的函数 - 立即同步到父组件
  const updateTime = useCallback(() => {
    setTime(prevTime => {
      const newTime = prevTime + 1
      timeRef.current = newTime
      // 立即传递新时间给父组件
      onTimeChangeRef.current(newTime)
      return newTime
    })
  }, [])

  // 处理计时器的启动和停止
  useEffect(() => {
    if (hasFirstInput && showKeyboard && !isGameOver) {
      setIsRunning(true)
    } else if (isGameOver || !showKeyboard) {
      setIsRunning(false)
      // 游戏结束时确保最后的时间传递给父组件
      if (isGameOver) {
        onTimeChangeRef.current(timeRef.current)
      }
    }
  }, [hasFirstInput, showKeyboard, isGameOver])

  // 处理计时器的运行
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (isRunning) {
      intervalId = setInterval(updateTime, 1000)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isRunning, updateTime])

  // 重置游戏时重置计时器
  useEffect(() => {
    if (!hasFirstInput) {
      timeRef.current = 1
      setTime(1)
      setIsRunning(false)
      // 重置时也要通知父组件
      onTimeChangeRef.current(1)
    }
  }, [hasFirstInput])

  // 组件初始化时确保时间同步
  useEffect(() => {
    onTimeChangeRef.current(time)
  }, [time])

  return (
    <div className="flex items-center gap-2 h-full">
      <ClockIcon />
      <TimeDisplay time={time} />
    </div>
  )
}

export default memo(UseTimes);