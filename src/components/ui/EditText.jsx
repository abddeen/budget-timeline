import { useState, useRef, useEffect } from 'react';

export default function EditText({ value, onChange, autoEdit = false, className = "" }) {
  const used = useRef(false);
  const ae = autoEdit && !used.current;
  const [ed, setEd] = useState(ae);
  const [d, setD] = useState(ae ? value : "");

  useEffect(() => {
    if (ae) used.current = true;
  }, []);

  if (ed)
    return (
      <input
        autoFocus
        value={d}
        onChange={(e) => setD(e.target.value)}
        onFocus={(e) => e.target.select()}
        onBlur={() => {
          setEd(false);
          const v = d.trim();
          if (v) setTimeout(() => onChange(v), 0);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.target.blur();
          if (e.key === "Escape") setEd(false);
        }}
        className="w-[140px] bg-input-bg border border-accent rounded text-text py-1 px-1.5 text-xs font-sans outline-none"
      />
    );

  return (
    <span
      onClick={() => { setD(value); setEd(true); }}
      title="Edit"
      className={`cursor-pointer border-b border-dashed border-border-dark pb-px ${className}`}
    >
      {value}
    </span>
  );
}
