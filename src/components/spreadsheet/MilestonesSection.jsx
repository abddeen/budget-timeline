import Section from '../ui/Section';
import Button from '../ui/Button';
import DeleteButton from '../ui/DeleteButton';
import EditText from '../ui/EditText';
import EditDate from '../ui/EditDate';
import EmojiPicker from '../ui/EmojiPicker';
import TableHeader from '../ui/TableHeader';

export default function MilestonesSection({ milestones, updMS, remMS, addMS }) {
  return (
    <Section title="Milestones" emoji="🏁" actions={<Button onClick={addMS}>+ Milestone</Button>}>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-surface-alt">
            <TableHeader></TableHeader>
            <TableHeader>Date</TableHeader>
            <TableHeader>Label</TableHeader>
            <TableHeader></TableHeader>
          </tr>
        </thead>
        <tbody>
          {[...milestones].sort((a, b) => (a.date < b.date ? -1 : 1)).map((m, i) => (
            <tr key={m.id} className={`${i % 2 === 0 ? 'bg-bg' : 'bg-surface'} border-b border-border-light`}>
              <td className="py-2 px-1.5 w-7">
                <EmojiPicker value={m.icon} onChange={(v) => updMS(m.id, "icon", v)} />
              </td>
              <td className="py-2 px-1.5">
                <EditDate value={m.date} onChange={(v) => updMS(m.id, "date", v)} />
              </td>
              <td className="py-2 px-1.5">
                <EditText value={m.label} onChange={(v) => updMS(m.id, "label", v)} autoEdit={!!m.isNew} className="text-warning" />
              </td>
              <td className="py-2 px-1.5 text-center">
                <DeleteButton onClick={() => remMS(m.id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}
