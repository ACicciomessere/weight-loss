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

export default function Report() {
  const [meals, setMeals] = useState(null);
  const [weights, setWeights] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.getMeals(), api.getWeights()])
      .then(([m, w]) => {
        setMeals(m);
        setWeights(w);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="report-empty">{error}</p>;
  if (!meals) return <p className="report-empty">Cargando…</p>;

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
      <div className="report-toolbar no-print">
        <Link href="/" className="toolbar-link">‹ Volver</Link>
      </div>

      <h1>Resumen</h1>
      <p className="report-meta">
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
      {keys.length === 0 && <p className="report-empty">Sin registros.</p>}

      <div className="report-footer no-print">
        <button className="btn" onClick={() => window.print()}>
          Guardar como PDF
        </button>
      </div>
    </div>
  );
}
