import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/supabase-server";
import { parseFrom } from "@/lib/server-util";

const deny = () => new NextResponse(null, { status: 404 });
const fail = (e) => NextResponse.json({ error: e.message }, { status: 400 });

export async function GET(request) {
  try {
    const user = getUser(request.cookies);
    if (!user) return deny();
    const from = parseFrom(request.nextUrl.searchParams.get("from"));
    if (from === false) return fail(new Error("Fecha 'from' inválida"));
    let q = db().from("weights").select("*").eq("user_id", user);
    if (from) q = q.gte("recorded_at", from);
    const { data, error } = await q.order("recorded_at", { ascending: true });
    if (error) return fail(error);
    return NextResponse.json(data);
  } catch (e) {
    console.error(`[api] ${request.method} ${request.nextUrl.pathname}:`, e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = getUser(request.cookies);
    if (!user) return deny();
    const { kg, recorded_at } = await request.json();
    if (typeof kg !== "number" || !(kg > 0) || !recorded_at) {
      return fail(new Error("Datos inválidos"));
    }
    const { error } = await db().from("weights").insert({ user_id: user, kg, recorded_at });
    if (error) return fail(error);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(`[api] ${request.method} ${request.nextUrl.pathname}:`, e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const user = getUser(request.cookies);
    if (!user) return deny();
    const id = Number(request.nextUrl.searchParams.get("id"));
    if (!Number.isInteger(id)) return fail(new Error("id inválido"));
    const { error } = await db().from("weights").delete().eq("id", id).eq("user_id", user);
    if (error) return fail(error);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(`[api] ${request.method} ${request.nextUrl.pathname}:`, e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
