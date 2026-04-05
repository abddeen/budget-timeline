import { useMemo } from 'react';
import Section from '../ui/Section';
import Button from '../ui/Button';
import DeleteButton from '../ui/DeleteButton';
import EditText from '../ui/EditText';
import EditDate from '../ui/EditDate';
import EditCurrency from '../ui/EditCurrency';
import EmojiPicker from '../ui/EmojiPicker';
import Toggle from '../ui/Toggle';
import TableHeader from '../ui/TableHeader';
import { fmt } from '../../lib/constants';

export default function OneOffsSection({ oneOffs, loans, rows, endDate, updOO, remOO, addOO }) {
  const sortedOO = useMemo(
    () => [...oneOffs].sort((a, b) => (a.date < b.date ? -1 : 1)),
    [oneOffs],
  );

  return (
    <Section title="One-Off Events" emoji="📌" actions={<Button onClick={addOO}>+ Event</Button>}>
      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr className="bg-surface-alt">
            <TableHeader></TableHeader>
            <TableHeader>Date</TableHeader>
            <TableHeader>Label</TableHeader>
            <TableHeader>Type</TableHeader>
            <TableHeader right>Amount</TableHeader>
            <TableHeader>Loan</TableHeader>
            <TableHeader>Priority</TableHeader>
            <TableHeader></TableHeader>
            <TableHeader></TableHeader>
          </tr>
        </thead>
        <tbody>
          {sortedOO.map((ev, i) => {
            const pastEnd = ev.date > endDate;
            const isH = ev.hidden;
            const dim = pastEnd || isH;
            const wR = !isH && rows.find((r) => r.id === ev.id);
            const warn = wR?.shortfall;
            const wA = wR?.shortfallAmt ?? 0;

            return (
              <tr
                key={ev.id}
                className={`border-b border-border-light ${
                  warn ? 'bg-shortfall-bg border-l-[3px] border-l-negative-dark' : `${i % 2 === 0 ? 'bg-bg' : 'bg-surface'} border-l-[3px] border-l-transparent`
                } ${dim ? 'opacity-35' : ''}`}
              >
                <td className="py-2 px-1 w-7">
                  <EmojiPicker value={ev.icon} onChange={(v) => updOO(ev.id, "icon", v)} />
                </td>
                <td className="py-2 px-1">
                  <EditDate value={ev.date} onChange={(v) => updOO(ev.id, "date", v)} />
                </td>
                <td className="py-2 px-1">
                  <EditText
                    value={ev.label}
                    onChange={(v) => updOO(ev.id, "label", v)}
                    autoEdit={!!ev.isNew}
                    className={`${isH ? 'text-text-dim line-through' : 'text-text'}`}
                  />
                </td>
                <td className="py-2 px-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updOO(ev.id, "type", ev.type === "inflow" ? "outflow" : "inflow");
                    }}
                    className={`py-0.5 px-2 rounded text-[9px] font-semibold cursor-pointer border-none ${
                      ev.type === "inflow" ? 'bg-positive-bg text-positive' : 'bg-negative-bg text-negative'
                    }`}
                  >
                    {ev.type === "inflow" ? "inflow ↕" : "outflow ↕"}
                  </button>
                </td>
                <td className="py-2 px-1 text-right">
                  <EditCurrency
                    value={ev.amount}
                    onChange={(v) => updOO(ev.id, "amount", v)}
                    color={ev.type === "inflow" ? "text-positive" : "text-negative"}
                    prefix={ev.type === "inflow" ? "+" : "-"}
                  />
                </td>
                <td className="py-2 px-1">
                  <select
                    value={ev.loanId || ""}
                    onChange={(e) => updOO(ev.id, "loanId", e.target.value || null)}
                    className="bg-input-bg border border-border rounded text-[10px] py-0.5 px-1.5 outline-none cursor-pointer [color-scheme:dark]"
                    style={{ color: ev.loanId ? 'var(--color-orange)' : 'var(--color-text-dim)' }}
                  >
                    <option value="">None</option>
                    {loans.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                  </select>
                </td>
                <td className="py-2 px-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updOO(ev.id, "critical", !ev.critical);
                    }}
                    className={`py-0.5 px-2 rounded text-[9px] font-semibold cursor-pointer border-none ${
                      ev.critical ? 'bg-warning-bg text-warning' : 'bg-input-bg text-text-dim'
                    }`}
                  >
                    {ev.critical ? "🔒 Critical" : "Flexible"}
                  </button>
                  {warn && (
                    <div className="text-[8px] text-negative mt-0.5 font-mono">
                      ⚠ short by {fmt(wA)}
                    </div>
                  )}
                </td>
                <td className="py-2 px-1">
                  <Toggle on={!isH} onToggle={() => updOO(ev.id, "hidden", !ev.hidden)} />
                </td>
                <td className="py-2 px-1 text-center">
                  <DeleteButton onClick={() => remOO(ev.id)} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Section>
  );
}
