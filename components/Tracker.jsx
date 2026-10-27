"use client";

import { useEffect, useState } from "react";
import * as api from "@/lib/api";
import Weights from "./Weights";
import Meals from "./Meals";
import Stats from "./Stats";

const TABS = [
  { id: "meals", label: "Comidas", icon: ForkIcon },
  { id: "weight", label: "Peso", icon: ScaleIcon },
  { id: "stats", label: "Resumen", icon: ChartIcon },
];

export default function Tracker() {
  const [tab, setTab] = useState("meals");
  const [weights, setWeights] = useState([]);
  const [meals, setMeals] = useState([]);
  const [error, setError] = useState(null);

  async function reload() {
    try {
      const [w, m] = await Promise.all([api.getWeights(), api.getMeals()]);
      setWeights(w);
      setMeals(m);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  return (
    <div className="app">
      {error && <p className="error">{error}</p>}

      {tab === "meals" && <Meals meals={meals} onChange={reload} />}
      {tab === "weight" && <Weights weights={weights} onChange={reload} />}
      {tab === "stats" && <Stats weights={weights} meals={meals} />}

      <nav className="tabbar">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={id === tab ? "active" : ""}
            onClick={() => setTab(id)}
          >
            <Icon />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function ForkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3v8a2 2 0 0 0 2 2v8M9 3v6M5 3v6M16 3c-1.5 0-3 2-3 5v3h3v10" />
    </svg>
  );
}

function ScaleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="3" />
      <path d="M8 8a5 5 0 0 1 8 0M12 10l1.5-2.5" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h16M6 16l4-5 4 3 5-7" />
    </svg>
  );
}
