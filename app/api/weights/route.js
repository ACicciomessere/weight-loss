import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { db } from "@/lib/supabase-server";

const deny = () => new NextResponse(null, { status: 404 });
const fail = (e) => NextResponse.json({ error: e.message }, { status: 400 });

export async function GET(request) {
  try {
    if (!isAuthed(request.cookies)) return deny();
    const { data, error } = await db()
      .from("weights")
      .select("*")
      .order("recorded_at", { ascending: true });
    if (error) return fail(error);
    return NextResponse.json(data);
  } catch (e) {
    console.error(`[api] ${request.method} ${request.nextUrl.pathname}:`, e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (!isAuthed(request.cookies)) return deny();
    const { kg, recorded_at } = await request.json();
    if (typeof kg !== "number" || !(kg > 0) || !recorded_at) {
      return fail(new Error("Datos inválidos"));
    }
    const { error } = await db().from("weights").insert({ kg, recorded_at });
    if (error) return fail(error);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(`[api] ${request.method} ${request.nextUrl.pathname}:`, e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    if (!isAuthed(request.cookies)) return deny();
    const id = Number(request.nextUrl.searchParams.get("id"));
    if (!Number.isInteger(id)) return fail(new Error("id inválido"));
    const { error } = await db().from("weights").delete().eq("id", id);
    if (error) return fail(error);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(`[api] ${request.method} ${request.nextUrl.pathname}:`, e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
