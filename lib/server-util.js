// Server-only helpers para los route handlers.

// ?from=<ISO>: null si no vino, false si es inválido, ISO normalizado si es válido.
export function parseFrom(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? false : d.toISOString();
}
