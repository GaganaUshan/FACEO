"use client";

import ResultLayout from "@/shared/components/ResultLayout";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import ConfidenceMeter from "@/shared/components/ConfidenceMeter";

interface FaceMarksResult {
  detections: { label: string; confidence: number; bbox: { x: number; y: number; w: number; h: number } }[];
  totalDetections: number;
  avgConfidence?: number;
  selectedModel?: string;
  timeline?: number[];
  sessionType: string;
  duration?: number;
  uploadedImage?: string;
  imageWidth?: number;
  imageHeight?: number;
}

export default function FaceMarksResultsPage() {
  const [results, setResults] = useState<FaceMarksResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("faceo_facemarks_results");
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
      <ResultLayout title="Face Marks Results" backHref="/face-marks" backLabel="Run Analysis">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-10 max-w-lg mx-auto text-center flex flex-col items-center">
          <AlertCircle className="w-12 h-12 text-red-500/80 mb-6" />
          <h2 className="text-2xl font-light tracking-tight mb-4">No Human Detected</h2>
          <p className="text-white/50 font-light mb-8 text-sm leading-relaxed">{(results as any).error}</p>
          <Link href="/face-marks" className="px-8 py-3 bg-white text-black rounded-full text-sm font-medium tracking-wide hover:scale-105 transition-transform">
            Try Again
          </Link>
        </motion.div>
      </ResultLayout>
    );
  }

  if (!results) {
    return (
      <ResultLayout title="Face Marks Results" backHref="/face-marks" backLabel="Run Analysis">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-10 max-w-lg mx-auto text-center flex flex-col items-center">
          <AlertCircle className="w-12 h-12 text-white/30 mb-6" />
          <h2 className="text-2xl font-light tracking-tight mb-4">No Session Data</h2>
          <p className="text-white/50 font-light mb-8 text-sm">Please complete a face marks analysis first.</p>
          <Link href="/face-marks" className="px-8 py-3 bg-white text-black rounded-full text-sm font-medium tracking-wide hover:scale-105 transition-transform">
            Start Analysis
          </Link>
        </motion.div>
      </ResultLayout>
    );
  }

  return (
    <ResultLayout title="Face Marks Results" sessionId="FCO-MRK-2026" backHref="/face-marks" backLabel="New Analysis">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Detections */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
          <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-6 font-bold">Total Detections</h3>
          <span className="text-6xl font-light">{results.totalDetections}</span>
          <p className="text-[10px] uppercase tracking-widest text-white/30 mt-2">Marks Identified</p>
        </motion.div>

        {/* Avg Confidence */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-8">
          <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-6 font-bold">Avg Confidence</h3>
          <span className="text-6xl font-light">
            {results.avgConfidence || Math.round(results.detections.reduce((a, d) => a + d.confidence, 0) / (results.detections.length || 1))}%
          </span>
          <p className="text-[10px] uppercase tracking-widest text-white/30 mt-2">Detection Accuracy</p>
        </motion.div>

        {/* Session Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-8">
          <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-6 font-bold">Model Info</h3>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Architecture</p>
              <p className="text-lg font-light">{results.selectedModel || "YOLOv8"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Mode</p>
              <p className="text-lg font-light capitalize">{results.sessionType}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Detection Details */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-8 mb-6">
        <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-8 font-bold border-b border-white/5 pb-4">Detection Breakdown</h3>
        {results.detections.length > 0 ? (
          <div className="space-y-6">
            {results.detections.map((det, i) => (
              <div key={i} className="border border-white/5 bg-white/[0.02] rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-light text-white/80 uppercase tracking-widest">{det.label}</span>
                  <span className="text-[10px] font-mono text-white/40">
                    @ ({det.bbox.x}, {det.bbox.y}) — {det.bbox.w}×{det.bbox.h}
                  </span>
                </div>
                <ConfidenceMeter value={det.confidence} label="Confidence" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/40 italic">No marks were detected in this session.</p>
        )}
      </motion.div>

      {/* Timeline */}
      {results.timeline && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel p-8 mb-6">
          <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-8 font-bold border-b border-white/5 pb-4">Detection Timeline</h3>
          <div className="h-32 flex items-end gap-3 border-b border-white/10 pb-2">
            {results.timeline.map((count, i) => {
              const max = Math.max(...results.timeline!, 1);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-mono text-white/40">{count}</span>
                  <div className="w-full bg-white/20 rounded-t-sm hover:bg-white/40 transition-colors" style={{ height: `${(count / max) * 100}%`, minHeight: count > 0 ? "8px" : "2px" }} />
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Uploaded Image */}
      {results.uploadedImage && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-panel p-8">
          <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-8 font-bold border-b border-white/5 pb-4">Analyzed Sample</h3>
          <div className="flex justify-center">
            <div className="relative inline-block">
              <img src={results.uploadedImage} alt="Analyzed Sample" className="max-w-full rounded-lg shadow-2xl border border-white/10 block" style={{ maxHeight: "400px" }} />
              {results.imageWidth && results.imageHeight && results.detections.map((det, i) => (
                <div key={i} className="absolute border-2 border-red-500 bg-red-500/20" style={{
                  left: `${(det.bbox.x / results.imageWidth!) * 100}%`,
                  top: `${(det.bbox.y / results.imageHeight!) * 100}%`,
                  width: `${(det.bbox.w / results.imageWidth!) * 100}%`,
                  height: `${(det.bbox.h / results.imageHeight!) * 100}%`,
                }}>
                  <span className="absolute -top-6 left-0 bg-red-500 text-white text-[10px] px-1 py-0.5 whitespace-nowrap rounded font-bold">
                    {det.label} {det.confidence}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </ResultLayout>
  );
}
