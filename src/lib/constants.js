export const START = "2026-04-05";
export const DEND = "2026-10-31";
export const PAY1 = "2026-04-07";
export const PAY_MS = 14 * 86400000;

export const fmt = (n) => {
  const a = Math.abs(n);
  const s = a >= 1000
    ? "$" + a.toLocaleString("en-NZ", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : "$" + a.toFixed(0);
  return n < 0 ? "-" + s : s;
};

export const fD = (d) => {
  const dt = new Date(d + "T00:00:00");
  const base = dt.toLocaleDateString("en-NZ", { day: "numeric", month: "short" });
  return `${base} '${String(dt.getFullYear()).slice(2)}`;
};

export const iso = (dt) =>
  `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;

/** ISO date "YYYY-MM-DD" -> "YYYY-MM" (lexicographic order matches chronological). */
export const monthKey = (isoDate) => isoDate.slice(0, 7);

export const MN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const EMOJIS = [
  "📌", "🏠", "⚖️", "🩺", "✈️", "📋", "🔑", "🎉", "🛋️", "🛡️", "💰", "🚗",
  "🎓", "🏥", "🛒", "🎁", "📱", "🔧", "🎶", "🐾", "👶", "💍", "🏋️", "📦",
  "🍽️", "⚡", "🌍", "🏦", "💳", "🧾", "⭐", "🎯", "🏁", "🚀",
];
