// Server-only. Acceso por link secreto: /enter?k=<token> setea una cookie
// httpOnly y todo lo demás la verifica. Sin cookie válida → 404.
// Cada token corresponde a un usuario: APP_TOKEN → user1, AF_TOKEN → user2.
import { timingSafeEqual } from "node:crypto";

export const COOKIE = "tracker_session";

const USERS = [
  { env: "APP_TOKEN", user: "user1" },
  { env: "AF_TOKEN", user: "user2" },
];

function safeEqual(value, expected) {
  const a = Buffer.from(value);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Devuelve el id del usuario dueño del token, o null si no es válido.
export function userForToken(value) {
  if (!process.env.APP_TOKEN) {
    console.error("[auth] APP_TOKEN no está definido en el entorno del servidor");
  }
  if (typeof value !== "string" || !value) return null;
  for (const { env, user } of USERS) {
    const expected = process.env[env];
    if (expected && safeEqual(value, expected)) return user;
  }
  return null;
}

// Para route handlers (request.cookies) y para server components (cookies()).
export function getUser(cookieStore) {
  return userForToken(cookieStore.get(COOKIE)?.value);
}

export function isAuthed(cookieStore) {
  return getUser(cookieStore) !== null;
}
