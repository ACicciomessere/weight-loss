"use client";

import { useState } from "react";
import * as api from "@/lib/api";
import { nowLocal, fmt } from "@/lib/util";

export default function Meals({ meals, onChange }) {
  const [desc, setDesc] = useState("");
  const [at, setAt] = useState(nowLocal());
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!desc.trim()) return;
    setBusy(true);
    try {
      await api.addMeal(desc.trim(), new Date(at).toISOString(), file);
      setDesc("");
      setFile(null);
      setAt(nowLocal());
      e.target.reset();
      await onChange();
    } finally {
      setBusy(false);
    }
  }

  async function remove(meal) {
    if (!confirm("¿Borrar esta comida?")) return;
    await api.deleteMeal(meal);
    await onChange();
  }

  return (
    <>
      <div className="title-row">
        <h1 className="large-title">Comidas</h1>
        <a className="toolbar-link" href="/informe">
          Exportar PDF
        </a>
      </div>

      <form onSubmit={submit}>
        <div className="card">
          <label className="row">
            <input
              type="text"
              placeholder="¿Qué comiste?"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
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
          <label className="row">
            <span className="label">Foto</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => setFile(e.target.files[0] ?? null)}
            />
          </label>
        </div>
        <button className="btn" disabled={busy}>
          {busy ? "Subiendo…" : "Agregar"}
        </button>
      </form>

      <p className="section-header">Recientes</p>
      <div className="card list">
        {meals.map((m) => (
          <div className="row" key={m.id}>
            {m.image_url && (
              <a href={m.image_url} target="_blank" rel="noreferrer">
                <img className="thumb" src={m.image_url} alt="" />
              </a>
            )}
            <span className="label">
              <strong>{m.description}</strong>
              <small>{fmt(m.eaten_at)}</small>
            </span>
            <button className="link" onClick={() => remove(m)}>Eliminar</button>
          </div>
        ))}
        {meals.length === 0 && <p className="empty">Sin comidas todavía</p>}
      </div>
    </>
  );
}
