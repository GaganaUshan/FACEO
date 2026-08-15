"use client";

import Navigation from "@/components/Navigation";
import { motion } from "framer-motion";
import { Download, Share2, ShieldCheck, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ResultsPage() {
    const [finalResults, setFinalResults] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Quick retry interval for immediate navigation fetches
        let attempts = 0;
        const checkStorage = setInterval(() => {
            const stored = sessionStorage.getItem("faceo_results");
            if (stored) {
                try {
                    setFinalResults(JSON.parse(stored));
                    setIsLoading(false);
                    clearInterval(checkStorage);
                } catch (e) {
                    console.error("Failed to parse results");
                    setIsLoading(false);
                    clearInterval(checkStorage);
                }
            } else if (attempts > 5) {
                // Give up after ~500ms
                setIsLoading(false);
                clearInterval(checkStorage);
            }
            attempts++;
        }, 100);

        return () => clearInterval(checkStorage);
    }, []);

    const downloadReport = () => {
        alert("Exporting PDF Research Report (Placeholder)");
        // window.print() is the easiest way to generate a PDF report natively
        window.print();
    };

    if (isLoading) {
        return (
            <main className="min-h-screen pt-28 pb-20 px-6 relative bg-[#050505] flex items-center justify-center">
                <Navigation />
                <div className="w-6 h-6 rounded-full border-t-2 border-white animate-spin opacity-50" />
            </main>
        );
    }

    if (finalResults && finalResults.error) {
        return (
            <main className="min-h-screen pt-28 pb-20 px-6 relative bg-[#050505] flex items-center justify-center">
                <Navigation />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-panel p-10 max-w-lg text-center flex flex-col items-center"
                >
                    <AlertCircle className="w-12 h-12 text-red-500/80 mb-6" />
                    <h2 className="text-2xl font-light tracking-tight mb-4">No Human Detected</h2>
                    <p className="text-white/50 font-light mb-8 text-sm leading-relaxed">
                        {finalResults.error}
                    </p>
                    <Link
                        href="/analysis"
                        className="px-8 py-3 bg-white text-black rounded-full text-sm font-medium tracking-wide hover:scale-105 transition-transform"
                    >
                        Restart Session
                    </Link>
                </motion.div>
            </main>
        );
    }

    if (!finalResults) {
        return (
            <main className="min-h-screen pt-28 pb-20 px-6 relative bg-[#050505] flex items-center justify-center">
                <Navigation />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-panel p-10 max-w-lg text-center flex flex-col items-center"
                >
                    <AlertCircle className="w-12 h-12 text-white/30 mb-6" />
                    <h2 className="text-2xl font-light tracking-tight mb-4">No Session Data Found</h2>
                    <p className="text-white/50 font-light mb-8 text-sm leading-relaxed">
                        The results dashboard requires completed behavioral and authenticity telemetry. Please complete a live analysis session first.
                    </p>
                    <Link
                        href="/analysis"
                        className="px-8 py-3 bg-white text-black rounded-full text-sm font-medium tracking-wide hover:scale-105 transition-transform"
                    >
                        Start Live Analysis
                    </Link>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen pt-28 pb-20 px-6 relative bg-[#050505]">
            <Navigation />

            <div className="max-w-6xl mx-auto z-10 relative">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/10 pb-6 print:border-none print:mb-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-2">Analysis Results</h1>
                        <p className="text-white/50 font-mono tracking-widest uppercase text-xs">Session ID: LXF-2026-X84B</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-4 mt-6 md:mt-0 print:hidden"
                    >
                        <button
                            onClick={downloadReport}
                            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium tracking-wide flex items-center gap-2 transition-colors"
                        >
                            <Download className="w-4 h-4" /> Export Report
                        </button>
                        <button className="px-6 py-2.5 bg-white text-black rounded-full text-sm font-medium tracking-wide flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                            <Share2 className="w-4 h-4" /> Share
                        </button>
                    </motion.div>
                </div>

                {/* Subject Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 glass-panel p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full pointer-events-none" />
                    {finalResults.subjectFrame ? (
                        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border border-white/10 shrink-0 relative z-10 shadow-2xl">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={finalResults.subjectFrame} alt="Subject" className="w-full h-full object-cover grayscale brightness-110 contrast-125" />
                        </div>
                    ) : (
                        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center shrink-0 relative z-10">
                            <span className="text-white/30 text-xs tracking-widest uppercase">No Frame</span>
                        </div>
                    )}
                    <div className="flex-1 relative z-10 text-center sm:text-left mt-2 sm:mt-0">
                        <p className="text-[10px] uppercase font-mono tracking-widest text-white/40 mb-2">Subject Identification</p>
                        <h2 className="text-3xl sm:text-4xl font-light tracking-tight mb-2">{finalResults.subjectName || "Unknown Subject"}</h2>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4">
                            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg">
                                <p className="text-[10px] uppercase font-mono tracking-widest text-white/30 mb-1">Session Target</p>
                                <p className="text-sm font-medium text-white/80">{finalResults.authenticity.status === "REAL" ? "Verified Human" : "Unverified"}</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg">
                                <p className="text-[10px] uppercase font-mono tracking-widest text-white/30 mb-1">Primary Emotion</p>
                                <p className="text-sm font-medium text-white/80">{finalResults.emotion.dominant}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

                    {/* Authenticity Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="md:col-span-2 glass-card p-8 relative overflow-hidden flex flex-col justify-center"
                    >
                        <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full pointer-events-none ${finalResults.authenticity.status === 'REAL' ? 'bg-green-500/10' : 'bg-red-500/10'}`} />

                        <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-6 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> Media Authenticity
                        </h3>
                        <div className="flex items-end gap-6 border-b border-white/5 pb-8 mb-6 relative z-10">
                            <h2 className={`text-6xl font-light tracking-tight ${finalResults.authenticity.status === 'REAL' ? 'text-green-400' : 'text-red-400'}`}>
                                {finalResults.authenticity.status}
                            </h2>
                            <div className="pb-2">
                                <p className="text-white/40 text-sm font-mono tracking-widest mb-1">CONFIDENCE</p>
                                <p className="text-2xl font-light">{finalResults.authenticity.confidence}%</p>
                            </div>
                        </div>
                        <p className="text-white/50 text-sm leading-relaxed max-w-lg font-light relative z-10">
                            The neural network analyzed the facial structures within the first 10 seconds and determined the subject's
                            authenticity with high probability. No synthetic GAN artifacts or deepfake distortions were detected.
                        </p>
                    </motion.div>

                    {/* Demographics Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-8 flex flex-col justify-between"
                    >
                        <div>
                            <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-6 font-bold">Demographics</h3>
                            <div className="mb-8">
                                <p className="text-white/40 text-[10px] uppercase font-mono tracking-widest mb-2">Estimated Age</p>
                                <div className="flex items-end gap-3">
                                    <span className="text-5xl font-light">{finalResults.demographics.age}</span>
                                    <span className="text-white/30 text-xs pb-1 uppercase tracking-widest">Years</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-white/40 text-[10px] uppercase font-mono tracking-widest mb-2">Gender Identification</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-light capitalize">{finalResults.demographics.gender}</span>
                                    <span className="text-white/70 font-mono bg-white/5 px-2 py-1 rounded text-xs">{finalResults.demographics.genderConfidence}%</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">

                    {/* Emotion Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-panel p-8"
                    >
                        <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-8 font-bold border-b border-white/5 pb-4">Behavioral & Emotion Mapping</h3>

                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <p className="text-white/40 text-[10px] uppercase font-mono tracking-widest mb-1">Dominant Emotion</p>
                                <span className="text-4xl font-light">{finalResults.emotion.dominant}</span>
                            </div>
                            <div className="text-right">
                                <p className="text-white/40 text-[10px] uppercase font-mono tracking-widest mb-1">Peak Confidence</p>
                                <span className="text-2xl font-light">{finalResults.emotion.confidence}%</span>
                            </div>
                        </div>

                        <div className="h-40 flex items-end gap-2 border-b border-white/10 pb-2 relative">
                            {/* Very simple Mock Trend Graph using raw divs */}
                            <div className="absolute inset-0 border-b border-white/5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            {finalResults.emotion.trend.map((val: number, i: number) => (
                                <div key={i} className="flex-1 bg-white/20 rounded-t-sm hover:bg-white/40 transition-colors relative group" style={{ height: `${val}%` }}>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-mono px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {val}%
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] text-white/30 uppercase tracking-widest font-mono">
                            <span>0m:00s</span>
                            <span>3m:00s</span>
                        </div>
                    </motion.div>

                    {/* Skin Analysis Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="glass-panel p-8"
                    >
                        <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-8 font-bold border-b border-white/5 pb-4">Skin Characteristics</h3>

                        <div className="mb-10">
                            <p className="text-white/40 text-[10px] uppercase font-mono tracking-widest mb-3">Skin Tone Palette</p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full shadow-inner bg-[#c68e5d]" />
                                <div>
                                    <h4 className="text-2xl font-light">{finalResults.skin.tone}</h4>
                                    <p className="text-xs text-white/40 uppercase tracking-widest mt-1">Primary Match</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-white/40 text-[10px] uppercase font-mono tracking-widest mb-3">Texture & Clearness Score</p>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xl font-light">{finalResults.skin.condition}</span>
                                <span className="text-lg font-mono text-white/70">{finalResults.skin.score}%</span>
                            </div>
                            <div className="w-full h-[1px] bg-white/10 relative">
                                <div className="absolute top-0 left-0 h-[2px] -mt-[0.5px] bg-white/60 shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: `${finalResults.skin.score}%` }} />
                            </div>
                            <p className="text-xs text-white/40 leading-relaxed font-light mt-6">
                                Texture score is evaluated using Laplacian variance. A high score suggests smooth facial features with minimal high-frequency edge artifacts.
                            </p>
                        </div>
                    </motion.div>

                </div>

                {/* Disclaimer Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="border border-white/5 bg-white/[0.02] rounded-xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center text-sm mb-10"
                >
                    <AlertCircle className="w-6 h-6 text-white/40 shrink-0" />
                    <p className="text-white/40 leading-relaxed font-light">
                        <strong className="text-white/60 block mb-1">Ethical & Research Disclaimer</strong>
                        AI predictions presented in this dashboard are probabilistic estimations derived from neural network inferences.
                        Deepfake detection rates are subject to model confidence and should not be used in critical security, legal, or medical verifications.
                        This system is intended strictly as a research prototype.
                    </p>
                </motion.div>

            </div>
        </main>
    );
}
