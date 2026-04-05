import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

function stripIsNew(list) {
  return list.map((e) => {
    const r = { ...e, isNew: false };
    if (r.expenses) r.expenses = r.expenses.map((x) => ({ ...x, isNew: false }));
    return r;
  });
}

export function useBudgetData() {
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const saveTimerRef = useRef(null);

  useEffect(() => {
    supabase
      .from('budget')
      .select('data')
      .eq('id', 'shared')
      .single()
      .then(({ data, error }) => {
        if (data?.data?.v === 5) {
          setInitialData(data.data);
        }
        setLoading(false);
      });
  }, []);

  const save = useCallback((budgetState) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const cleaned = {
        v: 5,
        endDate: budgetState.endDate,
        startSav: budgetState.startSav,
        horizons: stripIsNew(budgetState.horizons),
        loans: stripIsNew(budgetState.loans),
        oneOffs: stripIsNew(budgetState.oneOffs),
        milestones: stripIsNew(budgetState.milestones),
      };
      const { error } = await supabase
        .from('budget')
        .update({ data: cleaned })
        .eq('id', 'shared');
      if (!error) {
        setSaveStatus('Saved');
        setTimeout(() => setSaveStatus(''), 1500);
      } else {
        setSaveStatus('Save failed');
        setTimeout(() => setSaveStatus(''), 2000);
      }
    }, 800);
  }, []);

  return { initialData, loading, save, saveStatus, setSaveStatus };
}
