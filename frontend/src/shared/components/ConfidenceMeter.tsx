"use client";

interface ConfidenceMeterProps {
  value: number; // 0-100
  label?: string;
  size?: "sm" | "md";
  showValue?: boolean;
}

export default function ConfidenceMeter({
  value,
  label,
  size = "md",
  showValue = true,
}: ConfidenceMeterProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const barColor =
    clamped >= 70 ? "bg-white/70" : clamped >= 40 ? "bg-amber-400/70" : "bg-red-400/70";

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between mb-1.5">
          {label && (
            <span className={`uppercase tracking-wider font-mono ${size === "sm" ? "text-[9px] text-white/40" : "text-xs text-white/50"}`}>
              {label}
            </span>
          )}
          {showValue && (
            <span className={`font-mono ${size === "sm" ? "text-[9px] text-white/30" : "text-xs text-white/40"}`}>
              {clamped}%
            </span>
          )}
        </div>
      )}
      <div className={`confidence-bar ${size === "sm" ? "h-[2px]" : ""}`}>
        <div
          className={`fill ${barColor}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
