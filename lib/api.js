// Cliente: habla solo con /api/* de Next. La cookie de sesión viaja sola.

async function req(url, init) {
  const res = await fetch(url, init);
  if (res.status === 404) throw new Error("Sin acceso. Entrá con tu link.");
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error ${res.status}`);
  }
  return res.json();
}

// ---------- peso ----------
const qs = (from) => (from ? `?from=${encodeURIComponent(from)}` : "");

// from (opcional): ISO; trae solo registros desde ese momento.
export const getWeights = (from) => req(`/api/weights${qs(from)}`);

export const addWeight = (kg, recorded_at) =>
  req("/api/weights", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kg, recorded_at }),
  });

export const deleteWeight = (id) => req(`/api/weights?id=${id}`, { method: "DELETE" });

// ---------- comidas ----------
export const getMeals = (from) => req(`/api/meals${qs(from)}`);

export function addMeal(description, eaten_at, satiety, file) {
  const form = new FormData();
  form.append("description", description);
  form.append("eaten_at", eaten_at);
  form.append("satiety", String(satiety));
  if (file) form.append("file", file);
  return req("/api/meals", { method: "POST", body: form });
}

export const deleteMeal = (meal) => req(`/api/meals?id=${meal.id}`, { method: "DELETE" });
