"use client";

import ResultLayout from "@/shared/components/ResultLayout";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

interface EmotionResult {
  dominant: string;
  confidence: number;
  emotions: Record<string, number>;
  trend: number[];
  selectedModel?: string;
  emotionFrequency?: Record<string, number>;
  sessionType: string;
  duration?: number;
  uploadedImage?: string;
}

export default function EmotionResultsPage() {
  const [results, setResults] = useState<EmotionResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("faceo_emotion_results");
    if (stored) {
      try { setResults(JSON.parse(stored)); } catch { /* empty */ }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="w-6 h-6 rounded-full border-t-2 border-white animate-spin opacity-50" />
      </main>
    );
  }

  if (results && (results as any).error) {
    return (
      <ResultLayout title="Emotion Results" backHref="/emotion" backLabel="Run Analysis">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-10 max-w-lg mx-auto text-center flex flex-col items-center">
          <AlertCircle className="w-12 h-12 text-red-500/80 mb-6" />
          <h2 className="text-2xl font-light tracking-tight mb-4">No Human Detected</h2>
          <p className="text-white/50 font-light mb-8 text-sm leading-relaxed">{(results as any).error}</p>
          <Link href="/emotion" className="px-8 py-3 bg-white text-black rounded-full text-sm font-medium tracking-wide hover:scale-105 transition-transform">
            Try Again
          </Link>
        </motion.div>
      </ResultLayout>
    );
  }

  if (!results) {
    return (
      <ResultLayout title="Emotion Results" backHref="/emotion" backLabel="Run Analysis">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-10 max-w-lg mx-auto text-center flex flex-col items-center">
          <AlertCircle className="w-12 h-12 text-white/30 mb-6" />
          <h2 className="text-2xl font-light tracking-tight mb-4">No Session Data</h2>
          <p className="text-white/50 font-light mb-8 text-sm">Please complete an emotion analysis session first.</p>
          <Link href="/emotion" className="px-8 py-3 bg-white text-black rounded-full text-sm font-medium tracking-wide hover:scale-105 transition-transform">
            Start Emotion Analysis
          </Link>
        </motion.div>
      </ResultLayout>
    );
  }

  const sortedEmotions = Object.entries(results.emotions).sort((a, b) => b[1] - a[1]);

  return (
    <ResultLayout title="Emotion Results" sessionId="FCO-EMO-2026" backHref="/emotion" backLabel="New Analysis">
      {/* Dominant Emotion Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 font-bold">Dominant Emotion</h3>
          {results.selectedModel && (
            <span className="text-[10px] font-mono tracking-widest uppercase bg-white/10 border border-white/15 px-3 py-1 rounded-full text-white/90 font-medium">
              Model: {results.selectedModel}
            </span>
          )}
        </div>
        <div className="flex items-end gap-6 border-b border-white/5 pb-8 mb-6 relative z-10">
          <h2 className="text-6xl font-light tracking-tight text-white capitalize">{results.dominant}</h2>
          <div className="pb-2">
            <p className="text-white/40 text-sm font-mono tracking-widest mb-1">CONFIDENCE</p>
            <p className="text-2xl font-light">{results.confidence}%</p>
          </div>
        </div>
        <p className="text-white/50 text-sm leading-relaxed max-w-lg font-light relative z-10">
          The <strong className="text-white">{results.selectedModel || "neural network"}</strong> identified <strong className="text-white/80">{results.dominant}</strong> as the dominant emotion across the analysis session with {results.confidence}% peak confidence.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Emotion Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-8">
          <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-8 font-bold border-b border-white/5 pb-4">Emotion Breakdown</h3>
          <div className="space-y-5">
            {sortedEmotions.map(([emotion, score], i) => (
              <div key={emotion}>
                <div className="flex justify-between text-xs mb-1.5 uppercase font-mono tracking-wider">
                  <span className={i === 0 ? "text-white" : "text-white/50"}>{emotion}</span>
                  <span className={i === 0 ? "text-white" : "text-white/30"}>{score}%</span>
                </div>
                <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-white transition-all duration-500" style={{ width: `${score}%`, opacity: i === 0 ? 1 : 0.25 }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Trend Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-8">
          <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-8 font-bold border-b border-white/5 pb-4">Confidence Trend</h3>
          <div className="h-40 flex items-end gap-2 border-b border-white/10 pb-2 relative">
            <div className="absolute inset-0 border-b border-white/5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {results.trend.map((val, i) => (
              <div key={i} className="flex-1 bg-white/20 rounded-t-sm hover:bg-white/40 transition-colors relative group" style={{ height: `${val}%` }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-mono px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {val}%
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-white/30 uppercase tracking-widest font-mono">
            <span>Start</span>
            <span>{results.duration ? `${Math.round(results.duration / 60)}m` : "End"}</span>
          </div>
        </motion.div>
      </div>

      {/* Uploaded Image */}
      {results.uploadedImage && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-panel p-8">
          <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-8 font-bold border-b border-white/5 pb-4">Analyzed Sample</h3>
          <div className="flex justify-center">
            <img src={results.uploadedImage} alt="Analyzed Sample" className="max-w-full rounded-lg shadow-2xl border border-white/10" style={{ maxHeight: "400px" }} />
          </div>
        </motion.div>
      )}
    </ResultLayout>
  );
}
