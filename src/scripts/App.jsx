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
  const [savedAdditions, setSavedAdditions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wapp_additions') || '{}'); }
    catch { return {}; }
  });
  // Just the week number — "done this week" is DERIVED from history via session.week tag
  const [currentWeek, setCurrentWeek] = useState(() => {
    try { return parseInt(localStorage.getItem('wapp_week') || '1', 10); }
    catch { return 1; }
  });
  const [tweaksVisible, setTweaksVisible] = useState(false);
  const [workoutMinimized, setWorkoutMinimized] = useState(false);
  const [activePrevLog, setActivePrevLog] = useState({});
  const [pendingStartDay, setPendingStartDay] = useState(null);
  const [undoToast, setUndoToast] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  // Detect an orphaned workout from a previous session (crash/OS kill)
  const [workoutRecovery, setWorkoutRecovery] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem('wapp_active_workout') || 'null');
      return s?.day ? s : null;
    } catch { return null; }
  });
  const workoutStartTime = useRef(null);
  const workoutInstanceId = useRef(null);

  useEffect(() => { localStorage.setItem('wapp_tab', tab); }, [tab]);
  useEffect(() => { localStorage.setItem('wapp_history', JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem('wapp_weights', JSON.stringify(weights)); }, [weights]);
  useEffect(() => { localStorage.setItem('wapp_program_swaps', JSON.stringify(savedSwaps)); }, [savedSwaps]);
  useEffect(() => { localStorage.setItem('wapp_day_names', JSON.stringify(savedDayNames)); }, [savedDayNames]);
  useEffect(() => { localStorage.setItem('wapp_deletions', JSON.stringify(savedDeletions)); }, [savedDeletions]);
  useEffect(() => { localStorage.setItem('wapp_additions', JSON.stringify(savedAdditions)); }, [savedAdditions]);
  useEffect(() => { localStorage.setItem('wapp_week', String(currentWeek)); }, [currentWeek]);

  // Derive weekDone from history — sessions tagged with currentWeek, deduplicated
  const weekDone = [...new Set(history.filter(h => h.week === currentWeek).map(h => h.dayId))];

  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === '__activate_edit_mode')   setTweaksVisible(true);
      if (e.data?.type === '__deactivate_edit_mode') setTweaksVisible(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    let refreshing = false;
    navigator.serviceWorker.getRegistration().then(reg => {
      if (!reg) return;
      if (reg.waiting) setUpdateAvailable(true);
      reg.addEventListener('updatefound', () => {
        const worker = reg.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            setUpdateAvailable(true);
          }
        });
      });
    });
    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      setUpdateAvailable(true);
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    return () => navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
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

  function makeWorkoutInstanceId(dayId) {
    return `${dayId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function showUndo(message, onUndo) {
    const id = Date.now();
    setUndoToast({ id, message, onUndo });
    setTimeout(() => {
      setUndoToast(cur => cur?.id === id ? null : cur);
    }, 4500);
  }

  function resetAllAppData() {
    WAPP_STORAGE_KEYS.forEach(k => localStorage.removeItem(k));
    setHistory([]);
    setWeights({ ...DEFAULT_WEIGHTS });
    setSavedSwaps({});
    setSavedDayNames({});
    setSavedDeletions({});
    setSavedAdditions({});
    setCurrentWeek(1);
    setActiveWorkout(null);
    setWorkoutMinimized(false);
    setWorkoutRecovery(null);
    workoutStartTime.current = null;
    workoutInstanceId.current = null;
    setTab('home');
  }

  function buildPrevLog(dayId) {
    const lastSession = [...history].reverse().find(h => h.dayId === dayId && h.exerciseLog);
    const log = {};
    if (lastSession?.exerciseLog) {
      lastSession.exerciseLog.forEach(e => { log[e.id] = e.sets; });
    }
    return log;
  }

  function buildPrBaselines() {
    const baselines = {};
    history.forEach(session => {
      (session.exerciseLog || []).forEach(ex => {
        if (!ex.sets?.length) return;
        const top = Math.max(...ex.sets.map(s => Number(s.weight) || 0));
        baselines[ex.id] = Math.max(baselines[ex.id] || 0, top);
        baselines[ex.name] = Math.max(baselines[ex.name] || 0, top);
      });
      (session.topLifts || []).forEach(lift => {
        baselines[lift.name] = Math.max(baselines[lift.name] || 0, Number(lift.w) || 0);
      });
    });
    return baselines;
  }

  function startWorkoutNow(day) {
    workoutStartTime.current = Date.now();
    workoutInstanceId.current = makeWorkoutInstanceId(day.id);
    setWorkoutMinimized(false);
    setActivePrevLog(buildPrevLog(day.id));
    setActiveWorkout(day);
  }

  function handleStartWorkout(day) {
    if (activeWorkout) {
      setPendingStartDay(day);
      return;
    }
    startWorkoutNow(day);
  }

  function handleRecoverWorkout() {
    const day = workoutRecovery.day;
    workoutStartTime.current = workoutRecovery.startTime;
    workoutInstanceId.current = workoutRecovery.instanceId || makeWorkoutInstanceId(day.id);
    if (!workoutRecovery.instanceId) {
      const upgraded = { ...workoutRecovery, instanceId: workoutInstanceId.current };
      localStorage.setItem('wapp_active_workout', JSON.stringify(upgraded));
    }
    setActivePrevLog(buildPrevLog(day.id));
    setWorkoutMinimized(false);
    setActiveWorkout(day);
    setWorkoutRecovery(null);
  }

  function handleDiscardRecovery() {
    localStorage.removeItem('wapp_active_workout');
    setWorkoutRecovery(null);
  }

  function handleWorkoutComplete(result) {
    // Tag the session with the current training week
    const newEntry = {
      id: 'h' + Date.now(),
      dayId: result.dayId, name: result.name, date: result.date,
      sets: result.sets, duration: result.duration || 55, topLifts: result.topLifts || [],
      exerciseLog: result.exerciseLog || [],
      week: currentWeek,
    };
    setHistory(prev => [...prev, newEntry]);

    if (result.weightUpdates) {
      setWeights(prev => {
        const next = { ...prev };
        Object.entries(result.weightUpdates).forEach(([id, { w }]) => { next[id] = { w }; });
        return next;
      });
    }

    // Auto-advance week if all 4 days are now done (check against existing history + new entry)
    const doneThisWeek = [...new Set(
      [...history, newEntry].filter(h => h.week === currentWeek).map(h => h.dayId)
    )];
    if (['A','B','C','D'].every(id => doneThisWeek.includes(id))) {
      setCurrentWeek(w => w + 1);
    }

    setActiveWorkout(null);
    setWorkoutMinimized(false);
    workoutStartTime.current = null;
    workoutInstanceId.current = null;
  }

  function handleNextWeek() { setCurrentWeek(w => w + 1); }
  function handlePrevWeek() { setCurrentWeek(w => Math.max(1, w - 1)); }

  function handleUpdateWeight(id, val) {
    setWeights(prev => ({ ...prev, [id]: { w: val } }));
  }

  function handleDeleteSession(id) {
    const deleted = history.find(h => h.id === id);
    setHistory(prev => prev.filter(h => h.id !== id));
    if (deleted) {
      showUndo('Session deleted', () => {
        setHistory(prev => [...prev, deleted].sort((a, b) => a.date - b.date));
      });
    }
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
    resetAllAppData();
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
    const addedMatch = String(originalSlot).match(/^add:(\d+)$/);
    if (addedMatch) {
      const idx = Number(addedMatch[1]);
      const deleted = savedAdditions[dayId]?.[idx];
      setSavedAdditions(prev => ({
        ...prev,
        [dayId]: (prev[dayId] || []).filter((_, i) => i !== idx),
      }));
      if (deleted) {
        showUndo('Exercise deleted', () => {
          setSavedAdditions(prev => {
            const list = [...(prev[dayId] || [])];
            list.splice(idx, 0, deleted);
            return { ...prev, [dayId]: list };
          });
        });
      }
      return;
    }

    const key = `${dayId}:${originalSlot}`;
    setSavedDeletions(prev => ({ ...prev, [key]: true }));
    showUndo('Exercise deleted', () => {
      setSavedDeletions(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    });
  }

  function handleAddExercise(dayId, newEx) {
    const ex = {
      id: newEx.id,
      name: newEx.name,
      sets: newEx.sets || 3,
      repRange: newEx.repRange || '10–12',
      rpe: newEx.rpe || 7,
    };
    setSavedAdditions(prev => ({
      ...prev,
      [dayId]: [...(prev[dayId] || []), ex],
    }));
  }

  function handleCloseWorkout() {
    setActiveWorkout(null);
    setWorkoutMinimized(false);
    workoutStartTime.current = null;
    workoutInstanceId.current = null;
  }

  // PROGRAM_DAYS with saved exercise swaps + custom day names + deletions applied.
  // _originalSlot is attached before filtering so ProgramScreen can reference it.
  const effectiveDays = applyProgramSwaps(PROGRAM_DAYS, savedSwaps).map(day => ({
    ...day,
    name: savedDayNames[day.id] || day.name,
    exercises: [
      ...day.exercises
        .map((ex, i) => ({ ...ex, _originalSlot: i }))
        .filter(ex => !savedDeletions[`${day.id}:${ex._originalSlot}`]),
      ...(savedAdditions[day.id] || []).map((ex, i) => ({ ...ex, _originalSlot: `add:${i}`, _added: true })),
    ],
  }));

  return (
    <>
      {activeWorkout && !workoutMinimized ? (
        <WorkoutScreen
          day={activeWorkout}
          weights={weights}
          onComplete={handleWorkoutComplete}
          onClose={handleCloseWorkout}
          onMinimize={() => setWorkoutMinimized(true)}
          onSaveSwap={handleSaveSwap}
          workoutStartTime={workoutStartTime.current}
          workoutInstanceId={workoutInstanceId.current}
          prevLog={activePrevLog}
          prBaselines={buildPrBaselines()}
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
            {tab === 'home'    && <HomeScreen    history={history} onStartWorkout={handleStartWorkout} weights={weights} programDays={effectiveDays} currentWeek={currentWeek} weekDone={weekDone} />}
            {tab === 'program' && <ProgramScreen onStartWorkout={handleStartWorkout} history={history} programDays={effectiveDays} onEditSwap={handleSaveSwap} onRenameDay={handleRenameDay} onDeleteExercise={handleDeleteExercise} onAddExercise={handleAddExercise} currentWeek={currentWeek} weekDone={weekDone} onNextWeek={handleNextWeek} onPrevWeek={handlePrevWeek} />}
            {tab === 'history' && <HistoryScreen history={history} onDeleteSession={handleDeleteSession} />}
            {tab === 'profile' && <ProfileScreen weights={weights} onUpdateWeight={handleUpdateWeight} onResetOnboarding={() => { localStorage.removeItem('wapp_profile'); setOnboarded(false); }} onDeleteAll={() => { resetAllAppData(); setOnboarded(false); }} />}
          </div>
          <NavBar tab={tab} setTab={setTab} workoutActive={false} />
        </>
      )}

      {/* Workout recovery modal — shown when app was force-closed mid-workout */}
      {workoutRecovery && !activeWorkout && (() => {
        const mins = Math.round((Date.now() - workoutRecovery.startTime) / 60000);
        const timeAgo = mins < 60 ? `${mins} min ago` : `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
        const dayColor = DAY_COLORS[workoutRecovery.day?.id] || ACCENT;
        return (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
            <div style={{ background: '#fff', borderRadius: 22, padding: '28px 24px', width: '100%', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: dayColor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Unfinished workout</p>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 6 }}>{workoutRecovery.day?.name}</h3>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>Started {timeAgo} — your sets are still saved.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleRecoverWorkout}
                  style={{ flex: 1, padding: '13px', borderRadius: 12, background: dayColor, border: 'none', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Resume
                </button>
                <button onClick={handleDiscardRecovery}
                  style={{ padding: '13px 18px', borderRadius: 12, background: '#f3f4f6', border: 'none', color: '#6b7280', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Discard
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Guard against accidentally replacing a minimised workout */}
      {pendingStartDay && activeWorkout && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 310, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
          <div style={{ background: '#fff', borderRadius: 22, padding: '24px', width: '100%', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Workout already active</p>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 6 }}>{activeWorkout.name}</h3>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 22 }}>Resume your current workout, or discard it and start {pendingStartDay.name}.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => { setPendingStartDay(null); setWorkoutMinimized(false); }}
                style={{ width: '100%', padding: '13px', borderRadius: 12, background: DAY_COLORS[activeWorkout.id] || ACCENT, border: 'none', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>
                Resume current workout
              </button>
              <button onClick={() => {
                  localStorage.removeItem('wapp_active_workout');
                  const nextDay = pendingStartDay;
                  setPendingStartDay(null);
                  setActiveWorkout(null);
                  startWorkoutNow(nextDay);
                }}
                style={{ width: '100%', padding: '13px', borderRadius: 12, background: '#fef2f2', border: '1.5px solid #fca5a5', color: '#ef4444', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                Discard and start new
              </button>
              <button onClick={() => setPendingStartDay(null)}
                style={{ width: '100%', padding: '11px', borderRadius: 12, background: '#f3f4f6', border: 'none', color: '#6b7280', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {updateAvailable && (
        <div style={{ position: 'absolute', left: 16, right: 16, top: 12, zIndex: 330 }}>
          <button onClick={() => window.location.reload()}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, background: '#111827', color: '#fff', border: 'none', borderRadius: 14, padding: '12px 14px', boxShadow: '0 12px 34px rgba(0,0,0,0.22)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Update ready</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.76)' }}>Tap to refresh</span>
          </button>
        </div>
      )}

      {/* Undo toast */}
      {undoToast && (
        <div style={{ position: 'absolute', left: 16, right: 16, bottom: 88, zIndex: 320 }}>
          <div style={{ background: '#111827', color: '#fff', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 12px 34px rgba(0,0,0,0.22)' }}>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{undoToast.message}</span>
            <button onClick={() => { const fn = undoToast.onUndo; setUndoToast(null); fn && fn(); }}
              style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', borderRadius: 9, padding: '7px 12px', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
              Undo
            </button>
          </div>
        </div>
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
