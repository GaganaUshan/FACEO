"use client";

import Navigation from "@/components/Navigation";
import { motion } from "framer-motion";
import { Users, Code, Cpu, Globe } from "lucide-react";

const teamMembers = [
  {
    name: "Developer 1",
    role: "Evaluating the Accuracy and Performance of Face-API.js Emotion Recognition",
    focus: "Real-time webcam-based emotion tracking & frontend UI/UX architecture.",
    technologies: ["face-api.js", "Next.js", "TailwindCSS", "Framer Motion", "FER2013", "AffectNet"],
    initial: "D1",
  },
  {
    name: "Developer 2",
    role: "Age and Gender Detection using Face-API",
    focus: "Edge-based demographic estimation & real-time visual tracking.",
    technologies: ["face-api.js", "ageGenderNet", "TypeScript", "IMDB-WIKI", "UTKFace"],
    initial: "D2",
  },
  {
    name: "Developer 3",
    role: "Facial Marks Detection",
    focus: "YOLO-based detection of facial blemishes, bruises, scars, and dark spots.",
    technologies: ["Python", "FastAPI", "YOLO Model", "OpenCV", "DDI", "ACNE04"],
    initial: "D3",
  },
  {
    name: "Developer 4",
    role: "Deepfake Image Detection",
    focus: "Media authenticity scoring using compression levels and frequency analysis.",
    technologies: ["Python", "FastAPI", "Error Level Analysis (ELA)", "FFT Spectral Analysis", "OpenCV"],
    initial: "D4",
  },
];

const technologies = [
  { name: "Next.js 16", category: "Frontend" },
  { name: "React 19", category: "Frontend" },
  { name: "TailwindCSS 4", category: "Styling" },
  { name: "Framer Motion", category: "Animation" },
  { name: "TypeScript", category: "Language" },
  { name: "face-api.js", category: "ML Client" },
  { name: "AgeGenderNet", category: "ML Client" },
  { name: "FastAPI", category: "Backend" },
  { name: "Python", category: "Language" },
  { name: "OpenCV", category: "Vision" },
  { name: "PyTorch", category: "ML Backend" },
  { name: "YOLO", category: "Detection" },
  { name: "ELA Spectral Analysis", category: "Classification" },
];

export default function TeamPage() {
  return (
    <main className="min-h-screen pt-32 pb-20 px-6 relative">
      <Navigation />

      <div className="max-w-5xl mx-auto z-10 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4">Who We Are</h1>
          <p className="text-white/50 font-light text-lg max-w-2xl mx-auto">
            A team of AI researchers and engineers building the next generation of face intelligence technology.
          </p>
        </motion.div>

        {/* Project Purpose */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-8 mb-12 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 blur-3xl rounded-full pointer-events-none" />
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <Globe className="w-5 h-5 text-white/40" />
            <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-white/40">Project Purpose</h3>
          </div>
          <p className="text-white/60 leading-relaxed font-light relative z-10">
            Faceo Analytics was created to demonstrate a production-grade hybrid AI architecture where lightweight
            frontend models work alongside powerful backend services. The platform showcases real-time emotion detection,
            demographic estimation, facial mark identification, and deepfake verification — all running through
            independent, modular microservices connected by a unified face intelligence frontend.
          </p>
        </motion.div>

        {/* Team Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-8">
            <Users className="w-5 h-5 text-white/40" />
            <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-white/40">Team Members</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teamMembers.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="glass-card p-6 group hover:bg-white/[0.07] transition-all duration-500"
              >
                <div className="flex items-start gap-5">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/10 transition-colors">
                    <span className="text-lg font-light text-white/50">{member.initial}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-light text-white/90 mb-1">{member.name}</h4>
                    <p className="text-xs uppercase tracking-widest text-white/40 mb-3">{member.role}</p>
                    <p className="text-sm text-white/50 font-light leading-relaxed mb-4">{member.focus}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {member.technologies.map((tech) => (
                        <span key={tech} className="text-[9px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/40 font-mono">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Technologies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-panel p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <Code className="w-5 h-5 text-white/40" />
            <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-white/40">Technologies Used</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {technologies.map((tech) => (
              <motion.div
                key={tech.name}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full hover:border-white/20 transition-colors"
              >
                <Cpu className="w-3 h-3 text-white/30" />
                <span className="text-xs text-white/70">{tech.name}</span>
                <span className="text-[9px] text-white/30 uppercase tracking-widest">{tech.category}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
