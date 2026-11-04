"use client";

// Escala 1–5 opcional: tocar el valor elegido de nuevo lo deselecciona.
export default function ScaleInput({ label, labels, value, onChange }) {
  return (
    <div className="row">
      <span className="label">
        {label}
        <small className="scale-hint">{value ? labels[value] : "Opcional"}</small>
      </span>
      <div className="scale" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            title={labels[n]}
            className={value === n ? "on" : ""}
            onClick={() => onChange(value === n ? null : n)}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
