import Section from '../ui/Section';
import Button from '../ui/Button';
import DeleteButton from '../ui/DeleteButton';
import EditText from '../ui/EditText';
import EditDate from '../ui/EditDate';
import EditCurrency from '../ui/EditCurrency';
import TableHeader from '../ui/TableHeader';
import { fmt } from '../../lib/constants';

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
