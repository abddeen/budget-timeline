import TableHeader from '../ui/TableHeader';
import { fmt, fD } from '../../lib/constants';

export default function FullTable({ visible, loans }) {
  return (
    <div className="rounded-[10px] border border-border overflow-hidden">
      <div className="py-3 px-4 bg-surface-alt border-b border-border">
        <div className="text-[10px] font-semibold tracking-[1.5px] uppercase text-text-dim">
          Full Timeline — {visible.length} events
        </div>
      </div>
      <div className="max-h-[500px] overflow-y-auto">
        <table className="w-full border-collapse text-[11px] font-mono">
          <thead>
            <tr className="bg-surface-alt sticky top-0 z-[1]">
              <TableHeader>Date</TableHeader>
              <TableHeader>Event</TableHeader>
              <TableHeader>Type</TableHeader>
              <TableHeader right>Amount</TableHeader>
              <TableHeader right>Savings</TableHeader>
              {loans.map((l) => (
                <TableHeader key={l.id} right>{l.label}</TableHeader>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((r, i) => (
              <tr
                key={r.id + "-" + i}
                className={`border-b border-border-light ${
                  r.shortfall ? 'bg-shortfall-bg' : i % 2 === 0 ? 'bg-bg' : 'bg-surface'
                }`}
              >
                <td className="p-1.5 text-text-muted whitespace-nowrap">{fD(r.date)}</td>
                <td className="p-1.5 text-text font-sans font-medium">
                  {r.icon} {r.label}
                  {r.shortfall && <span className="ml-1 text-[9px] text-negative">⚠</span>}
                </td>
                <td className="p-1.5">
                  <span
                    className={`py-px px-[5px] rounded-[3px] text-[8px] font-semibold ${
                      r.type === "salary" || r.type === "inflow"
                        ? 'bg-positive-bg text-positive'
                        : r.type === "outflow" || r.type === "expense"
                          ? 'bg-negative-bg text-negative'
                          : 'bg-warning-border text-warning'
                    }`}
                  >
                    {r.type}
                  </span>
                </td>
                <td
                  className={`p-1.5 text-right font-semibold ${
                    r.type === "salary" || r.type === "inflow"
                      ? 'text-positive'
                      : r.type === "expense" || r.type === "outflow"
                        ? 'text-negative'
                        : 'text-text-dim'
                  }`}
                >
                  {r.displayAmt > 0
                    ? (r.type === "salary" || r.type === "inflow" ? "+" : "-") + fmt(r.displayAmt)
                    : "—"}
                </td>
                <td className={`p-1.5 text-right font-semibold ${r.savings < 0 ? 'text-negative' : 'text-positive'}`}>
                  {fmt(r.savings)}
                </td>
                {loans.map((l) => (
                  <td
                    key={l.id}
                    className={`p-1.5 text-right font-semibold ${
                      (r.loans?.[l.id] ?? 0) > 0 ? 'text-orange' : 'text-border'
                    }`}
                  >
                    {(r.loans?.[l.id] ?? 0) > 0 ? fmt(r.loans[l.id]) : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
