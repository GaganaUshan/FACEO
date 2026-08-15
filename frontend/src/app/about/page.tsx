"use client";

import Navigation from "@/components/Navigation";
import { motion } from "framer-motion";

export default function AboutPage() {
    return (
        <main className="min-h-screen pt-32 pb-20 px-6 relative">
            <Navigation />

            <div className="max-w-4xl mx-auto z-10 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4">Project Objectives</h1>
                    <p className="text-white/50 font-light text-lg">
                        Human Authenticity & Behavioral Analysis Platform
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="glass-panel p-10 mb-16"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        {/* Mission Section */}
                        <div className="p-8 border border-white/5 bg-white/[0.02] rounded-2xl relative overflow-hidden group hover:border-white/20 transition-all duration-500">
                            <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 blur-3xl rounded-full" />
                            <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-white/40 mb-4 relative z-10">Our Mission</h3>
                            <h4 className="text-2xl font-light mb-4 relative z-10 text-white/90">Restoring Trust in the <br />Digital Identity</h4>
                            <p className="text-white/50 leading-relaxed font-light text-sm relative z-10">
                                In an era where deepfakes and AI-generated media blur the line between reality and synthetic creation, our mission is to build a reliable, lightweight ecosystem that mathematically proves human authenticity, protecting digital identities across low-resource environments.
                            </p>
                        </div>

                        {/* Vision Section */}
                        <div className="p-8 border border-white/5 bg-white/[0.02] rounded-2xl relative overflow-hidden group hover:border-white/20 transition-all duration-500">
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full" />
                            <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-white/40 mb-4 relative z-10">Our Vision</h3>
                            <h4 className="text-2xl font-light mb-4 relative z-10 text-white/90">Democratizing Advanced <br />Behavioral Forensics</h4>
                            <p className="text-white/50 leading-relaxed font-light text-sm relative z-10">
                                We envision a future where high-end behavioral analytics, psychological profiling, and deepfake verification are not locked behind massive cloud compute centers, but run securely at the edge on everyday mid-range devices, accessible to researchers worldwide.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 p-6 border border-white/5 bg-white/5 rounded-xl">
                        <h4 className="text-sm uppercase tracking-widest text-white/50 mb-3">Ethical Disclaimer</h4>
                        <p className="text-xs text-white/40 leading-relaxed">
                            AI predictions provided by this platform are probabilistic and may not always be completely accurate.
                            The deepfake detection module provides an estimated authenticity score based on trained datasets and should
                            not be used as definitive proof in critical legal or medical scenarios. This system is intended strictly
                            for research, educational, and experimental use.
                        </p>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
