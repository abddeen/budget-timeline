import EditCurrency from '../ui/EditCurrency';
import HorizonsTimeline from './HorizonsTimeline';
import HorizonsSection from './HorizonsSection';
import LoansSection from './LoansSection';
import OneOffsSection from './OneOffsSection';
import FullTable from './FullTable';

export default function Spreadsheet({
  horizons, effectiveHz, lastEnd, setLastEnd, loans, oneOffs, milestones,
  startSav, setStartSav,
  endDate, lastRow, rows, visible,
  updHzField, updHzExp, remHzExp, addHzExp, copyExpToFuture, remHz, addHz,
  updLn, remLn, addLoan,
  updOO, remOO, addOO,
  updMS, remMS, addMS, addMSAt,
  onSelectHz,
}) {
  return (
    <div>
      <HorizonsTimeline
        horizons={effectiveHz}
        milestones={milestones}
        updMS={updMS}
        remMS={remMS}
        addMS={addMS}
        addMSAt={addMSAt}
      />
      <HorizonsSection
        horizons={horizons}
        effectiveHz={effectiveHz}
        lastEnd={lastEnd}
        setLastEnd={setLastEnd}
        loans={loans}
        updHzField={updHzField}
        updHzExp={updHzExp}
        remHzExp={remHzExp}
        addHzExp={addHzExp}
        copyExpToFuture={copyExpToFuture}
        remHz={remHz}
        addHz={addHz}
        onSelectHz={onSelectHz}
      />

      <div className="mb-5 flex gap-2.5 items-center">
        <div className="flex gap-2 items-center text-xs">
          <span className="text-text-muted">Starting Savings:</span>
          <EditCurrency value={startSav} onChange={setStartSav} color="text-positive" />
        </div>
      </div>

      <LoansSection
        loans={loans}
        lastRow={lastRow}
        updLn={updLn}
        remLn={remLn}
        addLoan={addLoan}
      />

      <OneOffsSection
        oneOffs={oneOffs}
        loans={loans}
        rows={rows}
        endDate={endDate}
        updOO={updOO}
        remOO={remOO}
        addOO={addOO}
      />

      <FullTable visible={visible} loans={loans} />
    </div>
  );
}
