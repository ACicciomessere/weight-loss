"use client";

import dynamic from "next/dynamic";

const Report = dynamic(() => import("./Report"), { ssr: false });

export default function ReportClient() {
  return <Report />;
}
