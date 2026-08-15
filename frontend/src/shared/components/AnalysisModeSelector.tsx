"use client";

import { Camera, Upload } from "lucide-react";

interface AnalysisModeSelectorProps {
  mode: "upload" | "live";
  onModeChange: (mode: "upload" | "live") => void;
  disabled?: boolean;
}

export default function AnalysisModeSelector({
  mode,
  onModeChange,
  disabled = false,
}: AnalysisModeSelectorProps) {
  return (
    <div className={`mode-selector ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <button
        onClick={() => onModeChange("upload")}
        className={`flex items-center gap-2 ${mode === "upload" ? "active" : ""}`}
      >
        <Upload className="w-3.5 h-3.5" />
        Upload
      </button>
      <button
        onClick={() => onModeChange("live")}
        className={`flex items-center gap-2 ${mode === "live" ? "active" : ""}`}
      >
        <Camera className="w-3.5 h-3.5" />
        Live Camera
      </button>
    </div>
  );
}
