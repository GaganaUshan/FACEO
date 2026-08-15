"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import WebcamCapture from "@/shared/components/WebcamCapture";
import SessionTimer from "@/shared/components/SessionTimer";
import AnalysisLoader from "@/shared/components/AnalysisLoader";
import ConfidenceMeter from "@/shared/components/ConfidenceMeter";
import { loadModels, detectFaceAndEmotions } from "@/utils/faceApi";
import { ShieldCheck, Brain, User, Search, CheckCircle2, Layers } from "lucide-react";

const EMOTIONS = ["angry", "happy", "sad", "neutral", "fear"];
const DETECTION_TYPES = ["Scar", "Bruise", "Mole"];

const PHASE1_DURATION = 10; // seconds
const PHASE2_DURATION = 30; // seconds
const TOTAL_DURATION = PHASE1_DURATION + PHASE2_DURATION;

export default function AllInOneClient() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<1 | 2>(1);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const phaseTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Collected data refs
  const framesRef = useRef<Blob[]>([]);
  const authenticityHistory = useRef<{ confidence: number; state: string }[]>([]);
  const emotionHistory = useRef<Record<string, number>[]>([]);
  const ageHistory = useRef<number[]>([]);
  const genderHistory = useRef<{ gender: string; probability: number }[]>([]);
  const faceMarksHistory = useRef<{ label: string; confidence: number }[][]>([]);

  // Live state for sidebar
  const [liveAuthenticity, setLiveAuthenticity] = useState({
    state: "AWAITING",
    confidence: 0,
    risk: "â€”",
  });
  const [liveEmotions, setLiveEmotions] = useState<{ emotion: string; score: number }[]>([]);
  const [liveDemographics, setLiveDemographics] = useState({ age: 0, gender: "", probability: 0 });
  const [liveDetections, setLiveDetections] = useState<{ label: string; confidence: number }[]>([]);
  const [phase1Complete, setPhase1Complete] = useState(false);

  // Load face-api models on mount
  useEffect(() => {
    const init = async () => {
      const success = await loadModels();
      setModelsLoaded(success);
    };
    init();
  }, []);

  // Phase tracking timer
  useEffect(() => {
    if (isAnalyzing) {
      setElapsedSeconds(0);
      setCurrentPhase(1);
      phaseTimerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          if (next >= PHASE1_DURATION && !phase1Complete) {
            setCurrentPhase(2);
            setPhase1Complete(true);
          }
          return next;
        });
      }, 1000);
    } else {
      if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
    }
    return () => {
      if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnalyzing]);

  // Frame handler â€” processes each captured frame
  const handleFrame = useCallback(
    async (blob: Blob) => {
      framesRef.current.push(blob);
      const elapsed = framesRef.current.length;

      // Phase 1: Deepfake/Authenticity scoring (mock heuristic)
      if (!phase1Complete) {
        const realProb = Math.round(70 + Math.random() * 25);
        const state = realProb > 50 ? "REAL" : "AI GENERATED";
        const risk = realProb > 80 ? "Low" : realProb > 50 ? "Medium" : "High";
        authenticityHistory.current.push({ confidence: realProb, state });
        setLiveAuthenticity({ state, confidence: realProb, risk });
        return;
      }

      // Phase 2: Full face analysis via face-api.js + mock face marks
      if (modelsLoaded) {
        try {
          const url = URL.createObjectURL(blob);
          const img = new Image();
          img.src = url;
          await new Promise((resolve) => {
            img.onload = resolve;
          });

          const detections = await detectFaceAndEmotions(img);
          URL.revokeObjectURL(url);

          if (detections && detections.length > 0) {
            const det = detections[0];

            // Emotions â€” all 7
            const emotionScores: Record<string, number> = {};
            EMOTIONS.forEach((e) => {
              emotionScores[e] = Math.round(
                ((det.expressions as unknown as Record<string, number>)[e] || 0) * 100
              );
            });
            emotionHistory.current.push(emotionScores);

            const sorted = Object.entries(emotionScores)
              .sort((a, b) => b[1] - a[1])
              .map(([emotion, score]) => ({ emotion, score }));
            setLiveEmotions(sorted);

            // Age & Gender
            const age = Math.round(det.age);
            ageHistory.current.push(age);
            genderHistory.current.push({
              gender: det.gender,
              probability: Math.round(det.genderProbability * 100),
            });
            setLiveDemographics({
              age,
              gender: det.gender,
              probability: Math.round(det.genderProbability * 100),
            });
          }
        } catch (error) {
          console.error("Phase 2 frame processing error:", error);
        }
      }

      // Face marks â€” mock detection (same pattern as face-marks module)
      const mockDetection = DETECTION_TYPES.slice(
        0,
        Math.floor(Math.random() * 3) + 1
      ).map((label) => ({
        label,
        confidence: Math.round(50 + Math.random() * 45),
      }));
      faceMarksHistory.current.push(mockDetection);
      setLiveDetections(mockDetection);
    },
    [phase1Complete, modelsLoaded]
  );

  const startSession = () => {
    if (!cameraReady || !modelsLoaded) return;

    // Reset all data
    framesRef.current = [];
    authenticityHistory.current = [];
    emotionHistory.current = [];
    ageHistory.current = [];
    genderHistory.current = [];
    faceMarksHistory.current = [];

    setPhase1Complete(false);
    setCurrentPhase(1);
    setLiveAuthenticity({ state: "EVALUATING...", confidence: 0, risk: "â€”" });
    setLiveEmotions([]);
    setLiveDemographics({ age: 0, gender: "", probability: 0 });
    setLiveDetections([]);

    setSessionStarted(true);
    setIsAnalyzing(true);
  };

  const handleSessionComplete = async () => {
    setIsAnalyzing(false);
    setSessionStarted(false);
    setIsProcessing(true);

    if (emotionHistory.current.length === 0) {
      const combinedResult = {
        error: "No human face was captured or detected during the analysis phase. Please ensure you are clearly visible in the camera frame."
      };
      sessionStorage.setItem("faceo_allinone_results", JSON.stringify(combinedResult));
      setIsProcessing(false);
      router.push("/results/all-in-one");
      return;
    }

    // Aggregate authenticity
    const avgAuth =
      authenticityHistory.current.length > 0
        ? Math.round(
            authenticityHistory.current.reduce((a, b) => a + b.confidence, 0) /
              authenticityHistory.current.length
          )
        : 85;
    const authFrameSummary = authenticityHistory.current.map((h) => h.confidence);
    const realCount = authenticityHistory.current.filter((h) => h.state === "REAL").length;
    const authStatus =
      realCount > authenticityHistory.current.length / 2 ? "REAL" : "AI GENERATED";

    // Aggregate emotions
    const avgEmotions: Record<string, number> = {};
    EMOTIONS.forEach((e) => {
      const vals = emotionHistory.current
        .map((snap) => snap[e] || 0)
        .filter((v) => v > 0);
      avgEmotions[e] = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    });
    const dominantEmotion = Object.entries(avgEmotions).sort((a, b) => b[1] - a[1])[0];
    const emotionTrend = emotionHistory.current.map(
      (snap) => Math.max(...Object.values(snap))
    );

    // Aggregate age/gender
    const avgAge =
      ageHistory.current.length > 0
        ? Math.round(ageHistory.current.reduce((a, b) => a + b, 0) / ageHistory.current.length)
        : 25;
    const genderCounts: Record<string, number> = {};
    genderHistory.current.forEach((g) => {
      genderCounts[g.gender] = (genderCounts[g.gender] || 0) + 1;
    });
    const dominantGender =
      Object.entries(genderCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "unknown";
    const genderConf =
      genderHistory.current.length > 0
        ? Math.round(
            genderHistory.current.reduce((a, b) => a + b.probability, 0) /
              genderHistory.current.length
          )
        : 0;

    // Aggregate face marks
    const allDetections: Record<string, { total: number; count: number }> = {};
    faceMarksHistory.current.forEach((snapshot) => {
      snapshot.forEach((d) => {
        if (!allDetections[d.label]) allDetections[d.label] = { total: 0, count: 0 };
        allDetections[d.label].total += d.confidence;
        allDetections[d.label].count += 1;
      });
    });
    const aggregatedMarks = Object.entries(allDetections).map(([label, data]) => ({
      label,
      confidence: Math.round(data.total / data.count),
      bbox: {
        x: Math.round(80 + Math.random() * 160),
        y: Math.round(60 + Math.random() * 120),
        w: Math.round(30 + Math.random() * 40),
        h: Math.round(25 + Math.random() * 35),
      },
    }));

    const combinedResult = {
      authenticity: {
        status: authStatus,
        confidence: avgAuth,
        riskLevel: avgAuth > 80 ? "Low" : avgAuth > 50 ? "Medium" : "High",
        realProbability: authStatus === "REAL" ? avgAuth : 100 - avgAuth,
        deepfakeProbability: authStatus === "REAL" ? 100 - avgAuth : avgAuth,
        frameSummary: authFrameSummary,
      },
      demographics: {
        age: avgAge,
        gender: dominantGender,
        genderConfidence: genderConf,
        ageTrend: ageHistory.current.slice(-10),
      },
      emotion: {
        dominant: dominantEmotion?.[0] || "neutral",
        confidence: dominantEmotion?.[1] || 0,
        emotions: avgEmotions,
        trend: emotionTrend.length > 0 ? emotionTrend : [0],
      },
      faceMarks: {
        detections: aggregatedMarks,
        totalDetections: aggregatedMarks.length,
        avgConfidence:
          aggregatedMarks.length > 0
            ? Math.round(
                aggregatedMarks.reduce((a, d) => a + d.confidence, 0) / aggregatedMarks.length
              )
            : 0,
      },
      sessionType: "live" as const,
      duration: TOTAL_DURATION,
      totalFrames: framesRef.current.length,
      phase1Frames: authenticityHistory.current.length,
      phase2Frames: emotionHistory.current.length,
    };

    sessionStorage.setItem("faceo_allinone_results", JSON.stringify(combinedResult));
    setIsProcessing(false);
    router.push("/results/all-in-one");
  };

  const phaseLabel =
    currentPhase === 1
      ? `Phase 1 â€” Authenticity (${Math.max(PHASE1_DURATION - elapsedSeconds, 0)}s)`
      : `Phase 2 â€” Full Analysis (${Math.max(TOTAL_DURATION - elapsedSeconds, 0)}s)`;

  return (
    <main className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      <Navigation />
      <AnimatePresence>
        {isProcessing && <AnalysisLoader message="Compiling Full Analysis" />}
      </AnimatePresence>

      <div className="flex-1 w-full max-w-7xl mx-auto px-6 pt-28 pb-10 flex flex-col lg:flex-row gap-6 relative z-10">
        {/* Main Area */}
        <div className="flex-1 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Layers className="w-5 h-5 text-white/40" />
              <h1 className="text-3xl md:text-4xl font-light tracking-tight">
                All-in-One Detector
              </h1>
            </div>
            <p className="text-white/40 text-sm font-light">
              Phased live analysis â€” 10s authenticity verification â†’ 30s
              emotion, demographic &amp; skin mark detection
            </p>
          </motion.div>

          {/* Phase Indicator */}
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-5 py-2">
                <div
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    currentPhase === 1 ? "bg-amber-400" : "bg-emerald-400"
                  }`}
                />
                <span className="text-xs tracking-widest uppercase text-white/70 font-mono">
                  {phaseLabel}
                </span>
              </div>
            </motion.div>
          )}

          {/* Camera Area */}
          {!modelsLoaded ? (
            <div className="flex-1 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 min-h-[400px]">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white/50 uppercase tracking-widest text-xs">
                  Loading AI Models...
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <WebcamCapture
                onFrame={handleFrame}
                isCapturing={isAnalyzing}
                captureIntervalMs={currentPhase === 1 ? 1000 : 2000}
                onStreamReady={() => setCameraReady(true)}
              />
              <div className="flex items-center gap-4">
                <button
                  onClick={startSession}
                  disabled={!cameraReady || isAnalyzing}
                  className={`px-8 py-3 rounded-full text-sm font-medium tracking-wide transition-all ${
                    !cameraReady || isAnalyzing
                      ? "bg-white/10 text-white/30 cursor-not-allowed"
                      : "bg-white text-black hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                  }`}
                >
                  {isAnalyzing
                    ? "Analyzing..."
                    : `Start Full Analysis (${TOTAL_DURATION} Sec)`}
                </button>
                {sessionStarted && (
                  <div className="flex-1">
                    <SessionTimer
                      durationSeconds={TOTAL_DURATION}
                      isRunning={isAnalyzing}
                      onComplete={handleSessionComplete}
                      label="All-in-One"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar â€” 4 stacked panels */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          {/* Panel 1: Authenticity */}
          <div className="glass-panel p-6 relative overflow-hidden">
            <div
              className={`absolute top-0 right-0 w-32 h-32 blur-[80px] rounded-full pointer-events-none ${
                liveAuthenticity.state === "REAL"
                  ? "bg-green-500/10"
                  : liveAuthenticity.state === "AI GENERATED"
                  ? "bg-red-500/10"
                  : "bg-yellow-400/10"
              }`}
            />
            <h3 className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-5 flex justify-between relative z-10">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" /> Authenticity
              </span>
              <span className="text-white/20">P1</span>
            </h3>

            {/* Phase 1 complete checkmark */}
            <AnimatePresence>
              {phase1Complete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-4 right-4 z-20"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-2 h-2 rounded-full ${
                    liveAuthenticity.state === "REAL"
                      ? "bg-green-400"
                      : liveAuthenticity.state === "AI GENERATED"
                      ? "bg-red-500"
                      : "bg-yellow-400"
                  } animate-pulse`}
                />
                <span
                  className={`text-lg font-light tracking-wide ${
                    liveAuthenticity.state === "REAL"
                      ? "text-green-400"
                      : liveAuthenticity.state === "AI GENERATED"
                      ? "text-red-400"
                      : "text-white/50"
                  }`}
                >
                  {liveAuthenticity.state}
                </span>
              </div>
              {liveAuthenticity.confidence > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40 uppercase tracking-widest">
                      Confidence
                    </span>
                    <span className="font-mono text-white/70">
                      {liveAuthenticity.confidence}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40 uppercase tracking-widest">
                      Risk Level
                    </span>
                    <span
                      className={`font-mono ${
                        liveAuthenticity.risk === "Low"
                          ? "text-green-400"
                          : liveAuthenticity.risk === "Medium"
                          ? "text-amber-400"
                          : "text-red-400"
                      }`}
                    >
                      {liveAuthenticity.risk}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Panel 2: Emotions â€” shows after Phase 1 */}
          <AnimatePresence>
            {phase1Complete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-panel p-6"
              >
                <h3 className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-4 flex justify-between">
                  <span className="flex items-center gap-2">
                    <Brain className="w-3.5 h-3.5" /> Expressions
                  </span>
                  <span className="text-white/20">P2</span>
                </h3>
                <div className="space-y-3">
                  {liveEmotions.length > 0 ? (
                    liveEmotions.map((item, i) => (
                      <div key={item.emotion}>
                        <ConfidenceMeter
                          value={item.score}
                          label={item.emotion}
                          size={i === 0 ? "md" : "sm"}
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-white/30 italic font-light">
                      Awaiting expressions...
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Panel 3: Demographics â€” shows after Phase 1 */}
          <AnimatePresence>
            {phase1Complete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-panel p-6"
              >
                <h3 className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-5 flex justify-between">
                  <span className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> Demographics
                  </span>
                  <span className="text-white/20">P2</span>
                </h3>
                {liveDemographics.age > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">
                        Age Range
                      </p>
                      <p className="text-3xl font-light text-white/90">
                        {liveDemographics.age - 2}-{liveDemographics.age + 2}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">
                        Gender
                      </p>
                      <p className="text-xl font-light capitalize text-white/90 mt-1.5">
                        {liveDemographics.gender}{" "}
                        <span className="text-xs text-white/30 ml-1 font-mono">
                          {liveDemographics.probability}%
                        </span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-white/30 italic font-light">
                    Awaiting visual data...
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Panel 4: Face Marks â€” shows after Phase 1 */}
          <AnimatePresence>
            {phase1Complete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-panel p-6"
              >
                <h3 className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-4 flex justify-between">
                  <span className="flex items-center gap-2">
                    <Search className="w-3.5 h-3.5" /> Face Marks
                  </span>
                  <span className="text-white/20">P2</span>
                </h3>
                <div className="space-y-3">
                  {liveDetections.length > 0 ? (
                    liveDetections.map((det) => (
                      <div key={det.label}>
                        <ConfidenceMeter
                          value={det.confidence}
                          label={det.label}
                          size="sm"
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-white/30 italic font-light">
                      No marks detected...
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Technology Panel â€” always visible */}
          <div className="glass-panel p-6">
            <h3 className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-4">
              Technology
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50">Models</span>
                <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-white/60">
                  face-api.js / MobileNetV2
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50">Phases</span>
                <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-white/60">
                  2-Phase Sequential
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50">Duration</span>
                <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-white/60">
                  {TOTAL_DURATION}s Total
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
