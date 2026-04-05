import { useState, useCallback } from 'react';
import Section from '../ui/Section';
import Button from '../ui/Button';
import DeleteButton from '../ui/DeleteButton';
import EditText from '../ui/EditText';
import EditDate from '../ui/EditDate';
import EditCurrency from '../ui/EditCurrency';
import TableHeader from '../ui/TableHeader';
import { fmt } from '../../lib/constants';

function EditRate({ value, onChange }) {
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
        className="w-[60px] bg-input-bg border border-accent rounded text-text py-1 px-1.5 text-xs font-mono text-right outline-none"
      />
    );

  return (
    <span
      onClick={() => { setD(String(value)); setEd(true); }}
      title="Edit"
      className="cursor-pointer border-b border-dashed border-border-dark pb-px font-mono text-xs text-text-muted"
    >
      {value}%
    </span>
  );
}

export default function LoansSection({ loans, lastRow, updLn, remLn, addLoan }) {
  return (
    <Section title="Loans" emoji="🏦" actions={<Button onClick={addLoan}>+ Loan</Button>}>
      {loans.length === 0 ? (
        <div className="p-4 text-text-dim text-xs text-center">No loans.</div>
      ) : (
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-surface-alt">
              <TableHeader>Label</TableHeader>
              <TableHeader right>Amount</TableHeader>
              <TableHeader right>Rate (p.a.)</TableHeader>
              <TableHeader>Starts</TableHeader>
              <TableHeader right>End of Horizon</TableHeader>
              <TableHeader></TableHeader>
            </tr>
          </thead>
          <tbody>
            {loans.map((l, i) => (
              <tr key={l.id} className={`${i % 2 === 0 ? 'bg-bg' : 'bg-surface'} border-b border-border-light`}>
                <td className="py-2 px-1.5">
                  <EditText value={l.label} onChange={(v) => updLn(l.id, "label", v)} autoEdit={!!l.isNew} className="text-text" />
                </td>
                <td className="py-2 px-1.5 text-right">
                  <EditCurrency value={l.amount} onChange={(v) => updLn(l.id, "amount", v)} color="text-orange" />
                </td>
                <td className="py-2 px-1.5 text-right">
                  <EditRate value={l.rate ?? 0} onChange={(v) => updLn(l.id, "rate", v)} />
                </td>
                <td className="py-2 px-1.5">
                  <EditDate value={l.startDate} onChange={(v) => updLn(l.id, "startDate", v)} />
                </td>
                <td className="py-2 px-1.5 text-right font-mono font-bold text-orange">
                  {fmt(lastRow?.loans?.[l.id] ?? l.amount)}
                </td>
                <td className="py-2 px-1.5 text-center">
                  <DeleteButton onClick={() => remLn(l.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Section>
  );
}
