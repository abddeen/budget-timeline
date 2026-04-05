export default function TableHeader({ children, right }) {
  return (
    <th
      className={`py-2 px-1.5 ${right ? 'text-right' : 'text-left'} text-text-muted font-semibold text-[9px] tracking-[1px] uppercase border-b border-border whitespace-nowrap`}
    >
      {children}
    </th>
  );
}
