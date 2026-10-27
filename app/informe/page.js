import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import ReportClient from "@/components/ReportClient";

export default async function Page() {
  if (!isAuthed(await cookies())) notFound();
  return <ReportClient />;
}
