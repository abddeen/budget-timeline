import { useState, useCallback } from "react";
import Button from "../ui/Button";
import DeleteButton from "../ui/DeleteButton";
import EditText from "../ui/EditText";
import EditDate from "../ui/EditDate";
import EditCurrency from "../ui/EditCurrency";
import Toggle from "../ui/Toggle";
import TableHeader from "../ui/TableHeader";
import { fD, fmt } from "../../lib/constants";

export default function HorizonsSection({
  horizons,
  effectiveHz,
  lastEnd,
  setLastEnd,
  loans,
  updHzField,
  updHzExp,
  remHzExp,
  addHzExp,
  copyExpToFuture,
  remHz,
  addHz,
}) {
  const [requestedId, setRequestedId] = useState(null);
  const [toast, setToast] = useState(null);

  // Derive activeId: requested tab, or first horizon as fallback
  const activeId = effectiveHz.find((h) => h.id === requestedId)
    ? requestedId
    : effectiveHz[0]?.id;

  // Auto-switch to newly added horizon, then clear isNew
  const newest = horizons.find((h) => h.isNew);
  if (newest) {
    if (requestedId !== newest.id) setRequestedId(newest.id);
    updHzField(newest.id, "isNew", false);
  }

  const setActiveId = setRequestedId;

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const handleCopy = useCallback(
    (hzId, exId) => {
      const hz = effectiveHz.find((h) => h.id === hzId);
      const ex = (hz?.expenses || []).find((e) => e.id === exId);
      const futureCount = effectiveHz.filter(
        (h) => h.startDate > hz.startDate,
      ).length;
      copyExpToFuture(hzId, exId);
      showToast(
        `Copied "${ex?.label}" to ${futureCount} future horizon${futureCount !== 1 ? "s" : ""}`,
      );
    },
    [effectiveHz, copyExpToFuture, showToast],
  );

  const handleStartDateChange = useCallback(
    (hzId, value) => {
      const idx = effectiveHz.findIndex((h) => h.id === hzId);
      if (idx === -1) return;
      const prev = effectiveHz[idx - 1];
      const next = effectiveHz[idx + 1];
      if (prev && value <= prev.startDate) {
        showToast("Must be after previous horizon's start");
        return;
      }
      if (next && value >= next.startDate) {
        showToast("Must be before next horizon's start");
        return;
      }
      if (value > effectiveHz[idx].endDate) {
        showToast("Must be before this horizon's end");
        return;
      }
      updHzField(hzId, "startDate", value);
    },
    [effectiveHz, updHzField, showToast],
  );

  const handleLastEndChange = useCallback(
    (value) => {
      const last = effectiveHz[effectiveHz.length - 1];
      if (last && value < last.startDate) {
        showToast("End date must be after last horizon's start");
        return;
      }
      setLastEnd(value);
    },
    [effectiveHz, setLastEnd, showToast],
  );

  const hz = effectiveHz.find((h) => h.id === activeId);
  const isLast = hz && hz.id === effectiveHz[effectiveHz.length - 1]?.id;
  const sortedExpenses = (hz?.expenses || []).slice().sort((a, b) => b.amount - a.amount);

  return (
    <div className="mb-5 bg-surface rounded-xl border border-border overflow-hidden relative">
      {/* Toast */}
      {toast && (
        <div className="absolute top-2 right-3 z-10 py-1.5 px-3 bg-accent-dark text-accent-light text-[11px] font-semibold rounded-lg shadow-lg animate-[fadeIn_0.15s_ease-out]">
          {toast}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex items-center border-b border-border-light bg-surface-alt">
        <div className="flex flex-1 overflow-x-auto">
          {effectiveHz.map((h) => (
            <button
              key={h.id}
              onClick={() => setActiveId(h.id)}
              className={`border-none py-2.5 px-4 text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors ${
                h.id === activeId
                  ? "bg-surface text-text-bright"
                  : "bg-transparent text-text-dim hover:text-text-muted"
              }`}
              style={
                h.id === activeId
                  ? { borderBottom: "2px solid var(--color-accent)" }
                  : {}
              }
            >
              📅 {h.label}
            </button>
          ))}
        </div>
        <div className="px-2 flex-shrink-0">
          <Button onClick={() => addHz(activeId)} variant="muted">
            + Horizon
          </Button>
        </div>
      </div>

      {hz && (
        <>
          {/* Horizon params */}
          <div className="py-3 px-4 border-b border-border-light flex gap-5 flex-wrap items-center">
            <div className="flex gap-1.5 items-center text-xs">
              <span className="text-text-muted">Start:</span>
              <EditDate
                value={hz.startDate}
                onChange={(v) => handleStartDateChange(hz.id, v)}
              />
              <span className="text-text-dim">→</span>
              {isLast ? (
                <>
                  <span className="text-text-muted">End:</span>
                  <EditDate
                    value={lastEnd}
                    onChange={handleLastEndChange}
                  />
                </>
              ) : (
                <span className="text-text-dim text-xs">{fD(hz.endDate)}</span>
              )}
            </div>
            <div className="flex gap-1.5 items-center text-xs">
              <span className="text-text-muted">Income/fn:</span>
              <EditCurrency
                value={hz.income}
                onChange={(v) => updHzField(hz.id, "income", v)}
                color="text-positive"
              />
            </div>
            <div className="flex gap-1.5 items-center text-xs">
              <span className="text-text-muted">Buffer/fn:</span>
              <EditCurrency
                value={hz.buffer}
                onChange={(v) => updHzField(hz.id, "buffer", v)}
                color="text-warning"
              />
            </div>
            <div className="flex gap-1.5 items-center text-xs">
              <span className="text-text-muted">Label:</span>
              <EditText
                value={hz.label}
                onChange={(v) => updHzField(hz.id, "label", v)}
                autoEdit={!!hz.isNew}
                className="text-text"
              />
            </div>
            <div className="flex gap-1.5 items-center ml-auto">
              <Button onClick={() => addHzExp(hz.id)} variant="danger">
                + Expense
              </Button>
              {horizons.length > 1 && (
                <DeleteButton onClick={() => remHz(hz.id)} />
              )}
            </div>
          </div>

          {/* Expenses table */}
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-surface-alt">
                <TableHeader>Expense</TableHeader>
                <TableHeader right>Amount</TableHeader>
                <TableHeader>Frequency</TableHeader>
                <TableHeader>Pays Loan</TableHeader>
                <TableHeader></TableHeader>
                <TableHeader></TableHeader>
                <TableHeader></TableHeader>
              </tr>
            </thead>
            <tbody>
              {sortedExpenses.map((ex, i) => (
                <tr
                  key={ex.id}
                  className={`${i % 2 === 0 ? "bg-bg" : "bg-surface"} border-b border-border-light ${ex.hidden ? "opacity-35" : ""}`}
                >
                  <td className="py-2 px-1.5">
                    <EditText
                      value={ex.label}
                      onChange={(v) => updHzExp(hz.id, ex.id, "label", v)}
                      autoEdit={!!ex.isNew}
                      className="text-text text-xs"
                    />
                  </td>
                  <td className="py-2 px-1.5 text-right">
                    <EditCurrency
                      value={ex.amount}
                      onChange={(v) => updHzExp(hz.id, ex.id, "amount", v)}
                      color={ex.loanId ? "text-orange" : "text-negative"}
                      prefix="-"
                    />
                  </td>
                  <td className="py-2 px-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const n =
                          ex.frequency === "fortnightly"
                            ? "monthly"
                            : ex.frequency === "monthly"
                              ? "quarterly"
                              : "fortnightly";
                        updHzExp(hz.id, ex.id, "frequency", n);
                      }}
                      className={`py-0.5 px-2 rounded text-[9px] font-semibold cursor-pointer border-none ${
                        ex.frequency === "fortnightly"
                          ? "bg-positive-deep text-positive"
                          : ex.frequency === "monthly"
                            ? "bg-accent-dark text-accent-light"
                            : "bg-purple-bg text-[#d8b4fe]"
                      }`}
                    >
                      {ex.frequency}
                    </button>
                  </td>
                  <td className="py-2 px-1.5">
                    <select
                      value={ex.loanId || ""}
                      onChange={(e) =>
                        updHzExp(hz.id, ex.id, "loanId", e.target.value || null)
                      }
                      className="bg-input-bg border border-border rounded text-[10px] py-0.5 px-1.5 outline-none cursor-pointer [color-scheme:dark]"
                      style={{
                        color: ex.loanId
                          ? "var(--color-orange)"
                          : "var(--color-text-dim)",
                      }}
                    >
                      <option value="">None</option>
                      {loans.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-1.5">
                    <Toggle
                      on={!ex.hidden}
                      onToggle={() =>
                        updHzExp(hz.id, ex.id, "hidden", !ex.hidden)
                      }
                    />
                  </td>
                  <td className="py-2 px-1.5 text-center">
                    {effectiveHz.some((h) => h.startDate > hz.startDate) && (
                      <button
                        onClick={() => handleCopy(hz.id, ex.id)}
                        title="Copy to all future horizons"
                        className="bg-transparent border-none cursor-pointer text-text-dim hover:text-accent text-[11px] py-0.5 px-1"
                      >
                        ⧉
                      </button>
                    )}
                  </td>
                  <td className="py-2 px-1.5 text-center">
                    <DeleteButton onClick={() => remHzExp(hz.id, ex.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sortedExpenses.length === 0 ? (
            <div className="p-4 text-text-dim text-xs text-center">
              No expenses in this horizon.
            </div>
          ) : (
            <div className="py-2.5 px-4 border-t border-border-light flex justify-between items-center text-xs">
              <div className="flex gap-4">
                <span className="text-text-muted">
                  Income: <span className="font-mono text-positive font-semibold">{fmt(hz.income)}</span>
                </span>
                <span className="text-text-muted">
                  Expenses: <span className="font-mono text-negative font-semibold">
                    {fmt((hz.expenses || []).filter((e) => !e.hidden).reduce((s, e) => {
                      const scale = e.frequency === "fortnightly" ? 1 : e.frequency === "monthly" ? 14 / 30.44 : 14 / 91.31;
                      return s + e.amount * scale;
                    }, 0))}
                  </span>
                  <span className="text-text-dim"> /fn</span>
                </span>
              </div>
              {(() => {
                const totalExp = (hz.expenses || []).filter((e) => !e.hidden).reduce((s, e) => {
                  const scale = e.frequency === "fortnightly" ? 1 : e.frequency === "monthly" ? 14 / 30.44 : 14 / 91.31;
                  return s + e.amount * scale;
                }, 0);
                const net = hz.income - hz.buffer - totalExp;
                return (
                  <span className={`font-mono font-bold ${net >= 0 ? 'text-positive' : 'text-negative'}`}>
                    {net >= 0 ? '+' : ''}{fmt(net)} /fn
                  </span>
                );
              })()}
            </div>
          )}
        </>
      )}
    </div>
  );
}
