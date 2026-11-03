import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { db, BUCKET, signedUrl } from "@/lib/supabase-server";
import { parseFrom } from "@/lib/server-util";

const deny = () => new NextResponse(null, { status: 404 });
const fail = (e) => NextResponse.json({ error: e.message }, { status: 400 });

const ALLOWED = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/heic": "heic", "image/gif": "gif" };
const MAX_BYTES = 10 * 1024 * 1024;

export async function GET(request) {
  try {
    const user = getUser(request.cookies);
    if (!user) return deny();
    const from = parseFrom(request.nextUrl.searchParams.get("from"));
    if (from === false) return fail(new Error("Fecha 'from' inválida"));
    let q = db().from("meals").select("*").eq("user_id", user);
    if (from) q = q.gte("eaten_at", from);
    const { data, error } = await q.order("eaten_at", { ascending: false });
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
    const user = getUser(request.cookies);
    if (!user) return deny();
    const form = await request.formData();
    const description = String(form.get("description") ?? "").trim().slice(0, 500);
    const eaten_at = form.get("eaten_at");
    const satiety = Number(form.get("satiety"));
    const file = form.get("file");
    if (!description || !eaten_at) return fail(new Error("Datos inválidos"));
    if (!Number.isInteger(satiety) || satiety < 1 || satiety > 5) {
      return fail(new Error("La saciedad tiene que ser de 1 a 5"));
    }

    let image_path = null;
    if (file && typeof file === "object" && file.size > 0) {
      const ext = ALLOWED[file.type];
      if (!ext) return fail(new Error("Formato de imagen no soportado"));
      if (file.size > MAX_BYTES) return fail(new Error("La imagen supera los 10 MB"));
      image_path = `${user}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await db().storage.from(BUCKET).upload(image_path, file, { contentType: file.type });
      if (error) return fail(error);
    }

    const { error } = await db()
      .from("meals")
      .insert({ user_id: user, description, satiety, eaten_at, image_path });
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
    // Solo puede borrar sus propias comidas (y sus fotos).
    const { data: meal } = await db()
      .from("meals")
      .select("image_path")
      .eq("id", id)
      .eq("user_id", user)
      .maybeSingle();
    if (!meal) return fail(new Error("Comida no encontrada"));
    if (meal.image_path) await db().storage.from(BUCKET).remove([meal.image_path]);
    const { error } = await db().from("meals").delete().eq("id", id).eq("user_id", user);
    if (error) return fail(error);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(`[api] ${request.method} ${request.nextUrl.pathname}:`, e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
