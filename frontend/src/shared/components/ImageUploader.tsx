"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, Image as ImageIcon, X } from "lucide-react";

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  isProcessing?: boolean;
}

export default function ImageUploader({ onImageSelected, isProcessing }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    onImageSelected(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full">
      {!preview ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`upload-zone flex flex-col items-center justify-center p-12 cursor-pointer ${dragOver ? "drag-over" : ""}`}
        >
          <Upload className="w-8 h-8 text-white/30 mb-4" />
          <p className="text-sm text-white/50 font-light mb-2">
            Drop an image or click to upload
          </p>
          <p className="text-[10px] text-white/25 uppercase tracking-widest">
            JPG, PNG, WEBP • Max 10MB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Uploaded"
            className="w-full h-full object-cover grayscale brightness-110 contrast-125"
          />
          {isProcessing && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-6 h-6 rounded-full border-t-2 border-white animate-spin" />
                <p className="text-xs tracking-widest uppercase text-white/60">Processing</p>
              </div>
            </div>
          )}
          {!isProcessing && (
            <button
              onClick={clearPreview}
              className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full p-2 hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/70" />
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}
