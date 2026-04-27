// ============================================================
// APP ROOT
// ============================================================

const { useState, useEffect, useRef } = React;

const TWEAK_DEFAULTS = {
  unit: 'lb',
  restDuration: 75,
  accentColor: '#478dff',
};

function App() {
  const [onboarded, setOnboarded] = useState(() => !!localStorage.getItem('wapp_profile'));
  const [tab, setTab]             = useState(() => localStorage.getItem('wapp_tab') || 'home');
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [tweaks, setTweaks] = useState(() => {
    try { return { ...TWEAK_DEFAULTS, ...JSON.parse(localStorage.getItem('wapp_tweaks') || '{}') }; }
    catch { return TWEAK_DEFAULTS; }
  });
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wapp_history')) || makeSeedHistory(); }
    catch { return makeSeedHistory(); }
  });
  const [weights, setWeights] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wapp_weights')) || { ...DEFAULT_WEIGHTS }; }
    catch { return { ...DEFAULT_WEIGHTS }; }
  });
  const [savedSwaps, setSavedSwaps] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wapp_program_swaps') || '{}'); }
    catch { return {}; }
  });
  const [savedDayNames, setSavedDayNames] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wapp_day_names') || '{}'); }
    catch { return {}; }
  });
  const [savedDeletions, setSavedDeletions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wapp_deletions') || '{}'); }
    catch { return {}; }
  });
  const [weekProgress, setWeekProgress] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wapp_week_progress')) || { week: 1, done: [] }; }
    catch { return { week: 1, done: [] }; }
  });
  const [tweaksVisible, setTweaksVisible] = useState(false);
  const [workoutMinimized, setWorkoutMinimized] = useState(false);
  const workoutStartTime = useRef(null);

  useEffect(() => { localStorage.setItem('wapp_tab', tab); }, [tab]);
  useEffect(() => { localStorage.setItem('wapp_history', JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem('wapp_weights', JSON.stringify(weights)); }, [weights]);
  useEffect(() => { localStorage.setItem('wapp_program_swaps', JSON.stringify(savedSwaps)); }, [savedSwaps]);
  useEffect(() => { localStorage.setItem('wapp_day_names', JSON.stringify(savedDayNames)); }, [savedDayNames]);
  useEffect(() => { localStorage.setItem('wapp_deletions', JSON.stringify(savedDeletions)); }, [savedDeletions]);
  useEffect(() => { localStorage.setItem('wapp_week_progress', JSON.stringify(weekProgress)); }, [weekProgress]);

  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === '__activate_edit_mode')   setTweaksVisible(true);
      if (e.data?.type === '__deactivate_edit_mode') setTweaksVisible(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  // Reset stale lime-green accent
  useEffect(() => {
    if (tweaks.accentColor === '#d4ff47') {
      updateTweak('accentColor', '#478dff');
    }
  }, []);

  function updateTweak(key, val) {
    const next = { ...tweaks, [key]: val };
    setTweaks(next);
    localStorage.setItem('wapp_tweaks', JSON.stringify(next));
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: next }, '*');
  }

  function handleStartWorkout(day) {
    workoutStartTime.current = Date.now();
    setWorkoutMinimized(false);
    setActiveWorkout(day);
  }

  function handleWorkoutComplete(result) {
    setHistory(prev => [...prev, {
      id: 'h' + Date.now(),
      dayId: result.dayId, name: result.name, date: result.date,
      sets: result.sets, duration: result.duration || 55, topLifts: result.topLifts || [],
    }]);
    if (result.weightUpdates) {
      setWeights(prev => {
        const next = { ...prev };
        Object.entries(result.weightUpdates).forEach(([id, { w }]) => { next[id] = { w }; });
        return next;
      });
    }
    // Track week progress — auto-advance when all 4 days are done
    setWeekProgress(prev => {
      const newDone = [...new Set([...prev.done, result.dayId])];
      const allDone = ['A','B','C','D'].every(id => newDone.includes(id));
      return allDone ? { week: prev.week + 1, done: [] } : { ...prev, done: newDone };
    });
    setActiveWorkout(null);
    setWorkoutMinimized(false);
  }

  function handleNextWeek() {
    setWeekProgress(prev => ({ week: prev.week + 1, done: [] }));
  }

  function handlePrevWeek() {
    setWeekProgress(prev => ({ week: Math.max(1, prev.week - 1), done: [] }));
  }

  function handleUpdateWeight(id, val) {
    setWeights(prev => ({ ...prev, [id]: { w: val } }));
  }

  function handleDeleteSession(id) {
    setHistory(prev => prev.filter(h => h.id !== id));
  }

  // Permanently saves a mid-workout swap to the program plan.
  // slotIdx = position of the exercise in the day's exercise list.
  function handleSaveSwap(dayId, slotIdx, newEx) {
    setSavedSwaps(prev => ({
      ...prev,
      [`${dayId}:${slotIdx}`]: { id: newEx.id, name: newEx.name },
    }));
  }

  function handleStartFresh() {
    const keys = ['wapp_profile','wapp_history','wapp_weights','wapp_tab','wapp_tweaks','wapp_program_swaps','wapp_day_names','wapp_deletions','wapp_week_progress'];
    keys.forEach(k => localStorage.removeItem(k));
    setHistory([]);
    setWeights({ ...DEFAULT_WEIGHTS });
    setSavedSwaps({});
    setSavedDayNames({});
    setSavedDeletions({});
    setWeekProgress({ week: 1, done: [] });
    setTab('home');
    // onboarded is already false, so no change needed — just resets backing data
  }

  function handleOnboardingComplete(profile) {
    localStorage.setItem('wapp_profile', JSON.stringify(profile));
    if (profile.liftWeights) {
      setWeights(prev => {
        const next = { ...prev };
        Object.entries(profile.liftWeights).forEach(([id, w]) => { next[id] = { w }; });
        return next;
      });
    }
    setOnboarded(true);
  }

  if (!onboarded) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} onStartFresh={handleStartFresh} />;
  }

  const accent = tweaks.accentColor || '#478dff';
  function handleRenameDay(dayId, newName) {
    setSavedDayNames(prev => ({ ...prev, [dayId]: newName }));
  }

  // Marks an exercise slot as deleted from the program plan.
  // originalSlot = index in PROGRAM_DAYS (stable, unaffected by prior deletions).
  function handleDeleteExercise(dayId, originalSlot) {
    setSavedDeletions(prev => ({ ...prev, [`${dayId}:${originalSlot}`]: true }));
  }

  // PROGRAM_DAYS with saved exercise swaps + custom day names + deletions applied.
  // _originalSlot is attached before filtering so ProgramScreen can reference it.
  const effectiveDays = applyProgramSwaps(PROGRAM_DAYS, savedSwaps).map(day => ({
    ...day,
    name: savedDayNames[day.id] || day.name,
    exercises: day.exercises
      .map((ex, i) => ({ ...ex, _originalSlot: i }))
      .filter(ex => !savedDeletions[`${day.id}:${ex._originalSlot}`]),
  }));

  return (
    <>
      {activeWorkout && !workoutMinimized ? (
        <WorkoutScreen
          day={activeWorkout}
          weights={weights}
          onComplete={handleWorkoutComplete}
          onClose={() => setActiveWorkout(null)}
          onMinimize={() => setWorkoutMinimized(true)}
          onSaveSwap={handleSaveSwap}
          workoutStartTime={workoutStartTime.current}
        />
      ) : (
        <>
          {activeWorkout && workoutMinimized && (
            <WorkoutBanner
              day={activeWorkout}
              startTime={workoutStartTime.current}
              onResume={() => setWorkoutMinimized(false)}
            />
          )}
          <div className="screen-scroll">
            {tab === 'home'    && <HomeScreen    history={history} onStartWorkout={handleStartWorkout} weights={weights} programDays={effectiveDays} currentWeek={weekProgress.week} weekDone={weekProgress.done} />}
            {tab === 'program' && <ProgramScreen onStartWorkout={handleStartWorkout} history={history} programDays={effectiveDays} onEditSwap={handleSaveSwap} onRenameDay={handleRenameDay} onDeleteExercise={handleDeleteExercise} currentWeek={weekProgress.week} weekDone={weekProgress.done} onNextWeek={handleNextWeek} onPrevWeek={handlePrevWeek} />}
            {tab === 'history' && <HistoryScreen history={history} onDeleteSession={handleDeleteSession} />}
            {tab === 'profile' && <ProfileScreen weights={weights} onUpdateWeight={handleUpdateWeight} onResetOnboarding={() => { localStorage.removeItem('wapp_profile'); setOnboarded(false); }} />}
          </div>
          <NavBar tab={tab} setTab={setTab} workoutActive={false} />
        </>
      )}

      {/* Tweaks panel */}
      <div id="tweaks-panel" className={tweaksVisible ? 'visible' : ''}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Tweaks</p>
        <div className="tweak-row">
          <span className="tweak-label">Use kilograms</span>
          <button className="tweak-toggle" onClick={() => updateTweak('unit', tweaks.unit === 'kg' ? 'lb' : 'kg')}
            style={{ background: tweaks.unit === 'kg' ? accent : '#333' }}>
            <span style={{ left: tweaks.unit === 'kg' ? 21 : 3 }} />
          </button>
        </div>
        <div className="tweak-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
          <span className="tweak-label">Rest timer: {tweaks.restDuration}s</span>
          <input type="range" min={30} max={180} step={15} value={tweaks.restDuration}
            onChange={e => updateTweak('restDuration', Number(e.target.value))}
            style={{ width: '100%', accentColor: accent }} />
        </div>
        <div className="tweak-row">
          <span className="tweak-label">Accent</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {['#478dff','#f97316','#0891b2','#7c3aed'].map(c => (
              <button key={c} onClick={() => updateTweak('accentColor', c)}
                style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: tweaks.accentColor === c ? '2px solid #fff' : '2px solid transparent', outline: tweaks.accentColor === c ? `2px solid ${c}` : 'none', cursor: 'pointer' }} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
