import { useMemo } from 'react';
import { fmt, fD } from '../../lib/constants';
import MonthFilter from './MonthFilter';
import TimelineEvent from './TimelineEvent';

function groupEvents(rows) {
  const groups = [];
  let i = 0;
  while (i < rows.length) {
    const r = rows[i];
    if (r.type === 'salary') {
      // Collect expenses on the same date
      const expenses = [];
      let j = i + 1;
      while (j < rows.length && rows[j].type === 'expense' && rows[j].date === r.date) {
        expenses.push(rows[j]);
        j++;
      }
      if (expenses.length > 0) {
        const lastExp = expenses[expenses.length - 1];
        groups.push({
          type: 'payday-group',
          salary: r,
          expenses,
          finalSavings: lastExp.savings,
          finalLoans: lastExp.loans,
          id: r.id,
        });
        i = j;
      } else {
        groups.push({ type: 'single', row: r, id: r.id });
        i++;
      }
    } else {
      groups.push({ type: 'single', row: r, id: r.id });
      i++;
    }
  }
  return groups;
}

export default function Timeline({ visible, activeM, selM, setSelM, mSum, exp, setExp, loans }) {
  const groups = useMemo(() => groupEvents(visible), [visible]);

  return (
    <>
      <MonthFilter activeM={activeM} selM={selM} setSelM={setSelM} mSum={mSum} />
      <div className="relative">
        <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-border to-surface-alt rounded-sm" />
        {groups.map((g) =>
          g.type === 'payday-group' ? (
            <PaydayGroup
              key={g.id}
              group={g}
              isExpanded={exp === g.id}
              onToggle={() => setExp(exp === g.id ? null : g.id)}
              loans={loans}
            />
          ) : (
            <TimelineEvent
              key={g.id}
              r={g.row}
              isExpanded={exp === g.id}
              onToggle={() => setExp(exp === g.id ? null : g.id)}
              loans={loans}
            />
          )
        )}
      </div>
    </>
  );
}

function PaydayGroup({ group, isExpanded, onToggle, loans }) {
  const { salary, expenses, finalSavings, finalLoans } = group;
  const neg = finalSavings < 0;
  const net = salary.savDelta + expenses.reduce((s, e) => s + e.savDelta, 0);
  const buffer = salary.displayAmt - salary.savDelta;

  return (
    <div
      onClick={onToggle}
      className={`flex gap-3.5 mb-1 cursor-pointer py-[9px] px-3 rounded-xl border ${
        isExpanded ? 'bg-surface-alt border-border' : 'bg-transparent border-transparent'
      }`}
    >
      <div className="w-2.5 h-2.5 rounded-full mt-[5px] shrink-0 border-2 bg-positive border-positive-border" />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div>
            <div className="text-[9px] text-text-dim font-mono mb-0.5">
              {fD(salary.date)}
              {salary.horizon && <span className="ml-1 text-[8px] text-text-dim">{salary.horizon}</span>}
            </div>
            <div className="text-[13px] font-semibold text-text">
              {salary.icon} {salary.label}
              <span className="text-[10px] font-normal text-text-dim ml-2">
                {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-[13px] font-bold font-mono ${net >= 0 ? 'text-positive' : 'text-negative'}`}>
              {net >= 0 ? '+' : ''}{fmt(net)}
            </div>
          </div>
        </div>

        {/* Expanded breakdown */}
        {isExpanded && (
          <div className="mt-2 py-2 px-3 bg-surface rounded-lg border border-border-light">
            <div className="flex justify-between text-[11px] mb-1.5 pb-1.5 border-b border-border-light">
              <span className="text-positive">Income</span>
              <span className="font-mono text-positive">+{fmt(salary.displayAmt)}</span>
            </div>
            {buffer > 0 && (
              <div className="flex justify-between text-[11px] py-0.5">
                <span className="text-warning">Buffer</span>
                <span className="font-mono text-warning">-{fmt(buffer)}</span>
              </div>
            )}
            {expenses.map((ex) => (
              <div key={ex.id} className="flex justify-between text-[11px] py-0.5">
                <span className="text-text-muted">
                  {ex.label}
                  {ex.loanId ? <span className="text-orange"> → {loans.find((l) => l.id === ex.loanId)?.label || ex.loanId}</span> : ''}
                </span>
                <span className={`font-mono ${ex.loanId ? 'text-orange' : 'text-negative'}`}>-{fmt(ex.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between text-[11px] mt-1.5 pt-1.5 border-t border-border-light font-semibold">
              <span className="text-text-muted">Net</span>
              <span className={`font-mono ${net >= 0 ? 'text-positive' : 'text-negative'}`}>
                {net >= 0 ? '+' : ''}{fmt(net)}
              </span>
            </div>
            <div className="mt-1.5 text-[11px] font-mono text-muted">
              <span className={neg ? 'text-negative' : 'text-muted'}>
                Savings: {fmt(finalSavings)}{neg && ' ⚠'}
              </span>
              {loans.map((l) =>
                finalLoans?.[l.id] != null && finalLoans[l.id] > 0 ? (
                  <span key={l.id}>
                    <br />
                    <span className="text-orange">{l.label}: {fmt(finalLoans[l.id])}</span>
                  </span>
                ) : null
              )}
            </div>
          </div>
        )}

        {/* Savings bar (collapsed) */}
        {!isExpanded && (
          <div className="mt-[5px] flex items-center gap-2">
            <div className="flex-1 h-[3px] bg-surface-hover rounded-sm overflow-hidden">
              <div
                className={`h-full rounded-sm ${
                  neg
                    ? 'bg-gradient-to-r from-negative to-negative-dark'
                    : 'bg-gradient-to-r from-positive-border to-positive'
                }`}
                style={{ width: `${Math.min(100, Math.max(2, (Math.abs(finalSavings) / 30000) * 100))}%` }}
              />
            </div>
            <span className={`text-[9px] font-mono whitespace-nowrap ${neg ? 'text-negative' : 'text-text-dim'}`}>
              {fmt(finalSavings)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
