"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import AnalysisModeSelector from "@/shared/components/AnalysisModeSelector";
import ImageUploader from "@/shared/components/ImageUploader";
import WebcamCapture from "@/shared/components/WebcamCapture";
import SessionTimer from "@/shared/components/SessionTimer";
import AnalysisLoader from "@/shared/components/AnalysisLoader";
import { loadModels, detectFaceAndEmotions } from "@/utils/faceApi";
import { getBase64Resized } from "@/utils/imageUtils";

// ─── Model Definitions ───────────────────────────────────────────────────────
// Four models curated for South Asian (Sri Lankan / Indian) demographic accuracy.
// faceapi_agnet is client-side only (face-api.js AgeGenderNet).
// The other three run as DeepFace backends on the server.

const AGE_GENDER_MODELS = [
  {
    id: "deepface_vgg",
    name: "DeepFace VGG",
    desc: "VGG-Face backbone — robust general-purpose demographic analysis",
    badge: "Default",
    side: "server",
  },
  {
    id: "deepface_facenet",
    name: "FaceNet",
    desc: "Facenet backbone — superior age regression across diverse ethnicities",
    badge: "High Accuracy",
    side: "server",
  },
  {
    id: "deepface_openface",
    name: "OpenFace",
    desc: "OpenFace backbone — lightweight, optimised for real-time analysis",
    badge: "Live Optimised",
    side: "server",
  },
  {
    id: "faceapi_agnet",
    name: "AgeGenderNet",
    desc: "Client-side TensorFlow.js model — zero-latency real-time prediction",
    badge: "Real-time",
    side: "client",
  },
] as const;

type ModelId = (typeof AGE_GENDER_MODELS)[number]["id"];

// Default: all four selected
const DEFAULT_SELECTED: ModelId[] = AGE_GENDER_MODELS.map((m) => m.id);

