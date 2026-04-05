import { fmt, fD } from '../../lib/constants';

const dotColor = {
  shortfall: 'bg-[#ef4444] border-negative-dark',
  milestone: 'bg-warning border-warning',
  salary: 'bg-positive border-positive-border',
  inflow: 'bg-purple border-purple-dark',
};

export default function TimelineEvent({ r, isExpanded, onToggle, loans }) {
  const isEx = r.type === "expense";
  const neg = r.savings < 0;

  // Collapsed expense row
  if (isEx && !isExpanded) {
    return (
      <div
        onClick={onToggle}
        className="flex gap-3.5 mb-0.5 cursor-pointer py-1 px-3 pl-9 rounded-lg opacity-60"
      >
        <div className="flex-1 flex justify-between text-[11px]">
          <span className="text-text-muted">
            {r.label}
            {r.loanId ? ` → ${loans.find((l) => l.id === r.loanId)?.label || r.loanId}` : ""}
          </span>
          <span className="font-mono text-negative">-{fmt(r.amount)}</span>
        </div>
      </div>
    );
  }

  const dotClass = r.shortfall
    ? dotColor.shortfall
    : dotColor[r.type] || 'bg-negative border-negative-deep';

  const milestoneGlow = r.type === "milestone" ? "shadow-[0_0_8px_rgba(251,191,36,0.4)]" : "";

  return (
    <div
      onClick={onToggle}
      className={`flex gap-3.5 mb-1 cursor-pointer py-[9px] px-3 rounded-xl border ${
        r.shortfall
          ? 'bg-shortfall-bg border-negative-deep'
          : isExpanded
            ? 'bg-surface-alt border-border'
            : 'bg-transparent border-transparent'
      }`}
    >
      <div
        className={`w-2.5 h-2.5 rounded-full mt-[5px] shrink-0 border-2 ${dotClass} ${milestoneGlow}`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div>
            <div className="text-[9px] text-text-dim font-mono mb-0.5">
              {fD(r.date)}
              {r.critical && (
                <span className={`ml-1 text-[8px] ${r.shortfall ? 'text-negative' : 'text-warning'}`}>
                  CRITICAL
                </span>
              )}
              {r.horizon && <span className="ml-1 text-[8px] text-text-dim">{r.horizon}</span>}
            </div>
            <div className="text-[13px] font-semibold text-text">
              {r.icon} {r.label}
            </div>
          </div>
          {r.type !== "milestone" && r.displayAmt > 0 && (
            <div
              className={`text-[13px] font-bold font-mono whitespace-nowrap ${
                r.type === "salary" || r.type === "inflow"
                  ? 'text-positive'
                  : r.type === "expense"
                    ? 'text-negative'
                    : 'text-negative'
              }`}
            >
              {r.type === "salary" || r.type === "inflow" ? "+" : "-"}
              {fmt(r.displayAmt)}
            </div>
          )}
        </div>

        {/* Shortfall warning (collapsed) */}
        {r.shortfall && !isExpanded && (
          <div className="mt-1 text-[11px] text-negative font-semibold">
            ⚠ Short by {fmt(r.shortfallAmt)}
          </div>
        )}

        {/* Expanded detail */}
        {isExpanded && (
          <div className="mt-2 py-2.5 px-3 bg-surface-alt rounded-lg border border-border">
            {r.loanId && (
              <div className="text-[11px] text-orange">
                → Pays: {loans.find((l) => l.id === r.loanId)?.label || r.loanId}
              </div>
            )}
            <div className="mt-1 text-[11px] font-mono text-muted leading-[1.8]">
              <span className={neg ? 'text-negative' : 'text-muted'}>
                Savings: {fmt(r.savings)}{neg && " ⚠"}
              </span>
              {loans.map((l) =>
                r.loans?.[l.id] != null && r.loans[l.id] > 0 ? (
                  <span key={l.id}>
                    <br />
                    <span className="text-orange">
                      {l.label}: {fmt(r.loans[l.id])}
                    </span>
                  </span>
                ) : null
              )}
            </div>
          </div>
        )}

        {/* Savings bar (collapsed, non-shortfall) */}
        {!isExpanded && !r.shortfall && (
          <div className="mt-[5px] flex items-center gap-2">
            <div className="flex-1 h-[3px] bg-surface-hover rounded-sm overflow-hidden">
              <div
                className={`h-full rounded-sm ${
                  neg
                    ? 'bg-gradient-to-r from-negative to-negative-dark'
                    : 'bg-gradient-to-r from-positive-border to-positive'
                }`}
                style={{ width: `${Math.min(100, Math.max(2, (Math.abs(r.savings) / 30000) * 100))}%` }}
              />
            </div>
            <span className={`text-[9px] font-mono whitespace-nowrap ${neg ? 'text-negative' : 'text-text-dim'}`}>
              {fmt(r.savings)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
