"use client";

import dynamic from "next/dynamic";

const AnalysisClient = dynamic(() => import("./AnalysisClient"), {
  ssr: false,
});

export default function AnalysisPage() {
  return <AnalysisClient />;
}