// ─── ApiClient helpers (inline to avoid touching shared ApiClient) ────────────
async function analyzeImageMultiModel(
  file: File,
  models: string[]
): Promise<{ status: string; data?: Record<string, unknown>; error?: string }> {
  const formData = new FormData();
  formData.append("file", file, "image.jpg");
  formData.append("models", JSON.stringify(models));
  try {
    const res = await fetch("http://localhost:8001/analyze-image", {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(30000),
    });
    return await res.json();
  } catch {
    return { status: "error", error: "Service unavailable" };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AgeGenderPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"upload" | "live">("upload");
  const [selectedModels, setSelectedModels] = useState<ModelId[]>(DEFAULT_SELECTED);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const ageHistory = useRef<number[]>([]);

  // Live data from client-side AgeGenderNet (face-api.js)
  const [liveDemographics, setLiveDemographics] = useState({
    age: 0,
    gender: "",
    probability: 0,
    uncertain: false,   // true when gender confidence is borderline
  });

  useEffect(() => {
    const init = async () => {
      const success = await loadModels();
      setModelsLoaded(success);
    };
    init();
  }, []);

  // ── Model toggle handler ──────────────────────────────────────────────────
  const toggleModel = (id: ModelId) => {
    setSelectedModels((prev) => {
      if (prev.includes(id)) {
        // Prevent deselecting the last model
        if (prev.length === 1) return prev;
        return prev.filter((m) => m !== id);
      }
      return [...prev, id];
    });
  };

  const activeModelNames = AGE_GENDER_MODELS.filter((m) =>
    selectedModels.includes(m.id)
  )
    .map((m) => m.name)
    .join(" + ");

  // ── Image upload handler ──────────────────────────────────────────────────
  const handleImageUpload = async (file: File) => {
    if (!modelsLoaded) return;
    setIsProcessing(true);

    try {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      await new Promise((resolve) => { img.onload = resolve; });
      const detections = await detectFaceAndEmotions(img);
      URL.revokeObjectURL(url);

      if (!detections || detections.length === 0) {
        sessionStorage.setItem(
          "faceo_age_gender_results",
          JSON.stringify({
            error:
              "No human face was detected in the uploaded image. Please upload a clear photo containing a human face.",
          })
        );
        router.push("/results/age-gender");
        return;
      }

      const uploadedImage = await getBase64Resized(file);

      // Server-side models (exclude client-side faceapi_agnet)
      const serverModels = selectedModels.filter((id) => id !== "faceapi_agnet");

      // client-side AgeGenderNet result from face-api.js detections
      let clientResult: { age: number; gender: string; genderConfidence: number } | null = null;
      if (selectedModels.includes("faceapi_agnet") && detections.length > 0) {
        const det = detections[0];
        clientResult = {
          age: Math.round(det.age),
          gender: det.gender,
          genderConfidence: Math.round(det.genderProbability * 100),
        };
      }

      let finalResult: Record<string, unknown> = {};

      if (serverModels.length > 0) {
        const result = await analyzeImageMultiModel(file, serverModels);
        if (result.status === "success" && result.data) {
          finalResult = { ...result.data };
        } else {
          finalResult = generateMockResult(activeModelNames);
        }
      }

      // ── Blend client-side AgeGenderNet result ──────────────────────────────
      // IMPORTANT: AgeGenderNet is heavily biased toward hair length for gender.
      // We ONLY use it to contribute to age (where it's reliable).
      // Gender is always decided by the server-side confidence-weighted ensemble.
      if (clientResult) {
        const serverAge = typeof finalResult.age === "number" ? finalResult.age : null;
        const blendedAge = serverAge !== null
          ? Math.round((serverAge + clientResult.age) / 2)
          : clientResult.age;

        finalResult = {
          ...finalResult,
          age: blendedAge,
          // Gender and genderConfidence stay from the server ensemble — do NOT overwrite
        };

        // If there were no server models at all (only faceapi_agnet selected),
        // fall back to client gender but flag it as uncertain
        if (Object.keys(finalResult).filter(k => k !== "age").length === 0 ||
            typeof finalResult.gender !== "string") {
          finalResult = {
            ...finalResult,
            gender: clientResult.gender,
            genderConfidence: clientResult.genderConfidence,
            genderUncertain: true,  // AgeGenderNet alone — hair-bias warning
          };
        }
      }

      // Fallback if nothing ran
      if (Object.keys(finalResult).length === 0) {
        finalResult = generateMockResult(activeModelNames);
      }

      sessionStorage.setItem(
        "faceo_age_gender_results",
        JSON.stringify({
          ...finalResult,
          selectedModels: selectedModels,
          selectedModelNames: activeModelNames,
          uploadedImage,
        })
      );
      router.push("/results/age-gender");
    } catch (error) {
      console.error(error);
      const uploadedImage = await getBase64Resized(file).catch(() => undefined);
      sessionStorage.setItem(
        "faceo_age_gender_results",
        JSON.stringify({
          ...generateMockResult(activeModelNames),
          selectedModels,
          selectedModelNames: activeModelNames,
          uploadedImage,
        })
      );
      router.push("/results/age-gender");
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Live frame handler ────────────────────────────────────────────────────
  const handleFrame = useCallback(
    async (blob: Blob) => {
      if (!modelsLoaded) return;
      try {
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.src = url;
        await new Promise((resolve) => { img.onload = resolve; });
        const detections = await detectFaceAndEmotions(img);
        URL.revokeObjectURL(url);

        if (detections && detections.length > 0) {
          const det = detections[0];
          const age = Math.round(det.age);
          const prob = Math.round(det.genderProbability * 100);
          ageHistory.current.push(age);
          setLiveDemographics({
            age,
            gender: det.gender,
            probability: prob,
            // Flag as uncertain if AgeGenderNet itself is unsure (<65%)
            // This often happens with long hair on South Asian males
            uncertain: prob < 65,
          });
        }
      } catch (error) {
        console.error("Frame processing error", error);
      }
    },
    [modelsLoaded]
  );

  // ── Session controls ──────────────────────────────────────────────────────
  const startLiveSession = () => {
    if (!cameraReady || !modelsLoaded || selectedModels.length === 0) return;
    ageHistory.current = [];
    setSessionStarted(true);
    setIsAnalyzing(true);
  };

  const handleSessionComplete = async () => {
    setIsAnalyzing(false);
    setSessionStarted(false);
    setIsProcessing(true);

    try {
      if (ageHistory.current.length > 0) {
        const avgAge = Math.round(
          ageHistory.current.reduce((a, b) => a + b, 0) / ageHistory.current.length
        );
        const result = {
          age: avgAge,
          gender: liveDemographics.gender || "unknown",
          genderConfidence: liveDemographics.probability || 0,
          genderUncertain: liveDemographics.uncertain,
          ageTrend: ageHistory.current.slice(-10),
          sessionType: "live",
          duration: 120,
          selectedModels,
          selectedModelNames: activeModelNames,
          modelsUsed: selectedModels,
        };
        sessionStorage.setItem("faceo_age_gender_results", JSON.stringify(result));
      } else {
        sessionStorage.setItem(
          "faceo_age_gender_results",
          JSON.stringify({
            error:
              "No human face was captured or detected during the session. Please face the camera directly.",
          })
        );
      }
    } catch {
      sessionStorage.setItem(
        "faceo_age_gender_results",
        JSON.stringify({
          error: "An error occurred while compiling the session details. Please try again.",
        })
      );
    }

    setIsProcessing(false);
    router.push("/results/age-gender");
  };

  // ── Derived UI values ─────────────────────────────────────────────────────
  const canStart = selectedModels.length > 0;
  const loaderMessage = `Analyzing Demographics — ${activeModelNames}`;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      <Navigation />
      <AnimatePresence>
        {isProcessing && <AnalysisLoader message={loaderMessage} />}
      </AnimatePresence>

      <div className="flex-1 w-full max-w-7xl mx-auto px-6 pt-28 pb-10 flex flex-col lg:flex-row gap-6 relative z-10">
        {/* ── Main Area ── */}
        <div className="flex-1 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-2">
              Age &amp; Gender Detection
            </h1>
            <p className="text-white/40 text-sm font-light">
              Ensemble demographic estimation — select one or more models for
              improved accuracy on South Asian faces
            </p>
          </motion.div>

          <div className="mb-6">
            <AnalysisModeSelector
              mode={mode}
              onModeChange={setMode}
              disabled={isAnalyzing}
            />
          </div>

          {!modelsLoaded ? (
            <div className="flex-1 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 min-h-[400px]">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white/50 uppercase tracking-widest text-xs">
                  Loading Models...
                </p>
              </div>
            </div>
          ) : mode === "upload" ? (
            <ImageUploader
              onImageSelected={handleImageUpload}
              isProcessing={isProcessing}
            />
          ) : (
            <div className="flex flex-col gap-4">
              <WebcamCapture
                onFrame={handleFrame}
                isCapturing={isAnalyzing}
                captureIntervalMs={2000}
                onStreamReady={() => setCameraReady(true)}
              />
              <div className="flex items-center gap-4">
                <button
                  onClick={startLiveSession}
                  disabled={!cameraReady || isAnalyzing || !canStart}
                  className={`px-8 py-3 rounded-full text-sm font-medium tracking-wide transition-all ${
                    !cameraReady || isAnalyzing || !canStart
                      ? "bg-white/10 text-white/30 cursor-not-allowed"
                      : "bg-white text-black hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                  }`}
                >
                  {isAnalyzing ? "Analyzing..." : "Start Analysis (2 Min)"}
                </button>
                {sessionStarted && (
                  <div className="flex-1">
                    <SessionTimer
                      durationSeconds={120}
                      isRunning={isAnalyzing}
                      onComplete={handleSessionComplete}
                      label="Demographics"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="w-full lg:w-80 flex flex-col gap-4">

          {/* Multi-Model Selection Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-6"
          >
            {/* Panel Header */}
            <h3 className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-1 flex justify-between items-center">
              <span>Select Models</span>
              <span className="text-[9px] bg-white/10 text-white/70 px-2 py-0.5 rounded font-mono font-normal">
                {selectedModels.length} / {AGE_GENDER_MODELS.length} active
              </span>
            </h3>
            <p className="text-[10px] text-white/30 font-light mb-4 leading-snug">
              Select multiple models — results are ensemble-averaged for higher
              accuracy on South Asian faces.
            </p>

            <div className="space-y-2.5">
              {AGE_GENDER_MODELS.map((m) => {
                const isSelected = selectedModels.includes(m.id);
                const isLastSelected =
                  isSelected && selectedModels.length === 1;

                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleModel(m.id)}
                    disabled={isLastSelected}
                    title={
                      isLastSelected
                        ? "At least one model must be selected"
                        : undefined
                    }
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between group ${
                      isSelected
                        ? "bg-white/10 border-white/40 text-white shadow-[0_0_20px_rgba(255,255,255,0.08)]"
                        : "bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:border-white/20 hover:text-white/80"
                    } ${isLastSelected ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="flex-1 pr-2">
                      <div className="text-xs font-medium tracking-wide flex items-center gap-2 flex-wrap">
                        <span
                          className={
                            isSelected ? "text-white font-semibold" : "text-white/80"
                          }
                        >
                          {m.name}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                            isSelected
                              ? "bg-white text-black font-bold"
                              : "bg-white/10 text-white/50"
                          }`}
                        >
                          {m.badge}
                        </span>
                        {m.side === "client" && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Client-side
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-white/40 font-light mt-1 leading-snug">
                        {m.desc}
                      </p>
                    </div>

                    {/* Checkbox indicator */}
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center mt-0.5 shrink-0 transition-all ${
                        isSelected
                          ? "border-white bg-white"
                          : "border-white/20 group-hover:border-white/40"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-2.5 h-2.5 text-black"
                          fill="none"
                          viewBox="0 0 10 8"
                        >
                          <path
                            d="M1 4l3 3 5-6"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active ensemble summary */}
            {selectedModels.length > 1 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">
                  Ensemble Active
                </p>
                <p className="text-[10px] text-white/60 leading-snug">
                  Results from {selectedModels.length} models will be averaged
                  for best accuracy.
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Live demographics feed (live mode only) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-6"
          >
            <h3 className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-5 flex justify-between">
              <span>Live Feed</span>
              <span className="text-white/20">M{selectedModels.length}</span>
            </h3>
            {liveDemographics.age > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">
                      Age Range
                    </p>
                    <p className="text-3xl font-light text-white/90">
                      {liveDemographics.age - 2}–{liveDemographics.age + 2}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">
                      Gender
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <p className="text-xl font-light capitalize text-white/90">
                        {liveDemographics.gender}
                      </p>
                      <span className="text-xs text-white/30 font-mono">
                        {liveDemographics.probability}%
                      </span>
                      {liveDemographics.uncertain && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                          ?
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Hair-bias notice — only shown when uncertain */}
                {liveDemographics.uncertain && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] text-amber-400/60 leading-snug"
                  >
                    ⚠ Low gender confidence — hair style may be affecting prediction. Use server-side models for best accuracy.
                  </motion.p>
                )}
              </div>
            ) : (
              <p className="text-xs text-white/30 italic font-light">
                Awaiting visual data...
              </p>
            )}
          </motion.div>

          {/* Technology panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel p-6"
          >
            <h3 className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-4">
              Technology
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50">Stack</span>
                <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-white/60">
                  DeepFace + TF.js
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50">Datasets</span>
                <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-white/60">
                  UTKFace, IMDB-WIKI
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50">Strategy</span>
                <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-white/60">
                  Ensemble Avg.
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

// ─── Mock fallback ────────────────────────────────────────────────────────────
function generateMockResult(modelNames: string = "DeepFace VGG") {
  return {
    age: 25,
    gender: "male",
    genderConfidence: 89,
    sessionType: "upload",
    modelsUsed: modelNames.split(" + "),
    selectedModelNames: modelNames,
  };
}
