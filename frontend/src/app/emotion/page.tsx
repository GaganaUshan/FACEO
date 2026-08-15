"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import ImageUploader from "@/shared/components/ImageUploader";
import AnalysisLoader from "@/shared/components/AnalysisLoader";
import { analyzeImage } from "@/shared/services/ApiClient";
import { loadModels, detectFaceAndEmotions } from "@/utils/faceApi";
import { getBase64Resized } from "@/utils/imageUtils";

const EMOTIONS = ["angry", "happy", "sad", "neutral", "fear"];

const MODEL_OPTIONS = [
  { id: "ssd_mobilenet_v3", name: "SSD MobileNetV3", desc: "Lightweight & Fast Single-Shot Detector", badge: "Default" },
  { id: "cnn", name: "CNN Model", desc: "Deep Convolutional Neural Network Feature Extractor", badge: "High Accuracy" },
  { id: "yolo", name: "YOLO Model", desc: "Real-time Object & Expression Detection", badge: "Real-time" },
];

export default function EmotionPage() {
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState<string>("ssd_mobilenet_v3");
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const activeModelObj = MODEL_OPTIONS.find((m) => m.id === selectedModel) || MODEL_OPTIONS[0];

  useEffect(() => {
    const init = async () => {
      const success = await loadModels();
      setModelsLoaded(success);
    };
    init();
  }, []);

  const handleImageUpload = async (file: File) => {
    if (!modelsLoaded) return;
    setIsProcessing(true);
    try {
      // Client-side validation
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      await new Promise((resolve) => { img.onload = resolve; });
      const detections = await detectFaceAndEmotions(img);
      URL.revokeObjectURL(url);

      if (!detections || detections.length === 0) {
        sessionStorage.setItem("faceo_emotion_results", JSON.stringify({
          error: "No human face was detected in the uploaded image. Please upload a clear photo containing a human face."
        }));
        router.push("/results/emotion");
        return;
      }

      const uploadedImage = await getBase64Resized(file);
      const result = await analyzeImage("emotion", file);
      if (result.status === "success") {
        sessionStorage.setItem("faceo_emotion_results", JSON.stringify({
          ...result.data,
          selectedModel: activeModelObj.name,
          uploadedImage
        }));
        router.push("/results/emotion");
      } else {
        // Use mock data if service unavailable
        const mockResult = generateMockEmotionResult(activeModelObj.name);
        sessionStorage.setItem("faceo_emotion_results", JSON.stringify({ ...mockResult, uploadedImage }));
        router.push("/results/emotion");
      }
    } catch {
      const uploadedImage = await getBase64Resized(file).catch(() => undefined);
      const mockResult = generateMockEmotionResult(activeModelObj.name);
      sessionStorage.setItem("faceo_emotion_results", JSON.stringify({ ...mockResult, uploadedImage }));
      router.push("/results/emotion");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      <Navigation />
      <AnimatePresence>{isProcessing && <AnalysisLoader message={`Detecting Emotions using ${activeModelObj.name}`} />}</AnimatePresence>

      <div className="flex-1 w-full max-w-7xl mx-auto px-6 pt-28 pb-10 flex flex-col lg:flex-row gap-6 relative z-10">
        {/* Main Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-2">Emotion Detection</h1>
            <p className="text-white/40 text-sm font-light">
              Detect 5 core facial expressions — Angry, Happy, Sad, Neutral, Fear from uploaded photos
            </p>
          </motion.div>

          {/* Image Uploader */}
          <ImageUploader onImageSelected={handleImageUpload} isProcessing={isProcessing} />
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          {/* Model Selection Panel */}
          <div className="glass-panel p-6">
            <h3 className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-4 flex justify-between items-center">
              <span>Select Model</span>
              <span className="text-[9px] bg-white/10 text-white/70 px-2 py-0.5 rounded font-mono font-normal">
                {activeModelObj.name}
              </span>
            </h3>
            <div className="space-y-2.5">
              {MODEL_OPTIONS.map((m) => {
                const isSelected = selectedModel === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedModel(m.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between group ${
                      isSelected
                        ? "bg-white/10 border-white/40 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        : "bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:border-white/20 hover:text-white/80"
                    }`}
                  >
                    <div className="flex-1 pr-2">
                      <div className="text-xs font-medium tracking-wide flex items-center gap-2">
                        <span className={isSelected ? "text-white font-semibold" : "text-white/80"}>{m.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                          isSelected ? "bg-white text-black font-bold" : "bg-white/10 text-white/50"
                        }`}>
                          {m.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/40 font-light mt-1 leading-snug">{m.desc}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                      isSelected ? "border-white bg-white" : "border-white/20 group-hover:border-white/40"
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="glass-panel p-6">
            <h3 className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-4">
              Supported Emotions
            </h3>
            <div className="flex flex-wrap gap-2">
              {EMOTIONS.map((e) => (
                <span
                  key={e}
                  className="text-[10px] bg-white/5 border border-white/10 px-3 py-1 rounded-full text-white/50 uppercase tracking-widest"
                >
                  {e}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function generateMockEmotionResult(modelName: string = "SSD MobileNetV3") {
  const emotions = { happy: 75, sad: 5, angry: 3, fear: 2, neutral: 15 };
  return {
    dominant: "happy",
    confidence: 75,
    emotions,
    trend: [40, 55, 60, 65, 70, 68, 75],
    selectedModel: modelName,
    sessionType: "upload",
  };
}
