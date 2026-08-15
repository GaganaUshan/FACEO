"use client";

import Navigation from "@/components/Navigation";
import { motion } from "framer-motion";
import { Target, Eye, Compass, Rocket } from "lucide-react";

const objectives = [
  "Build a reliable, lightweight ecosystem for proving human authenticity",
  "Develop cross-cultural emotion detection with sub-second latency",
  "Create accessible deepfake verification for mid-range devices",
  "Implement YOLO-based facial mark detection for character identification in case of criminology",
  "Ensure ethical AI practices with transparent confidence reporting",
  "Design a modular hybrid architecture for independent service scaling",
];

const roadmap = [
  { phase: "Phase 1", title: "Core Platform", description: "Emotion detection, age/gender estimation, and basic authenticity checks via hybrid architecture.", status: "complete" },
  { phase: "Phase 2", title: "Advanced Detection", description: "YOLO-based bruise/mark detection and enhanced deepfake classification with MobileNetV2.", status: "current" },
  { phase: "Phase 3", title: "Edge Optimization", description: "Full offline capability with on-device model inference using WebGPU and ONNX Runtime.", status: "upcoming" },
  { phase: "Phase 4", title: "Enterprise API & SDK", description: "Developer-focused REST APIs and lightweight edge SDKs for third-party verification and custom security pipelines.", status: "upcoming" },
];

export default function VisionMissionPage() {
  return (
    <main className="min-h-screen pt-32 pb-20 px-6 relative">
      <Navigation />

      <div className="max-w-5xl mx-auto z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4">Vision & Mission</h1>
          <p className="text-white/50 font-light text-lg">
            Faceo Analytics — Face Intelligence Platform
          </p>
        </motion.div>

        {/* Vision & Mission Cards */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
        >
          <div className="glass-card p-8 relative overflow-hidden group hover:border-white/20 transition-all duration-500">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 blur-3xl rounded-full" />
            <div className="relative z-10">
              <Eye className="w-8 h-8 text-white/30 mb-6" />
              <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-white/40 mb-4">Our Vision</h3>
              <h4 className="text-2xl font-light mb-4 text-white/90">Democratizing Advanced<br />Behavioral Forensics</h4>
              <p className="text-white/50 leading-relaxed font-light text-sm">
                We envision a future where high-end behavioral analytics, psychological profiling, and deepfake verification
                are not locked behind massive cloud compute centers, but run securely at the edge on everyday mid-range devices,
                accessible to researchers worldwide.
              </p>
            </div>
          </div>

          <div className="glass-card p-8 relative overflow-hidden group hover:border-white/20 transition-all duration-500">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full" />
            <div className="relative z-10">
              <Target className="w-8 h-8 text-white/30 mb-6" />
              <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-white/40 mb-4">Our Mission</h3>
              <h4 className="text-2xl font-light mb-4 text-white/90">Restoring Trust in the<br />Digital Identity</h4>
              <p className="text-white/50 leading-relaxed font-light text-sm">
                In an era where deepfakes and AI-generated media blur the line between reality and synthetic creation,
                our mission is to build a reliable, lightweight ecosystem that mathematically proves human authenticity,
                protecting digital identities across low-resource environments.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Objectives */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-panel p-8 mb-16"
        >
          <div className="flex items-center gap-3 mb-8">
            <Compass className="w-5 h-5 text-white/40" />
            <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-white/40">Key Objectives</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {objectives.map((obj, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className="flex items-start gap-4 p-4 border border-white/5 bg-white/[0.02] rounded-xl hover:border-white/15 transition-colors"
              >
                <span className="text-[10px] font-mono text-white/30 mt-0.5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <p className="text-sm text-white/60 font-light leading-relaxed">{obj}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Roadmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-8">
            <Rocket className="w-5 h-5 text-white/40" />
            <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-white/40">Future Roadmap</h3>
          </div>
          <div className="space-y-4">
            {roadmap.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className={`glass-card p-6 flex flex-col md:flex-row gap-6 items-start ${item.status === "current" ? "border-white/20" : ""}`}
              >
                <div className="shrink-0 flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    item.status === "complete" ? "bg-green-400" : item.status === "current" ? "bg-white animate-pulse" : "bg-white/20"
                  }`} />
                  <span className="text-xs font-mono text-white/40 uppercase tracking-widest">{item.phase}</span>
                </div>
                <div>
                  <h4 className="text-lg font-light mb-2 text-white/90">{item.title}</h4>
                  <p className="text-sm text-white/40 font-light leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="p-6 border border-white/5 bg-white/5 rounded-xl"
        >
          <h4 className="text-sm uppercase tracking-widest text-white/50 mb-3">Ethical Disclaimer</h4>
          <p className="text-xs text-white/40 leading-relaxed">
            AI predictions provided by this platform are probabilistic and may not always be completely accurate.
            The deepfake detection module provides an estimated authenticity score based on trained datasets and should
            not be used as definitive proof in critical legal or medical scenarios. This system is intended strictly
            for research, educational, and experimental use.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
