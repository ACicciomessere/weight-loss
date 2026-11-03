"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as api from "@/lib/api";

const time = (iso) =>
  new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

const dayKey = (iso) => new Date(iso).toLocaleDateString("sv-SE"); // YYYY-MM-DD local

const dayLabel = (key) =>
  new Date(key + "T12:00:00").toLocaleDateString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const shortDate = (key) =>
  new Date(key + "T12:00:00").toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const today = () => new Date().toLocaleDateString("sv-SE");

// ?desde=YYYY-MM-DD en la URL, para que recargar mantenga el filtro.
function initialFrom() {
  const v = new URLSearchParams(window.location.search).get("desde");
  return v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "";
}

export default function Report() {
  const [from, setFrom] = useState(initialFrom); // "" = todo
  const [meals, setMeals] = useState(null);
  const [weights, setWeights] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (from) url.searchParams.set("desde", from);
    else url.searchParams.delete("desde");
    window.history.replaceState(null, "", url);

    // medianoche local del día elegido
    const fromIso = from ? new Date(from + "T00:00:00").toISOString() : undefined;
    let cancelled = false;
    setMeals(null);
    Promise.all([api.getMeals(fromIso), api.getWeights(fromIso)])
      .then(([m, w]) => {
        if (cancelled) return;
        setMeals(m);
        setWeights(w);
        setError(null);
      })
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [from]);

  const toolbar = (
    <div className="report-toolbar no-print">
      <Link href="/" className="toolbar-link">‹ Volver</Link>
      <label className="report-from">
        Desde
        <input
          type="date"
          value={from}
          max={today()}
          onChange={(e) => setFrom(e.target.value)}
        />
        {from && (
          <button type="button" onClick={() => setFrom("")}>
            Todo
          </button>
        )}
      </label>
    </div>
  );

  if (error) return <div className="report">{toolbar}<p className="report-empty">{error}</p></div>;
  if (!meals) return <div className="report">{toolbar}<p className="report-empty">Cargando…</p></div>;

  const generated = new Date().toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // un grupo por día con sus pesos y comidas, ordenado cronológicamente
  const days = {};
  for (const w of weights) (days[dayKey(w.recorded_at)] ||= { weights: [], meals: [] }).weights.push(w);
  for (const m of meals) (days[dayKey(m.eaten_at)] ||= { weights: [], meals: [] }).meals.push(m);
  const keys = Object.keys(days).sort();
  for (const k of keys) {
    days[k].weights.sort((a, b) => a.recorded_at.localeCompare(b.recorded_at));
    days[k].meals.sort((a, b) => a.eaten_at.localeCompare(b.eaten_at));
  }

  return (
    <div className="report">
      {toolbar}

      <h1>Resumen</h1>
      <p className="report-meta">
        {from ? `Desde el ${shortDate(from)} · ` : ""}
        Generado el {generated} · {meals.length} comidas · {weights.length} registros de peso
      </p>

      {keys.map((k) => {
        const { weights: ws, meals: ms } = days[k];
        return (
          <section key={k} className="report-day">
            <h2>
              <span>{dayLabel(k)}</span>
              {ws.length > 0 && (
                <span className="report-weight">
                  {ws.map((w) => `${w.kg} kg (${time(w.recorded_at)})`).join(" · ")}
                </span>
              )}
            </h2>
            {ms.length > 0 && (
              <table>
                <tbody>
                  {ms.map((m) => (
                    <tr key={m.id}>
                      <td className="report-time">{time(m.eaten_at)}</td>
                      <td className="report-desc">{m.description}</td>
                      <td className="report-sat">
                        {m.satiety != null && `Saciedad ${m.satiety}/5`}
                      </td>
                      <td className="report-img">
                        {m.image_url && <img src={m.image_url} alt="" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        );
      })}
      {keys.length === 0 && <p className="report-empty">Sin registros{from ? " desde esa fecha" : ""}.</p>}

      <div className="report-footer no-print">
        <button className="btn" onClick={() => window.print()}>
          Guardar como PDF
        </button>
      </div>
    </div>
  );
}
