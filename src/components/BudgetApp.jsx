import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { START, fmt, fD, iso, monthKey } from '../lib/constants';
import { DEF_HORIZONS, DEF_LAST_END, DEF_LOANS, DEF_OO, DEF_MS } from '../lib/defaults';
import { genEvents, compute } from '../lib/engine';
import { useBudgetData } from '../hooks/useBudgetData';
import EditCurrency from './ui/EditCurrency';
import Timeline from './timeline/Timeline';
import Spreadsheet from './spreadsheet/Spreadsheet';

const MAX_MONTH_FILTER_CHIPS = 24;

export default function BudgetApp({ onSignOut, userEmail }) {
  const { initialData, loading: dataLoading, save, saveStatus, setSaveStatus } = useBudgetData();

  const [tab, setTab] = useState("timeline");
  const [selM, setSelM] = useState(null);
  const [selHz, setSelHz] = useState([]);
  const [exp, setExp] = useState(null);
  const [ready, setReady] = useState(false);

  const [startSav, setStartSav] = useState(5000);
  const [lastEnd, setLastEnd] = useState(DEF_LAST_END);
  const [horizons, setHorizons] = useState(DEF_HORIZONS);
  const [loans, setLoans] = useState(DEF_LOANS);
  const [oneOffs, setOneOffs] = useState(DEF_OO);
  const [milestones, setMilestones] = useState(DEF_MS);

  // Derive effective horizons with computed endDates
  const effectiveHz = useMemo(() => {
    const s = [...horizons].sort((a, b) => (a.startDate < b.startDate ? -1 : 1));
    return s.map((h, i) => ({
      ...h,
      endDate: i < s.length - 1
        ? iso(new Date(new Date(s[i + 1].startDate + "T00:00:00").getTime() - 86400000))
        : lastEnd,
    }));
  }, [horizons, lastEnd]);

  const endDate = lastEnd;

  const selectedHz = useMemo(() => {
    if (selHz.length === 0) return null;
    return effectiveHz.filter((h) => selHz.includes(h.id));
  }, [selHz, effectiveHz]);

  const toggleHz = useCallback((id) => {
    setSelHz((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      return next.length === horizons.length ? [] : next;
    });
    setSelM(null);
  }, [horizons.length]);

  // If all selected horizons are deleted, reset to all
  useEffect(() => {
    if (selHz.length > 0 && !selHz.some((id) => horizons.find((h) => h.id === id))) {
      setSelHz([]);
    }
  }, [horizons, selHz]);

  // Hydrate from Supabase once loaded
  useEffect(() => {
    if (dataLoading) return;
    if (initialData?.v === 5) {
      if (initialData.startSav != null) setStartSav(initialData.startSav);
      if (initialData.horizons) {
        const hz = initialData.horizons.map(({ endDate: _, ...rest }) => rest);
        setHorizons(hz);
      }
      if (initialData.lastEnd) setLastEnd(initialData.lastEnd);
      else if (initialData.endDate) setLastEnd(initialData.endDate);
      else if (initialData.horizons?.length) {
        const maxEnd = initialData.horizons.reduce((m, h) => (h.endDate > m ? h.endDate : m), initialData.horizons[0].endDate || DEF_LAST_END);
        setLastEnd(maxEnd);
      }
      if (initialData.loans) setLoans(initialData.loans);
      if (initialData.oneOffs) setOneOffs(initialData.oneOffs);
      if (initialData.milestones) setMilestones(initialData.milestones);
    }
    setReady(true);
  }, [dataLoading, initialData]);

  // CRUD helpers
  const upd = (setter) => (id, f, v) => setter((l) => l.map((e) => (e.id === id ? { ...e, [f]: v } : e)));
  const rem = (setter) => (id) => setter((l) => l.filter((e) => e.id !== id));
  const updLn = useMemo(() => upd(setLoans), []);
  const remLn = useMemo(() => rem(setLoans), []);
  const updOO = useMemo(() => upd(setOneOffs), []);
  const remOO = useMemo(() => rem(setOneOffs), []);
  const updMS = useMemo(() => upd(setMilestones), []);
  const remMS = useMemo(() => rem(setMilestones), []);

  const updHzField = useCallback((hzId, f, v) => setHorizons((l) => l.map((h) => (h.id === hzId ? { ...h, [f]: v } : h))), []);
  const updHzExp = useCallback((hzId, exId, f, v) => setHorizons((l) => l.map((h) => (h.id === hzId ? { ...h, expenses: (h.expenses || []).map((e) => (e.id === exId ? { ...e, [f]: v } : e)) } : h))), []);
  const remHzExp = useCallback((hzId, exId) => setHorizons((l) => l.map((h) => (h.id === hzId ? { ...h, expenses: (h.expenses || []).filter((e) => e.id !== exId) } : h))), []);
  const addHzExp = useCallback((hzId) => setHorizons((l) => l.map((h) => (h.id === hzId ? { ...h, expenses: [{ id: `ex-${Date.now()}`, label: "New expense", amount: 0, frequency: "fortnightly", loanId: null, hidden: false, isNew: true }, ...(h.expenses || [])] } : h))), []);
  const copyExpToFuture = useCallback((hzId, exId) => setHorizons((l) => {
    const src = l.find((h) => h.id === hzId);
    const ex = (src?.expenses || []).find((e) => e.id === exId);
    if (!src || !ex) return l;
    return l.map((h) => {
      if (h.startDate <= src.startDate) return h;
      if ((h.expenses || []).some((e) => e.label === ex.label)) return h;
      return { ...h, expenses: [...(h.expenses || []), { ...ex, id: `ex-${Date.now()}-${h.id}`, isNew: false }] };
    });
  }), []);
  const remHz = useCallback((id) => {
    if (!confirm("Delete this horizon?")) return;
    setHorizons((l) => l.filter((h) => h.id !== id));
  }, []);
  const addHz = useCallback((srcId) => {
    const last = effectiveHz[effectiveHz.length - 1];
    const mid = last
      ? iso(new Date((new Date(last.startDate + "T00:00:00").getTime() + new Date(last.endDate + "T00:00:00").getTime()) / 2))
      : "2027-01-01";
    const src = srcId ? horizons.find((h) => h.id === srcId) : null;
    const newHz = {
      id: `hz-${Date.now()}`,
      label: "New Horizon",
      startDate: mid,
      income: src?.income ?? 5211.20,
      buffer: src?.buffer ?? 350,
      expenses: (src?.expenses || []).map((e) => ({ ...e, id: `ex-${Date.now()}-${e.id}`, isNew: false })),
      isNew: true,
    };
    setHorizons((l) => [...l, newHz]);
  }, [effectiveHz, horizons]);
  const addLoan = useCallback(() => setLoans((l) => [...l, { id: `ln-${Date.now()}`, label: "New Loan", amount: 0, startDate: START, isNew: true }]), []);
  const addOO = useCallback(() => setOneOffs((l) => [{ id: `oo-${Date.now()}`, date: "2026-06-15", label: "New event", type: "outflow", icon: "📌", amount: 0, critical: false, hidden: false, loanId: null, isNew: true }, ...l]), []);
  const addMS = useCallback(() => setMilestones((l) => [{ id: `ms-${Date.now()}`, date: "2026-06-15", label: "New milestone", icon: "⭐", isNew: true }, ...l]), []);
  const addMSAt = useCallback((date) => setMilestones((l) => [{ id: `ms-${Date.now()}`, date, label: "New milestone", icon: "⭐", isNew: true }, ...l]), []);

  // Auto-save to Supabase
  useEffect(() => {
    if (!ready) return;
    save({ endDate, lastEnd, startSav, horizons, loans, oneOffs, milestones });
  }, [startSav, lastEnd, horizons, loans, oneOffs, milestones, ready, save, endDate]);

  // Import/Export
  const fileRef = useRef(null);
  const doExport = useCallback(() => {
    const cl = (l) => l.map((e) => { const r = { ...e, isNew: false }; if (r.expenses) r.expenses = r.expenses.map((x) => ({ ...x, isNew: false })); return r; });
    const d = { v: 5, endDate, lastEnd, startSav, horizons: cl(horizons), loans: cl(loans), oneOffs: cl(oneOffs), milestones: cl(milestones), at: new Date().toISOString() };
    const b = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" });
    const u = URL.createObjectURL(b);
    const a = document.createElement("a");
    a.href = u;
    a.download = `budget-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(u);
  }, [endDate, lastEnd, startSav, horizons, loans, oneOffs, milestones]);

  const doImport = useCallback((e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => {
      try {
        const d = JSON.parse(ev.target.result);
        if (d.startSav != null) setStartSav(d.startSav);
        if (d.lastEnd) setLastEnd(d.lastEnd);
        if (d.horizons) setHorizons(d.horizons.map(({ endDate: _, ...rest }) => rest));
        if (d.loans) setLoans(d.loans);
        if (d.oneOffs) setOneOffs(d.oneOffs);
        if (d.milestones) setMilestones(d.milestones);
        setSaveStatus("Imported!");
      } catch {
        setSaveStatus("Failed");
      }
      setTimeout(() => setSaveStatus(""), 2000);
    };
    r.readAsText(f);
    e.target.value = "";
  }, [setSaveStatus]);

  // Build timeline
  const genEv = useMemo(() => genEvents(endDate, effectiveHz, milestones), [endDate, effectiveHz, milestones]);
  const allEv = useMemo(() => {
    const oo = oneOffs.filter((o) => o.date <= endDate && !o.hidden).map((o) => ({ ...o, cat: "oneoff" }));
    const merged = [...genEv, ...oo];
    merged.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    return merged;
  }, [genEv, oneOffs, endDate]);
  const rows = useMemo(() => compute(effectiveHz, loans, allEv, startSav), [effectiveHz, loans, allEv, startSav]);
  // Scope rows to selected horizons
  const hzRows = useMemo(() => {
    if (!selectedHz) return rows;
    return rows.filter((r) => selectedHz.some((h) => r.date >= h.startDate && r.date <= h.endDate));
  }, [rows, selectedHz]);
  const warnings = useMemo(() => hzRows.filter((r) => r.shortfall), [hzRows]);
  const activeM = useMemo(() => {
    const s = new Set();
    for (const r of hzRows) s.add(monthKey(r.date));
    const sorted = [...s].sort();
    return sorted.length <= MAX_MONTH_FILTER_CHIPS
      ? sorted
      : sorted.slice(-MAX_MONTH_FILTER_CHIPS);
  }, [hzRows]);

  useEffect(() => {
    if (selM != null && !activeM.includes(selM)) setSelM(null);
  }, [selM, activeM]);

  const visible = useMemo(
    () => (selM === null ? hzRows : hzRows.filter((r) => monthKey(r.date) === selM)),
    [selM, hzRows],
  );
  const mSum = useMemo(() => {
    const s = {};
    for (const r of hzRows) {
      const k = monthKey(r.date);
      if (!s[k]) s[k] = { net: 0, sav: 0 };
      s[k].net += r.savDelta;
      s[k].sav = r.savings;
    }
    return s;
  }, [hzRows]);
  const last = hzRows[hzRows.length - 1];

  if (!ready) {
    return (
      <div className="min-h-screen bg-bg text-text-dim font-sans flex items-center justify-center">
        <div>⏳ Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text font-sans py-6 px-4 max-w-[920px] mx-auto">
      <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={doImport} />

      {/* Header */}
      <div className="mb-4 flex justify-between items-start flex-wrap gap-2">
        <div>
          <div className="text-[11px] font-semibold tracking-[2px] uppercase text-text-muted mb-1.5">
            Budget Timeline
          </div>
          <div className="flex items-stretch gap-1.5 flex-wrap">
            <button
              onClick={() => { setSelHz([]); setSelM(null); }}
              className={`border-none rounded-lg py-1.5 px-3 text-xs font-semibold cursor-pointer flex items-center justify-center ${
                selHz.length === 0 ? 'bg-text-bright text-bg' : 'bg-surface-alt text-text-dim border border-border'
              }`}
            >
              All
            </button>
            {effectiveHz.map((h) => (
              <button
                key={h.id}
                onClick={() => toggleHz(h.id)}
                className={`border-none rounded-lg py-1.5 px-3 text-xs font-semibold cursor-pointer text-left flex flex-col items-start gap-0.5 ${
                  selHz.includes(h.id) ? 'bg-accent-dark text-accent-light' : 'bg-surface-alt text-text-dim border border-border'
                }`}
              >
                <span>📅 {h.label}</span>
                <span className="font-normal opacity-70 text-[10px] font-medium leading-tight">
                  {fD(h.startDate)} – {fD(h.endDate)}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {saveStatus && (
            <span className="text-[10px] text-positive font-semibold py-1 px-2 bg-positive-bg rounded-md">
              {saveStatus === "Saved" ? "✓ " : ""}{saveStatus}
            </span>
          )}
          <button onClick={doExport} className="text-[10px] text-text-dim bg-none border-none cursor-pointer hover:text-accent">↓ Export</button>
          <button onClick={() => fileRef.current?.click()} className="text-[10px] text-text-dim bg-none border-none cursor-pointer hover:text-accent">↑ Import</button>
          <span className="text-[10px] text-text-dim">{userEmail}</span>
          <button onClick={onSignOut} className="text-[10px] text-text-dim bg-none border-none cursor-pointer hover:text-negative">
            Sign out
          </button>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mb-4 py-3 px-4 bg-shortfall-border rounded-[10px] border border-negative-deep">
          <div className="text-[10px] font-bold tracking-[1.5px] uppercase text-negative mb-1.5">
            ⚠ Critical Shortfalls
          </div>
          {warnings.map((w) => (
            <div key={w.id} className="text-xs text-negative-light leading-relaxed">
              <strong>{w.icon} {w.label}</strong> on {fD(w.date)} — short by{" "}
              <span className="font-mono font-bold">{fmt(w.shortfallAmt)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div
        className="grid gap-2 mb-5"
        style={{ gridTemplateColumns: `repeat(${2 + loans.length}, 1fr)` }}
      >
        <div className="bg-surface-alt rounded-[10px] py-3 px-2.5 border border-border">
          <div className="text-[9px] font-semibold tracking-[1.5px] uppercase text-text-dim mb-[3px]">Savings</div>
          <div className={`text-base font-bold font-mono ${(last?.savings ?? 0) >= 0 ? 'text-positive' : 'text-negative'}`}>
            {fmt(last?.savings ?? startSav)}
          </div>
        </div>
        {loans.map((l) => (
          <div key={l.id} className="bg-surface-alt rounded-[10px] py-3 px-2.5 border border-border">
            <div className="text-[9px] font-semibold tracking-[1.5px] uppercase text-text-dim mb-[3px]">{l.label}</div>
            <div className="text-base font-bold font-mono text-orange">{fmt(last?.loans?.[l.id] ?? l.amount)}</div>
          </div>
        ))}
        <div className="bg-surface-alt rounded-[10px] py-3 px-2.5 border border-border">
          <div className="text-[9px] font-semibold tracking-[1.5px] uppercase text-text-dim mb-[3px]">Net Position</div>
          <div className="text-base font-bold font-mono text-muted">
            {fmt((last?.savings ?? startSav) - loans.reduce((s, l) => s + (last?.loans?.[l.id] ?? l.amount), 0))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 mb-4 bg-surface-alt rounded-[10px] p-[3px] border border-border w-fit">
        {["timeline", "spreadsheet"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-none rounded-lg py-[7px] px-[18px] text-xs font-semibold cursor-pointer capitalize ${
              tab === t ? 'bg-text-bright text-bg' : 'bg-transparent text-text-dim'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "timeline" && (
        <Timeline
          visible={visible}
          activeM={activeM}
          selM={selM}
          setSelM={setSelM}
          mSum={mSum}
          exp={exp}
          setExp={setExp}
          loans={loans}
        />
      )}

      {tab === "spreadsheet" && (
        <Spreadsheet
          horizons={horizons}
          effectiveHz={effectiveHz}
          lastEnd={lastEnd}
          setLastEnd={setLastEnd}
          loans={loans}
          oneOffs={oneOffs}
          milestones={milestones}
          startSav={startSav}
          setStartSav={setStartSav}
          endDate={endDate}
          lastRow={last}
          rows={rows}
          visible={visible}
          updHzField={updHzField}
          updHzExp={updHzExp}
          remHzExp={remHzExp}
          addHzExp={addHzExp}
          copyExpToFuture={copyExpToFuture}
          remHz={remHz}
          addHz={addHz}
          updLn={updLn}
          remLn={remLn}
          addLoan={addLoan}
          updOO={updOO}
          remOO={remOO}
          addOO={addOO}
          updMS={updMS}
          remMS={remMS}
          addMS={addMS}
          addMSAt={addMSAt}
        />
      )}
    </div>
  );
}
