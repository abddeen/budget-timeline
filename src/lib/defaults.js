export const DEF_HORIZONS = [
  {
    id: "h1", label: "Pre-Settlement", startDate: "2026-04-05", income: 5211.20, buffer: 350,
    expenses: [
      { id: "rent", label: "Rent", amount: 1520, frequency: "fortnightly", loanId: null, hidden: false },
      { id: "food", label: "Food", amount: 800, frequency: "fortnightly", loanId: null, hidden: false },
      { id: "petrol", label: "Petrol", amount: 200, frequency: "fortnightly", loanId: null, hidden: false },
      { id: "elec", label: "Electricity", amount: 200, frequency: "fortnightly", loanId: null, hidden: false },
      { id: "kings", label: "Kings", amount: 120, frequency: "fortnightly", loanId: null, hidden: false },
      { id: "phone", label: "Phone/Internet", amount: 154.20, frequency: "fortnightly", loanId: null, hidden: false },
      { id: "appt", label: "Appointments", amount: 150, frequency: "fortnightly", loanId: null, hidden: false },
    ],
  },
  {
    id: "h2", label: "Post-Settlement", startDate: "2026-05-15", income: 5211.20, buffer: 350,
    expenses: [
      { id: "food2", label: "Food", amount: 800, frequency: "fortnightly", loanId: null, hidden: false },
      { id: "petrol2", label: "Petrol", amount: 200, frequency: "fortnightly", loanId: null, hidden: false },
      { id: "elec2", label: "Electricity", amount: 200, frequency: "fortnightly", loanId: null, hidden: false },
      { id: "kings2", label: "Kings", amount: 120, frequency: "fortnightly", loanId: null, hidden: false },
      { id: "phone2", label: "Phone/Internet", amount: 154.20, frequency: "fortnightly", loanId: null, hidden: false },
      { id: "appt2", label: "Appointments", amount: 150, frequency: "fortnightly", loanId: null, hidden: false },
      { id: "mortpay", label: "Mortgage Repayment", amount: 1520, frequency: "fortnightly", loanId: "mortgage", hidden: false },
      { id: "rates", label: "Property Rates", amount: 1500, frequency: "quarterly", loanId: null, hidden: false },
    ],
  },
];

export const DEF_LAST_END = "2028-12-31";

export const DEF_LOANS = [
  { id: "mortgage", label: "Mortgage", amount: 1080000, startDate: "2026-05-15" },
  { id: "abba", label: "Loan from Abba", amount: 135000, startDate: "2026-04-05" },
];

export const DEF_OO = [
  { id: "coffee", date: "2026-04-05", label: "Coffee Table", type: "outflow", icon: "📌", amount: 750, critical: false, hidden: false, loanId: null },
  { id: "bench", date: "2026-04-05", label: "Bench", type: "outflow", icon: "📌", amount: 350, critical: false, hidden: false, loanId: null },
  { id: "sofas", date: "2026-04-05", label: "Sofas", type: "outflow", icon: "📌", amount: 2000, critical: false, hidden: false, loanId: null },
  { id: "ins", date: "2026-05-04", label: "Insurance Payout (est.)", type: "inflow", icon: "🛡️", amount: 15000, critical: false, hidden: false, loanId: null },
  { id: "floor", date: "2026-05-08", label: "Flooring", type: "outflow", icon: "🏠", amount: 15000, critical: true, hidden: false, loanId: null },
  { id: "vinyl", date: "2026-05-08", label: "Vinyl", type: "outflow", icon: "📌", amount: 500, critical: false, hidden: false, loanId: null },
  { id: "rugs", date: "2026-05-10", label: "Rugs", type: "outflow", icon: "🏠", amount: 1000, critical: false, hidden: false, loanId: null },
  { id: "lawyer", date: "2026-05-12", label: "Lawyer", type: "outflow", icon: "⚖️", amount: 3500, critical: true, hidden: false, loanId: null },
  { id: "maint", date: "2026-05-13", label: "Pre-move maintenance", type: "outflow", icon: "🔧", amount: 1000, critical: false, hidden: false, loanId: null },
  { id: "tickets", date: "2026-05-15", label: "Trip Tickets", type: "outflow", icon: "✈️", amount: 12000, critical: true, hidden: false, loanId: null },
  { id: "taxret", date: "2026-06-01", label: "Tax Return", type: "inflow", icon: "📋", amount: 1500, critical: false, hidden: false, loanId: null },
  { id: "bond", date: "2026-06-06", label: "Bond Refund (est.)", type: "inflow", icon: "🔑", amount: 2440, critical: false, hidden: false, loanId: null },
  { id: "propsale", date: "2026-08-15", label: "Property Sale Proceeds", type: "inflow", icon: "🏘️", amount: 800000, critical: false, hidden: false, loanId: null },
  { id: "loanpay", date: "2026-08-15", label: "Mortgage Lump Sum", type: "outflow", icon: "🏦", amount: 800000, critical: false, hidden: false, loanId: "mortgage" },
];

export const DEF_MS = [
  { id: "settle", date: "2026-05-15", label: "House Settlement", icon: "🏡" },
  { id: "moveout", date: "2026-05-23", label: "Move Out of Rental", icon: "📦" },
  { id: "tripgo", date: "2026-08-01", label: "Trip Starts", icon: "🌍" },
];
