"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";

interface SessionTimerProps {
  durationSeconds: number;
  isRunning: boolean;
  onComplete: () => void;
  label?: string;
}

export default function SessionTimer({
  durationSeconds,
  isRunning,
  onComplete,
  label = "Session",
}: SessionTimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const hasCompleted = useRef(false);

  const progress = Math.min((elapsed / durationSeconds) * 100, 100);
  const remaining = Math.max(durationSeconds - elapsed, 0);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  const handleComplete = useCallback(() => {
    if (!hasCompleted.current) {
      hasCompleted.current = true;
      onComplete();
    }
  }, [onComplete]);

  useEffect(() => {
    if (isRunning) {
      hasCompleted.current = false;
      setElapsed(0);
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          if (next >= durationSeconds) {
            clearInterval(intervalRef.current);
            return durationSeconds;
          }
          return next;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, durationSeconds]);

  useEffect(() => {
    if (elapsed >= durationSeconds && isRunning) {
      handleComplete();
    }
  }, [elapsed, durationSeconds, isRunning, handleComplete]);

  return (
    <div className="w-full flex items-center gap-4">
      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-white relative"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/50 blur-sm" />
        </motion.div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-white/30 tracking-widest uppercase">{label}</span>
        <span className="text-xs text-white/50 tracking-widest font-mono w-14 text-right">
          {minutes}:{seconds.toString().padStart(2, "0")}
        </span>
        <span className="text-xs text-white/30 tracking-widest font-mono w-10 text-right">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}
