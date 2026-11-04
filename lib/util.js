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

// Escalas 1–5 para mostrar como ayuda al elegir.
export const HUNGER_LABELS = {
  1: "Sin hambre",
  2: "Poca hambre",
  3: "Hambre moderada",
  4: "Mucha hambre",
  5: "Muerto de hambre",
};

export const SATIETY_LABELS = {
  1: "Sigo con mucha hambre",
  2: "Me quedé con hambre",
  3: "Satisfecho",
  4: "Lleno",
  5: "Muy lleno",
};

// "Hambre 4/5 · Saciedad 3/5" (solo lo que se haya cargado)
export function scalesText(m) {
  return [
    m.hunger != null && `Hambre ${m.hunger}/5`,
    m.satiety != null && `Saciedad ${m.satiety}/5`,
  ].filter(Boolean).join(" · ");
}
