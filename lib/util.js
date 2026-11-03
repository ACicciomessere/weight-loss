// "YYYY-MM-DDTHH:mm" en hora local, para <input type="datetime-local">
export function nowLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function fmt(iso) {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
  });
}

// Escala de saciedad (1–5) para mostrar como ayuda al elegir.
export const SATIETY_LABELS = {
  1: "1 · Sigo con mucha hambre",
  2: "2 · Me quedé con hambre",
  3: "3 · Satisfecho",
  4: "4 · Lleno",
  5: "5 · Muy lleno",
};
