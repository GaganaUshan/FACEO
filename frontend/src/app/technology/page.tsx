"use client";

import Navigation from "@/components/Navigation";
import { motion } from "framer-motion";

export default function TechnologyPage() {
    const technologies = [
        {
            title: "Emotion Detection",
            module: "Module 1",
            description: "Utilizes @vladmandic/face-api to accurately map 7 core facial expressions in real-time. The model is optimized for edge-device tracking to maintain high framerates.",
            datasets: ["FER2013", "AffectNet", "RAF-DB"],
            stack: "TensorFlow.js / WebGL",
        },
        {
            title: "Demographic Estimation",
            module: "Module 2",
            description: "Employs client-side lightweight neural networks to estimate age ranges and gender probabilities dynamically as the user interacts with the camera.",
            datasets: ["IMDB-WIKI", "UTKFace"],
            stack: "TensorFlow.js / WebGL",
        },
        {
            title: "Deepfake Identification",
            module: "Module 3",
            description: "A fast, Python-backend classification system to verify human authenticity within the first 10 seconds of analysis, utilizing MobileNetV2 for low latency.",
            datasets: ["FaceForensics++", "DeepFake Detection Challenge"],
            stack: "FastAPI / PyTorch",
        },
        {
            title: "Skin Characteristic Analysis",
            module: "Module 4",
            description: "Advanced OpenCV texture analysis to determine skin tone distribution and detect blemishes via localized variance mapping.",
            datasets: ["Custom Clinical Dermatology Sets"],
            stack: "FastAPI / OpenCV / NumPy",
        },
    ];

    return (
        <main className="min-h-screen pt-32 pb-20 px-6 relative">
            <Navigation />

            <div className="max-w-6xl mx-auto z-10 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-16 text-center"
                >
                    <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4">Technology & Research</h1>
                    <p className="text-white/50 max-w-2xl mx-auto font-light">
                        A hybrid edge-and-cloud architecture designed for mid-range hardware.
                        Client-side inferences guarantee privacy and speed, while heavy authenticity classifications are securely handled by a Python backend.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {technologies.map((tech, i) => (
                        <motion.div
                            key={tech.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 * i, duration: 0.8 }}
                            className="glass-card p-8 group hover:bg-white/5 transition-colors"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-xs uppercase tracking-widest text-white/40">{tech.module}</span>
                                <span className="text-xs border border-white/20 px-3 py-1 rounded-full text-white/70">{tech.stack}</span>
                            </div>
                            <h2 className="text-2xl font-light mb-3 group-hover:text-white transition-colors text-white/90">
                                {tech.title}
                            </h2>
                            <p className="text-white/50 text-sm mb-6 leading-relaxed">
                                {tech.description}
                            </p>
                            <div>
                                <h4 className="text-xs uppercase tracking-widest text-white/30 mb-2">Reference Datasets</h4>
                                <div className="flex flex-wrap gap-2">
                                    {tech.datasets.map(ds => (
                                        <span key={ds} className="text-xs bg-white/5 px-2 py-1 rounded text-white/60">
                                            {ds}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </main>
    );
}
