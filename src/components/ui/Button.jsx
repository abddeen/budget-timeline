export default function Button({
  children,
  onClick,
  variant = "default",
}) {
  const styles = {
    default: "bg-accent-dark border-accent-border text-accent-light",
    muted: "bg-surface-alt border-border text-text-muted",
    dim: "bg-surface-alt border-border text-text-dim",
    danger: "bg-negative-bg border-negative-deep text-negative",
  };

  return (
    <button
      onClick={onClick}
      className={`${styles[variant] || styles.default} border rounded-md py-[5px] px-3 text-[11px] font-semibold cursor-pointer`}
    >
      {children}
    </button>
  );
}
