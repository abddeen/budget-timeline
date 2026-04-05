import { useState, useCallback, useMemo, useRef } from 'react';
import { fD, iso } from '../../lib/constants';
import DeleteButton from '../ui/DeleteButton';
import EditText from '../ui/EditText';
import EditDate from '../ui/EditDate';
import EmojiPicker from '../ui/EmojiPicker';
import TableHeader from '../ui/TableHeader';

const COLORS = [
  { bg: 'bg-accent-dark', text: 'text-accent-light' },
  { bg: 'bg-positive-deep', text: 'text-positive' },
  { bg: 'bg-purple-bg', text: 'text-[#d8b4fe]' },
  { bg: 'bg-warning-bg', text: 'text-warning' },
  { bg: 'bg-negative-bg', text: 'text-negative' },
];

export default function HorizonsTimeline({
  horizons, milestones = [],
  updMS, remMS, addMSAt,
}) {
  const [showTable, setShowTable] = useState(false);
  const [hovered, setHovered] = useState(null);
  const barRef = useRef(null);

  const sorted = useMemo(
    () => [...horizons].sort((a, b) => (a.startDate < b.startDate ? -1 : 1)),
    [horizons],
  );

  const totalDays = useMemo(() => {
    if (sorted.length === 0) return 1;
    const first = new Date(sorted[0].startDate + 'T00:00:00');
    const last = new Date(sorted[sorted.length - 1].endDate + 'T00:00:00');
    return Math.max(1, (last - first) / 86400000);
  }, [sorted]);

  const handleBarClick = useCallback((e) => {
    if (!barRef.current || sorted.length === 0) return;
    const rect = barRef.current.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const minTime = new Date(sorted[0].startDate + 'T00:00:00').getTime();
    const maxTime = new Date(sorted[sorted.length - 1].endDate + 'T00:00:00').getTime();
    const clickTime = minTime + pct * (maxTime - minTime);
    const date = iso(new Date(clickTime));
    addMSAt(date);
    setShowTable(true);
  }, [sorted, addMSAt]);

  if (sorted.length === 0) return null;

  const minDate = new Date(sorted[0].startDate + 'T00:00:00');
  const maxDate = sorted[sorted.length - 1].endDate;

  const visibleMilestones = milestones.filter(
    (m) => m.date >= sorted[0].startDate && m.date <= maxDate,
  );

  const sortedMilestones = useMemo(
    () => [...milestones].sort((a, b) => (a.date < b.date ? -1 : 1)),
    [milestones],
  );

  return (
    <div className="mb-3">
      <div className="relative">
        {/* Milestone icons above the bar */}
        <div className="relative h-5">
          {visibleMilestones.map((m) => {
            const dayOffset = (new Date(m.date + 'T00:00:00') - minDate) / 86400000;
            const pct = (dayOffset / totalDays) * 100;
            return (
              <span
                key={m.id}
                className="absolute bottom-0 cursor-default"
                style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
                onMouseEnter={() => setHovered(m.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <span className="text-[10px]">{m.icon}</span>
                {hovered === m.id && (
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 py-1 px-2 bg-surface border border-border rounded text-[9px] text-text-bright font-semibold whitespace-nowrap shadow-lg z-20">
                    {m.label} — {fD(m.date)}
                  </span>
                )}
              </span>
            );
          })}
        </div>
        {/* Horizon bar */}
        <div
          ref={barRef}
          onClick={handleBarClick}
          className="flex rounded-lg overflow-hidden h-7 border border-border cursor-crosshair"
          title="Click to add milestone"
        >
          {sorted.map((h, i) => {
            const start = (new Date(h.startDate + 'T00:00:00') - minDate) / 86400000;
            const days = Math.max(1, (new Date(h.endDate + 'T00:00:00') - new Date(h.startDate + 'T00:00:00')) / 86400000);
            const c = COLORS[i % COLORS.length];
            return (
              <div
                key={h.id}
                className={`${c.bg} ${c.text} flex items-center justify-center text-[9px] font-semibold overflow-hidden whitespace-nowrap px-1 pointer-events-none`}
                style={{ width: `${(days / totalDays) * 100}%`, marginLeft: i === 0 ? `${(start / totalDays) * 100}%` : 0 }}
              >
                {h.label}
              </div>
            );
          })}
        </div>
        {/* Vertical tick lines from icons to bar */}
        {visibleMilestones.map((m) => {
          const dayOffset = (new Date(m.date + 'T00:00:00') - minDate) / 86400000;
          const pct = (dayOffset / totalDays) * 100;
          return (
            <div
              key={`tick-${m.id}`}
              className="absolute pointer-events-none"
              style={{ left: `${pct}%`, top: '20px', height: '28px' }}
            >
              <div className="w-px h-full bg-warning opacity-60" />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between items-center mt-1">
        <span className="text-[9px] text-text-dim">{fD(sorted[0].startDate)}</span>
        <button
          onClick={() => setShowTable((v) => !v)}
          className="bg-transparent border-none text-[9px] text-accent cursor-pointer font-semibold hover:underline"
        >
          {showTable ? 'Hide milestones' : `All milestones (${milestones.length})`}
        </button>
        <span className="text-[9px] text-text-dim">{fD(sorted[sorted.length - 1].endDate)}</span>
      </div>

      {/* Milestones table */}
      {showTable && (
        <div className="mt-2 bg-surface rounded-lg border border-border overflow-hidden">
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
              {sortedMilestones.map((m, i) => (
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
        </div>
      )}
    </div>
  );
}
