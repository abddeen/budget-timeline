export default function Section({ title, emoji, actions, children }) {
  return (
    <div className="mb-5 bg-surface rounded-xl border border-border overflow-hidden">
      <div className="py-3 px-4 pb-2 border-b border-border-light flex justify-between items-center">
        <div className="text-[10px] font-semibold tracking-[1.5px] uppercase text-text-dim">
          {emoji} {title}{" "}
          <span className="font-normal tracking-normal normal-case text-accent">
            — click to edit
          </span>
        </div>
        <div className="flex gap-1.5">{actions}</div>
      </div>
      {children}
    </div>
  );
}
