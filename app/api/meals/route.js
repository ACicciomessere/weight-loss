import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { db, BUCKET, signedUrl } from "@/lib/supabase-server";

const deny = () => new NextResponse(null, { status: 404 });
const fail = (e) => NextResponse.json({ error: e.message }, { status: 400 });

const ALLOWED = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/heic": "heic", "image/gif": "gif" };
const MAX_BYTES = 10 * 1024 * 1024;

export async function GET(request) {
  try {
    if (!isAuthed(request.cookies)) return deny();
    const { data, error } = await db()
      .from("meals")
      .select("*")
      .order("eaten_at", { ascending: false });
    if (error) return fail(error);
    const meals = await Promise.all(
      data.map(async (m) => ({ ...m, image_url: await signedUrl(m.image_path) }))
    );
    return NextResponse.json(meals);
  } catch (e) {
    console.error(`[api] ${request.method} ${request.nextUrl.pathname}:`, e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (!isAuthed(request.cookies)) return deny();
    const form = await request.formData();
    const description = String(form.get("description") ?? "").trim().slice(0, 500);
    const eaten_at = form.get("eaten_at");
    const file = form.get("file");
    if (!description || !eaten_at) return fail(new Error("Datos inválidos"));

    let image_path = null;
    if (file && typeof file === "object" && file.size > 0) {
      const ext = ALLOWED[file.type];
      if (!ext) return fail(new Error("Formato de imagen no soportado"));
      if (file.size > MAX_BYTES) return fail(new Error("La imagen supera los 10 MB"));
      image_path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await db().storage.from(BUCKET).upload(image_path, file, { contentType: file.type });
      if (error) return fail(error);
    }

    const { error } = await db().from("meals").insert({ description, eaten_at, image_path });
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
    const { data: meal } = await db().from("meals").select("image_path").eq("id", id).single();
    if (meal?.image_path) await db().storage.from(BUCKET).remove([meal.image_path]);
    const { error } = await db().from("meals").delete().eq("id", id);
    if (error) return fail(error);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(`[api] ${request.method} ${request.nextUrl.pathname}:`, e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
