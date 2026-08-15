"use client";

import dynamic from "next/dynamic";

const AgeGenderClient = dynamic(() => import("./AgeGenderClient"), {
  ssr: false,
});

export default function AgeGenderPage() {
  return <AgeGenderClient />;
}
