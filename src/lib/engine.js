import { PAY1, PAY_MS, START, iso } from './constants';

export function genEvents(endDate, horizons, milestones) {
  const events = [];
  const sorted = [...horizons].sort((a, b) => (a.startDate < b.startDate ? -1 : 1));

  // Paydays
  let pd = new Date(PAY1 + "T00:00:00");
  while (iso(pd) <= endDate) {
    const d = iso(pd);
    if (d >= START) {
      const hz = sorted.find((h) => d >= h.startDate && d <= h.endDate);
      if (hz)
        events.push({ id: `pay-${d}`, date: d, label: "Payday", type: "salary", icon: "💰", cat: "salary", hzId: hz.id });
    }
    pd = new Date(pd.getTime() + PAY_MS);
  }

  // Recurring expenses per horizon
  for (const hz of sorted) {
    for (const ex of hz.expenses || []) {
      if (ex.hidden) continue;
      const dates = [];
      if (ex.frequency === "fortnightly") {
        let p = new Date(PAY1 + "T00:00:00");
        while (iso(p) <= endDate) {
          const d = iso(p);
          if (d >= hz.startDate && d <= hz.endDate && d <= endDate) dates.push(d);
          p = new Date(p.getTime() + PAY_MS);
        }
      } else if (ex.frequency === "monthly") {
        for (let dt = new Date("2026-04-01T00:00:00"); iso(dt) <= endDate; dt.setMonth(dt.getMonth() + 1)) {
          const d = iso(dt);
          if (d >= hz.startDate && d <= hz.endDate) dates.push(d);
        }
      } else if (ex.frequency === "quarterly") {
        for (let y = 2026; y <= 2028; y++)
          for (const m of [2, 5, 8, 11]) {
            const d = iso(new Date(y, m + 1, 0));
            if (d >= hz.startDate && d <= hz.endDate && d <= endDate) dates.push(d);
          }
      }
      for (const d of dates)
        events.push({
          id: `exp-${hz.id}-${ex.id}-${d}`,
          date: d,
          label: ex.label,
          type: "expense",
          icon: "💸",
          cat: "expense",
          amount: ex.amount,
          loanId: ex.loanId,
          hzId: hz.id,
        });
    }
  }

  for (const m of milestones)
    if (m.date <= endDate) events.push({ ...m, type: "milestone", cat: "milestone" });

  return events;
}

export function compute(horizons, loans, allEvents, startingSavings) {
  const loanBals = {};
  const loanRates = {};
  for (const l of loans) {
    loanBals[l.id] = { balance: l.amount, started: false };
    loanRates[l.id] = (l.rate ?? 0) / 100; // annual rate as decimal
  }
  let savings = startingSavings;
  const rows = [];
  const hzMap = {};
  for (const h of horizons) hzMap[h.id] = h;

  // Track which months we've already accrued interest for each loan
  const accruedMonths = {};
  for (const l of loans) accruedMonths[l.id] = new Set();

  for (const ev of allEvents) {
    for (const l of loans)
      if (!loanBals[l.id].started && ev.date >= l.startDate) loanBals[l.id].started = true;

    // Accrue monthly interest on loan balances at the start of each new month
    const evMonth = ev.date.slice(0, 7); // "YYYY-MM"
    for (const l of loans) {
      if (loanRates[l.id] > 0 && loanBals[l.id].started && loanBals[l.id].balance > 0 && !accruedMonths[l.id].has(evMonth)) {
        const monthlyRate = loanRates[l.id] / 12;
        loanBals[l.id].balance += loanBals[l.id].balance * monthlyRate;
      }
      accruedMonths[l.id].add(evMonth);
    }

    const hz = hzMap[ev.hzId] || horizons[0];
    let savDelta = 0,
      displayAmt = 0;
    const loanDeltas = {};

    if (ev.type === "salary") {
      displayAmt = hz.income;
      savDelta = hz.income - hz.buffer;
    } else if (ev.type === "expense") {
      displayAmt = ev.amount;
      savDelta = -ev.amount;
      if (ev.loanId && loanBals[ev.loanId]?.started) loanDeltas[ev.loanId] = -ev.amount;
    } else if (ev.type === "inflow") {
      savDelta = ev.amount ?? 0;
      displayAmt = ev.amount ?? 0;
    } else if (ev.type === "outflow") {
      displayAmt = ev.amount ?? 0;
      savDelta = -(ev.amount ?? 0);
      if (ev.loanId && loanBals[ev.loanId]?.started) loanDeltas[ev.loanId] = -(ev.amount ?? 0);
    }

    const savBefore = savings;
    savings += savDelta;
    for (const [lid, delta] of Object.entries(loanDeltas))
      loanBals[lid].balance = Math.max(0, loanBals[lid].balance + delta);
    const shortfall = ev.critical && (ev.type === "outflow" || ev.type === "expense") && savBefore < (ev.amount ?? 0);
    const lSnap = {};
    for (const k in loanBals) lSnap[k] = Math.round(loanBals[k].balance * 100) / 100;

    rows.push({
      ...ev,
      savings: Math.round(savings * 100) / 100,
      loans: lSnap,
      displayAmt: Math.round(displayAmt * 100) / 100,
      savDelta: Math.round(savDelta * 100) / 100,
      shortfall,
      shortfallAmt: shortfall ? Math.round(((ev.amount ?? 0) - savBefore) * 100) / 100 : 0,
      horizon: hz.label,
    });
  }
  return rows;
}
