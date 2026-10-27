import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import TrackerClient from "@/components/TrackerClient";

export default async function Page() {
  if (!isAuthed(await cookies())) notFound();
  return <TrackerClient />;
}
