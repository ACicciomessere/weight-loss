"use client";

import { useState } from "react";
import * as api from "@/lib/api";
import { nowLocal, fmt, scalesText, HUNGER_LABELS, SATIETY_LABELS } from "@/lib/util";
import ScaleInput from "./ScaleInput";

export default function Meals({ meals, onChange }) {
  const [desc, setDesc] = useState("");
  const [at, setAt] = useState(nowLocal());
  const [hunger, setHunger] = useState(null);
  const [satiety, setSatiety] = useState(null);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (!desc.trim()) return;
    setBusy(true);
    setErr(null);
    const form = e.currentTarget;
    try {
      await api.addMeal(desc.trim(), new Date(at).toISOString(), { hunger, satiety }, file);
      setDesc("");
      setHunger(null);
      setSatiety(null);
      setFile(null);
      setAt(nowLocal());
      form.reset();
      await onChange();
    } catch (error) {
      setErr(error.message);
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
          <ScaleInput label="Hambre antes" labels={HUNGER_LABELS} value={hunger} onChange={setHunger} />
          <ScaleInput label="Saciedad después" labels={SATIETY_LABELS} value={satiety} onChange={setSatiety} />
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
        {err && <p className="form-error">{err}</p>}
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
              <small>
                {fmt(m.eaten_at)}
                {scalesText(m) && ` · ${scalesText(m)}`}
              </small>
            </span>
            <button className="link" onClick={() => remove(m)}>Eliminar</button>
          </div>
        ))}
        {meals.length === 0 && <p className="empty">Sin comidas todavía</p>}
      </div>
    </>
  );
}
