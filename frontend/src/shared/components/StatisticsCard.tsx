"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface StatisticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  moduleId?: string;
  children?: ReactNode;
  delay?: number;
}

export default function StatisticsCard({
  title,
  value,
  subtitle,
  icon,
  moduleId,
  children,
  delay = 0,
}: StatisticsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      className="glass-panel p-6 relative overflow-hidden"
    >
      {icon && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3xl rounded-full pointer-events-none" />
      )}
      <h3 className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-4 flex justify-between relative z-10">
        <span className="flex items-center gap-2">
          {icon}
          {title}
        </span>
        {moduleId && <span className="text-white/20">{moduleId}</span>}
      </h3>
      {children ? (
        <div className="relative z-10">{children}</div>
      ) : (
        <div className="relative z-10">
          <p className="text-3xl font-light text-white/90">{value}</p>
          {subtitle && (
            <p className="text-[10px] uppercase tracking-widest text-white/30 mt-2">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}
