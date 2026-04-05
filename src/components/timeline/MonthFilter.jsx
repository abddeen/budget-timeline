import { MN, fmt } from '../../lib/constants';

function monthChipLabel(ymKey, showYear) {
  const [y, mo] = ymKey.split("-");
  const mi = parseInt(mo, 10) - 1;
  const name = MN[mi] ?? ymKey;
  return showYear ? `${name} '${String(y).slice(2)}` : name;
}

export default function MonthFilter({ activeM, selM, setSelM, mSum }) {
  const showYear = new Set(activeM.map((k) => k.slice(0, 4))).size > 1;

  return (
    <div className="mb-6 overflow-x-auto overflow-y-hidden -mx-1 px-1">
      <div className="flex w-max flex-nowrap gap-[5px] pb-1">
      <button
        type="button"
        onClick={() => setSelM(null)}
        className={`shrink-0 rounded-2xl py-1.5 px-3 text-[11px] font-semibold cursor-pointer border ${
          selM === null
            ? 'bg-text-bright text-bg border-text-bright'
            : 'bg-surface-alt text-text-muted border-border'
        }`}
      >
        All
      </button>
      {activeM.map((ymKey) => {
        const ms = mSum[ymKey];
        const active = selM === ymKey;
        return (
          <button
            type="button"
            key={ymKey}
            onClick={() => setSelM(active ? null : ymKey)}
            className={`shrink-0 rounded-[14px] py-[7px] px-2.5 text-[11px] font-semibold cursor-pointer min-w-[48px] text-center border ${
              active
                ? 'bg-text-bright text-bg border-text-bright'
                : 'bg-surface-alt text-text-muted border-border'
            }`}
          >
            {monthChipLabel(ymKey, showYear)}
            {ms && (
              <div className="mt-0.5">
                <div
                  className={`text-[8px] font-mono ${
                    active
                      ? ms.net >= 0 ? 'text-positive-dark' : 'text-negative-dark'
                      : ms.net >= 0 ? 'text-positive' : 'text-negative'
                  }`}
                >
                  {ms.net >= 0 ? "+" : ""}{fmt(ms.net)}
                </div>
                <div className={`text-[7px] font-mono ${active ? 'text-text-muted' : 'text-text-dim'}`}>
                  bal {fmt(ms.sav)}
                </div>
              </div>
            )}
          </button>
        );
      })}
      </div>
    </div>
  );
}
