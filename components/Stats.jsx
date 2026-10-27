"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fmtDate } from "@/lib/util";

function dayKey(d) {
  return new Date(d).toLocaleDateString("sv-SE"); // YYYY-MM-DD local
}

const axis = { fontSize: 12, fill: "#8e8e93" };
const tooltip = {
  contentStyle: { borderRadius: 10, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,.15)", fontSize: 14 },
};

export default function Stats({ weights, meals }) {
  const weightData = weights.map((w) => ({ date: fmtDate(w.recorded_at), kg: w.kg }));

  const first = weights[0]?.kg;
  const last = weights[weights.length - 1]?.kg;
  const min = weights.length ? Math.min(...weights.map((w) => w.kg)) : null;
  const max = weights.length ? Math.max(...weights.map((w) => w.kg)) : null;
  const diff = first != null && last != null ? last - first : null;

  const byDay = {};
  for (const m of meals) byDay[dayKey(m.eaten_at)] = (byDay[dayKey(m.eaten_at)] || 0) + 1;
  const mealData = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    mealData.push({ date: fmtDate(d), comidas: byDay[dayKey(d)] || 0 });
  }
  const avgMeals = (mealData.reduce((a, b) => a + b.comidas, 0) / 14).toFixed(1);

  return (
    <>
      <h1 className="large-title">Resumen</h1>

      <div className="tiles">
        <Tile label="Peso actual" value={last != null ? `${last} kg` : "–"} accent />
        <Tile
          label="Variación"
          value={diff != null ? `${diff > 0 ? "+" : ""}${diff.toFixed(1)} kg` : "–"}
        />
        <Tile label="Mín / Máx" value={min != null ? `${min} / ${max}` : "–"} />
        <Tile label="Comidas por día" value={avgMeals} />
      </div>

      <p className="section-header">Peso</p>
      <div className="card chart-card">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={weightData}>
            <XAxis dataKey="date" tick={axis} axisLine={false} tickLine={false} />
            <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={axis} axisLine={false} tickLine={false} width={36} />
            <Tooltip {...tooltip} />
            <Line type="monotone" dataKey="kg" stroke="#007aff" strokeWidth={3} dot={{ r: 4, fill: "#007aff", strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="section-header">Comidas · últimos 14 días</p>
      <div className="card chart-card">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={mealData}>
            <XAxis dataKey="date" tick={axis} axisLine={false} tickLine={false} interval={1} />
            <YAxis allowDecimals={false} tick={axis} axisLine={false} tickLine={false} width={36} />
            <Tooltip {...tooltip} cursor={{ fill: "rgba(118,118,128,0.12)" }} />
            <Bar dataKey="comidas" fill="#34c759" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

function Tile({ label, value, accent }) {
  return (
    <div className={`tile${accent ? " accent" : ""}`}>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}
