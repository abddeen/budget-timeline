export default function Toggle({ on, onToggle }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className="bg-none border-none cursor-pointer p-[2px_4px]"
    >
      <div
        className={`w-8 h-[18px] rounded-full relative border transition-all duration-200 ${
          on ? 'bg-positive-border border-positive-dark' : 'bg-border border-border-dark'
        }`}
      >
        <div
          className={`w-3 h-3 rounded-full absolute top-[2px] transition-all duration-200 ${
            on ? 'left-4 bg-positive' : 'left-[2px] bg-text-dim'
          }`}
        />
      </div>
    </button>
  );
}
