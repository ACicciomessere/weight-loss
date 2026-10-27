"use client";

import dynamic from "next/dynamic";

// 100% client-side (hora local, datos vía /api), no se prerenderiza.
const Tracker = dynamic(() => import("./Tracker"), { ssr: false });

export default function TrackerClient() {
  return <Tracker />;
}
