"use client";

import Navigation from "@/components/Navigation";
import { motion } from "framer-motion";
import { Download, Share2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { type ReactNode } from "react";

interface ResultLayoutProps {
  title: string;
  sessionId?: string;
  children: ReactNode;
  backHref?: string;
  backLabel?: string;
}

export default function ResultLayout({
  title,
  sessionId,
  children,
  backHref = "/",
  backLabel = "New Analysis",
}: ResultLayoutProps) {
  const downloadReport = () => {
    window.print();
  };

  return (
    <main className="min-h-screen pt-28 pb-20 px-6 relative bg-[#050505]">
      <Navigation />

      <div className="max-w-6xl mx-auto z-10 relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/10 pb-6 print:border-none print:mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-2">
              {title}
            </h1>
            {sessionId && (
              <p className="text-white/50 font-mono tracking-widest uppercase text-xs">
                Session ID: {sessionId}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-4 mt-6 md:mt-0 print:hidden"
          >
            <Link
              href={backHref}
              className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium tracking-wide flex items-center gap-2 transition-colors"
            >
              {backLabel}
            </Link>
            <button
              onClick={downloadReport}
              className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium tracking-wide flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" /> Export
            </button>
            <button className="px-6 py-2.5 bg-white text-black rounded-full text-sm font-medium tracking-wide flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </motion.div>
        </div>

        {/* Content */}
        {children}

        {/* Disclaimer Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="border border-white/5 bg-white/[0.02] rounded-xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center text-sm mt-12 mb-10"
        >
          <AlertCircle className="w-6 h-6 text-white/40 shrink-0" />
          <p className="text-white/40 leading-relaxed font-light">
            <strong className="text-white/60 block mb-1">
              Ethical & Research Disclaimer
            </strong>
            AI predictions presented in this dashboard are probabilistic estimations derived from neural network inferences.
            Results should not be used in critical security, legal, or medical verifications.
            This system is intended strictly as a research prototype by Faceo Analytics.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
