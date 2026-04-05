import { useState } from 'react';
import { fD } from '../../lib/constants';

export default function EditDate({ value, onChange }) {
  const [ed, setEd] = useState(false);
  const [d, setD] = useState("");

  if (ed)
    return (
      <input
        autoFocus
        type="date"
        value={d}
        onChange={(e) => setD(e.target.value)}
        onBlur={() => {
          setEd(false);
          if (/^\d{4}-\d{2}-\d{2}$/.test(d)) setTimeout(() => onChange(d), 0);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.target.blur();
          if (e.key === "Escape") setEd(false);
        }}
        className="bg-input-bg border border-accent rounded text-text py-1 px-1.5 text-[11px] font-mono outline-none [color-scheme:dark]"
      />
    );

  return (
    <span
      onClick={() => { setD(value); setEd(true); }}
      title="Edit"
      className="cursor-pointer border-b border-dashed border-border-dark pb-px text-text-muted font-mono text-[11px]"
    >
      {fD(value)}
    </span>
  );
}
