"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Image from "next/image";
import { ArrowRight, Activity, Fingerprint, Eye, Search, Heart, Shield, Layers } from "lucide-react";

const modules = [
  {
    title: "Emotion Detection",
    description: "Real-time tracking of 7 core facial expressions with confidence analysis and trend mapping.",
    href: "/emotion",
    icon: <Heart className="w-6 h-6" />,
    tag: "M1",
  },
  {
    title: "Age & Gender",
    description: "Demographic estimation through neural network analysis of facial features and bone structure.",
    href: "/age-gender",
    icon: <Eye className="w-6 h-6" />,
    tag: "M2",
  },
  {
    title: "Face Marks & Bruises",
    description: "YOLO-based detection of facial marks, bruises, scars, and blemishes with bounding box output.",
    href: "/face-marks",
    icon: <Search className="w-6 h-6" />,
    tag: "M3",
  },
  {
    title: "Deepfake Detection",
    description: "Sub-15 second AI generation and deepfake verification with multi-frame authenticity scoring.",
    href: "/deepfake",
    icon: <Shield className="w-6 h-6" />,
    tag: "M4",
  },
  {
    title: "All-in-One Detector",
    description: "Complete phased analysis: 10-sec authenticity verification followed by emotion, demographic, and skin mark detection.",
    href: "/all-in-one",
    icon: <Layers className="w-6 h-6" />,
    tag: "M5",
  },
];

const quickLinks = [
  { name: "Vision & Mission", href: "/vision-mission" },
  { name: "Team", href: "/team" },
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center relative overflow-hidden">
      <Navigation />

      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="z-10 text-center max-w-4xl px-4 mt-32 mb-16"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <Image src="/logo-white.svg" alt="Faceo Analytics" width={60} height={66} />
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-6">
          Face Intelligence <br /> Platform
        </h1>
        <p className="text-lg md:text-xl text-white/50 font-light mb-6 max-w-2xl mx-auto leading-relaxed">
          A state-of-the-art research platform evaluating facial emotion, demographic estimation,
          skin marks analysis, and deepfake verification through minimalist AI design.
        </p>

        {/* Quick Links */}
        <div className="flex justify-center gap-4 mb-4">
          {quickLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-xs tracking-widest uppercase text-white/30 hover:text-white/60 smooth-transition"
            >
              {link.name}
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Module Cards Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 1 }}
        className="w-full max-w-6xl px-6 z-10 mb-20"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((mod, i) => (
            <motion.div
              key={mod.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              <Link href={mod.href} className="block group">
                <div className="glass-card p-8 hover:bg-white/[0.07] transition-all duration-500 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/[0.03] blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                  <div className="flex justify-between items-start mb-5 relative z-10">
                    <div className="text-white/40 group-hover:text-white/70 transition-colors">
                      {mod.icon}
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/20">{mod.tag}</span>
                  </div>

                  <h2 className="text-2xl font-light mb-3 group-hover:text-white transition-colors text-white/90 relative z-10">
                    {mod.title}
                  </h2>
                  <p className="text-sm text-white/40 mb-6 leading-relaxed relative z-10">
                    {mod.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-white/30 group-hover:text-white/60 transition-colors relative z-10">
                    <span>Launch Module</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Bottom stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="w-full max-w-5xl px-6 grid grid-cols-1 md:grid-cols-3 gap-6 z-10 mb-12"
      >
        <div className="glass-panel p-6 flex flex-col items-center text-center">
          <Activity className="w-6 h-6 mb-4 text-white/70" />
          <h3 className="text-sm uppercase tracking-widest text-white/70 mb-2">5 AI Modules</h3>
          <p className="text-xs text-white/40">Independent backend services for each capability</p>
        </div>
        <div className="glass-panel p-6 flex flex-col items-center text-center">
          <Fingerprint className="w-6 h-6 mb-4 text-white/70" />
          <h3 className="text-sm uppercase tracking-widest text-white/70 mb-2">Hybrid Architecture</h3>
          <p className="text-xs text-white/40">Edge-and-cloud design for speed and privacy</p>
        </div>
        <div className="glass-panel p-6 flex flex-col items-center text-center">
          <Eye className="w-6 h-6 mb-4 text-white/70" />
          <h3 className="text-sm uppercase tracking-widest text-white/70 mb-2">Real-Time Analysis</h3>
          <p className="text-xs text-white/40">Live webcam processing with instant results</p>
        </div>
      </motion.div>
    </main>
  );
}
