"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center"
        >
          {/* Ambient glow */}
          <div className="absolute w-[400px] h-[400px] bg-white/[0.03] blur-[100px] rounded-full pointer-events-none" />

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative mb-8"
          >
            <Image
              src="/faceo-logo.png"
              alt="Faceo Analytics"
              width={100}
              height={115}
              className="relative z-10 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
              priority
            />
            {/* Glow behind logo */}
            <div className="absolute inset-0 bg-white/10 blur-2xl rounded-full scale-150" />
          </motion.div>

          {/* Brand name */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-center mb-10"
          >
            <h1 className="text-2xl font-light tracking-[0.3em] uppercase text-white mb-2">
              Faceo Analytics
            </h1>
            <p className="text-[10px] tracking-[0.5em] uppercase text-white/30">
              Face Intelligence Platform
            </p>
          </motion.div>

          {/* Loading dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex gap-2"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white/60 loading-dot" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/60 loading-dot" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/60 loading-dot" />
          </motion.div>

          {/* Bottom status line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-8 text-[10px] tracking-[0.3em] uppercase text-white/20"
          >
            Initializing Neural Systems
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
