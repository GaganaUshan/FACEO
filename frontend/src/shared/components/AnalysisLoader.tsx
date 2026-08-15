"use client";

import { motion } from "framer-motion";

interface AnalysisLoaderProps {
  message?: string;
}

export default function AnalysisLoader({ message = "Analyzing" }: AnalysisLoaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center"
    >
      <div className="relative mb-8">
        <div className="w-16 h-16 rounded-full border border-white/10" />
        <div className="absolute inset-0 w-16 h-16 rounded-full border-t-2 border-white animate-spin" />
      </div>
      <p className="text-sm tracking-[0.3em] uppercase text-white/60 font-light">
        {message}
      </p>
      <div className="flex gap-1.5 mt-4">
        <div className="w-1 h-1 rounded-full bg-white/40 loading-dot" />
        <div className="w-1 h-1 rounded-full bg-white/40 loading-dot" />
        <div className="w-1 h-1 rounded-full bg-white/40 loading-dot" />
      </div>
    </motion.div>
  );
}
