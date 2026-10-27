"use client";

import { useState } from "react";
import * as api from "@/lib/api";
import { nowLocal, fmt } from "@/lib/util";

export default function Weights({ weights, onChange }) {
  const [kg, setKg] = useState("");
  const [at, setAt] = useState(nowLocal());
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!kg) return;
    setBusy(true);
    try {
      await api.addWeight(parseFloat(kg), new Date(at).toISOString());
      setKg("");
      setAt(nowLocal());
      await onChange();
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    if (!confirm("¿Borrar este registro?")) return;
    await api.deleteWeight(id);
    await onChange();
  }

  const sorted = [...weights].reverse();

  return (
    <>
      <h1 className="large-title">Peso</h1>

      <form onSubmit={submit}>
        <div className="card">
          <label className="row">
            <span className="label">Peso (kg)</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="1"
              placeholder="0.0"
              value={kg}
              onChange={(e) => setKg(e.target.value)}
              required
            />
          </label>
          <label className="row">
            <span className="label">Fecha</span>
            <input
              type="datetime-local"
              value={at}
              onChange={(e) => setAt(e.target.value)}
              required
            />
          </label>
        </div>
        <button className="btn" disabled={busy}>Agregar</button>
      </form>

      <p className="section-header">Historial</p>
      <div className="card list">
        {sorted.map((w) => (
          <div className="row" key={w.id}>
            <span className="label">
              <strong>{w.kg} kg</strong>
              <small>{fmt(w.recorded_at)}</small>
            </span>
            <button className="link" onClick={() => remove(w.id)}>Eliminar</button>
          </div>
        ))}
        {sorted.length === 0 && <p className="empty">Sin registros todavía</p>}
      </div>
    </>
  );
}
