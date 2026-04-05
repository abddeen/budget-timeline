import { useState, useCallback } from 'react';
import { fmt } from '../../lib/constants';

export default function EditCurrency({ value, onChange, color = "text-text", prefix = "" }) {
  const [ed, setEd] = useState(false);
  const [d, setD] = useState("");

  const commit = useCallback(() => {
    setEd(false);
    const n = parseFloat(d);
    if (!isNaN(n) && n >= 0) setTimeout(() => onChange(Math.round(n * 100) / 100), 0);
  }, [d, onChange]);

  if (ed)
    return (
      <input
        autoFocus
        value={d}
        onChange={(e) => setD(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.target.blur();
          if (e.key === "Escape") setEd(false);
        }}
        className="w-[90px] bg-input-bg border border-accent rounded text-text py-1 px-1.5 text-xs font-mono text-right outline-none"
      />
    );

  return (
    <span
      onClick={() => { setD(String(value)); setEd(true); }}
      title="Edit"
      className={`cursor-pointer border-b border-dashed border-border-dark pb-px font-mono text-xs ${color}`}
    >
      {prefix}{fmt(value)}
    </span>
  );
}
