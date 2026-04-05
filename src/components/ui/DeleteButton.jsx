export default function DeleteButton({ onClick }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="bg-none border-none text-text-dim cursor-pointer text-sm p-[2px_6px] rounded hover:text-negative"
    >
      ✕
    </button>
  );
}
