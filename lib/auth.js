// Server-only. Acceso por link secreto: /enter?k=APP_TOKEN setea una cookie
// httpOnly y todo lo demás la verifica. Sin cookie válida → 404.
import { timingSafeEqual } from "node:crypto";

export const COOKIE = "tracker_session";

export function isValidToken(value) {
  const expected = process.env.APP_TOKEN;
  if (!expected) {
    console.error("[auth] APP_TOKEN no está definido en el entorno del servidor");
    return false;
  }
  if (typeof value !== "string") return false;
  const a = Buffer.from(value);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Para route handlers (request.cookies) y para server components (cookies()).
export function isAuthed(cookieStore) {
  return isValidToken(cookieStore.get(COOKIE)?.value);
}
