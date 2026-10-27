// Server-only: usa la secret key, que saltea RLS. Nunca importar desde el cliente.
import { createClient } from "@supabase/supabase-js";

export const BUCKET = "meal-images";

let client;
export function db() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;
    if (!url || !key) throw new Error("Faltan SUPABASE_URL y/o SUPABASE_SECRET_KEY");
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

// URL firmada temporal para una imagen del bucket privado.
export async function signedUrl(path) {
  if (!path) return null;
  const { data } = await db().storage.from(BUCKET).createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}
