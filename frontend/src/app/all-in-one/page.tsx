"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

const AllInOneClient: ComponentType = dynamic(
  () => import("./AllInOneClient"),
  { ssr: false }
);

export default function AllInOnePage() {
  return <AllInOneClient />;
}
