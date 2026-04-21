// ============================================================
// ACTIVE WORKOUT SCREEN
// ============================================================

function WorkoutScreen({ day, weights, onComplete, onClose, onMinimize, onSaveSwap, workoutStartTime }) {
  const color = DAY_COLORS[day.id];

  const initSets = () => day.exercises.map(ex => {
    const w = weights[ex.id]?.w ?? 0;
    return Array.from({ length: ex.sets }, () => ({
      weight: w, reps: parseInt(String(ex.repRange).split('–')[0]) || 10,
      rpe: ex.rpe, logged: false
    }));
  });

  const [sessionExercises, setSessionExercises] = useState(day.exercises);
  const [swappedIds, setSwappedIds]             = useState({}); // { [ei]: origExercise }
  const [savedToPlans, setSavedToPlans]         = useState({}); // { [ei]: true } after saving
  const [sets, setSets]                         = useState(initSets);
  const [swappingExIdx, setSwappingExIdx]       = useState(null);
  const [restTimer, setRestTimer]               = useState(null);
  const [phase, setPhase]                       = useState('working');
  const [editingCell, setEditingCell]           = useState(null);
  const [cancelConfirm, setCancelConfirm]       = useState(false);
  // Use the start time passed from App so minimize/resume doesn't break it
  const startRef = useRef(workoutStartTime || Date.now());
  const [elapsed, setElapsed] = useState(Math.floor((Date.now() - startRef.current) / 1000));

  // Tick the elapsed timer every second while working
  useEffect(() => {
    if (phase !== 'working') return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (!restTimer || restTimer.secs <= 0) return;
    const t = setTimeout(() => setRestTimer(r => r ? { ...r, secs: r.secs - 1 } : null), 1000);
    return () => clearTimeout(t);
  }, [restTimer]);

  function formatElapsed(secs) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  const loggedCount = sets.flat().filter(s => s.logged).length;
  const totalSets   = sets.flat().length;

  function updateSet(ei, si, field, value) {
    setSets(prev => {
      const next = prev.map(e => e.map(s => ({ ...s })));
      next[ei][si][field] = value;
      return next;
    });
  }

  function logSet(ei, si) {
    const wasLogged = sets[ei][si].logged;
    setSets(prev => {
      const next = prev.map(e => e.map(s => ({ ...s })));
      next[ei][si].logged = !wasLogged;
      return next;
    });
    setEditingCell(null);
    // Only start rest timer when checking, not unchecking
    if (!wasLogged) setRestTimer({ secs: 90, total: 90 });
  }

  function addSet(ei) {
    const lastSet = sets[ei][sets[ei].length - 1];
    setSets(prev => {
      const next = prev.map(e => e.map(s => ({ ...s })));
      next[ei] = [...next[ei], { weight: lastSet.weight, reps: lastSet.reps, rpe: lastSet.rpe, logged: false }];
      return next;
    });
    setSessionExercises(prev => prev.map((ex, i) => i === ei ? { ...ex, sets: ex.sets + 1 } : ex));
  }

  function deleteSet(ei, si) {
    if (sets[ei].length <= 1) return; // keep at least 1 set
    setSets(prev => {
      const next = prev.map(e => e.map(s => ({ ...s })));
      next[ei] = next[ei].filter((_, i) => i !== si);
      return next;
    });
    setSessionExercises(prev => prev.map((ex, i) => i === ei ? { ...ex, sets: ex.sets - 1 } : ex));
  }

  function handleSwap(newEx) {
    const origEx = sessionExercises[swappingExIdx];
    setSessionExercises(prev => prev.map((ex, i) =>
      i === swappingExIdx ? { ...newEx, sets: ex.sets, repRange: ex.repRange, rpe: ex.rpe } : ex
    ));
    setSwappedIds(prev => ({ ...prev, [swappingExIdx]: origEx })); // store full origEx for save
    setSets(prev => {
      const next = prev.map(e => e.map(s => ({ ...s })));
      const w = weights[newEx.id]?.w ?? DEFAULT_WEIGHTS[newEx.id]?.w ?? 0;
      next[swappingExIdx] = Array.from({ length: origEx.sets }, () => ({
        weight: w, reps: parseInt(String(origEx.repRange).split('–')[0]) || 10,
        rpe: origEx.rpe, logged: false
      }));
      return next;
    });
    setSwappingExIdx(null);
  }

  function finishWorkout() {
    const updates = {};
    sessionExercises.forEach((ex, ei) => {
      const logged = sets[ei].filter(s => s.logged);
      if (logged.length > 0) {
        const topRep = parseInt(String(ex.repRange).split('–')[1] || ex.repRange);
        const hitTop = logged.every(s => s.reps >= topRep && s.rpe <= ex.rpe);
        const isUpper = ['B','C'].includes(day.id);
        updates[ex.id] = { w: logged[0].weight + (hitTop ? (isUpper ? 2.5 : 5) : 0) };
      }
    });
    onComplete({
      dayId: day.id, name: day.name, date: Date.now(),
      sets: loggedCount, topLifts: [], weightUpdates: updates,
      duration: Math.round((Date.now() - startRef.current) / 60000)
    });
  }

  // ---- COMPLETE SCREEN ----
  if (phase === 'complete') {
    const duration = Math.round((Date.now() - startRef.current) / 60000);
    const suggestions = sessionExercises.map((ex, ei) => {
      const logged = sets[ei].filter(s => s.logged);
      if (!logged.length) return null;
      const topRep  = parseInt(String(ex.repRange).split('–')[1] || ex.repRange);
      const hitTop  = logged.every(s => s.reps >= topRep && s.rpe <= ex.rpe);
      const isUpper = ['B','C'].includes(day.id);
      if (hitTop) return { name: ex.name, from: logged[0].weight, to: logged[0].weight + (isUpper ? 2.5 : 5) };
      return null;
    }).filter(Boolean);

    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f0f2f5', overflowY: 'auto', padding: '40px 20px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 68, height: 68, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111827', marginBottom: 4 }}>Session done</h2>
          <p style={{ color: '#6b7280', fontSize: 14 }}>{day.name} · {duration || 1} min · {loggedCount} sets</p>
        </div>

        {suggestions.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', marginBottom: 14, border: '1px solid #f0f0f0' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>Weight increases earned</p>
            {suggestions.map(s => (
              <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 14, color: '#374151' }}>{s.name}</span>
                <span style={{ fontSize: 14, fontWeight: 700 }}><span style={{ color: '#9ca3af' }}>{s.from} lb</span> → <span style={{ color: ACCENT }}>{s.to} lb</span></span>
              </div>
            ))}
          </div>
        )}

        <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', marginBottom: 24, border: '1px solid #f0f0f0' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>Session log</p>
          {sessionExercises.map((ex, ei) => {
            const logged = sets[ei].filter(s => s.logged);
            if (!logged.length) return null;
            return (
              <div key={ex.id + ei} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>{ex.name}</span>
                  {swappedIds[ei] && <span style={{ fontSize: 10, color: '#f97316', fontWeight: 700, background: '#fff7ed', padding: '1px 6px', borderRadius: 4 }}>SUB</span>}
                </div>
                {logged.map((s, si) => (
                  <div key={si} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#9ca3af', paddingLeft: 10, marginBottom: 2 }}>
                    <span>Set {si+1}</span>
                    <span style={{ color: '#374151' }}>{s.weight > 0 ? `${s.weight} lb × ` : ''}{s.reps} reps <span style={{ color: '#9ca3af' }}>@ {s.rpe}</span></span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <button onClick={finishWorkout} style={{ width: '100%', padding: '16px', borderRadius: 14, background: color, color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, fontFamily: 'inherit', cursor: 'pointer' }}>Save session</button>
      </div>
    );
  }

  // ---- WORKING SCREEN ----
  const restPct = restTimer ? restTimer.secs / restTimer.total : 0;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f0f2f5', position: 'relative', overflow: 'hidden' }}>

      {/* Top bar */}
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderBottom: '1px solid #f0f0f0', flexShrink: 0, zIndex: 10 }}>
        <button onClick={onMinimize || onClose} title="Minimise workout"
          style={{ width: 32, height: 32, borderRadius: '50%', background: '#f3f4f6', border: 'none', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{day.name}</div>
          <div style={{ height: 3, background: '#f3f4f6', borderRadius: 2, overflow: 'hidden', marginTop: 4 }}>
            <div style={{ height: '100%', width: `${(loggedCount / totalSets) * 100}%`, background: color, borderRadius: 2, transition: 'width 0.3s' }} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#111827', letterSpacing: '0.02em', fontVariantNumeric: 'tabular-nums' }}>{formatElapsed(elapsed)}</span>
          <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>{loggedCount}/{totalSets} sets</span>
        </div>
        <button onClick={() => setPhase('complete')}
          style={{ padding: '6px 14px', borderRadius: 8, background: color, border: 'none', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
          Finish
        </button>
      </div>

      {/* Floating rest timer */}
      {restTimer && restTimer.secs > 0 && (
        <div style={{ position: 'absolute', top: 62, left: 20, right: 20, zIndex: 20 }}>
          <div style={{ background: '#111827', borderRadius: 14, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="36" height="36" viewBox="0 0 36 36" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                <circle cx="18" cy="18" r="15" fill="none" stroke="#333" strokeWidth="3"/>
                <circle cx="18" cy="18" r="15" fill="none" stroke={color} strokeWidth="3"
                  strokeDasharray={`${2 * Math.PI * 15}`}
                  strokeDashoffset={`${2 * Math.PI * 15 * (1 - restPct)}`}
                  strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }}/>
              </svg>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', zIndex: 1 }}>{restTimer.secs}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Rest</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>Take a breath — next set coming up</div>
            </div>
            <button onClick={() => setRestTimer(null)}
              style={{ padding: '6px 12px', borderRadius: 8, background: '#1e293b', border: 'none', color: '#9ca3af', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Skip
            </button>
          </div>
        </div>
      )}

      {/* Exercise list */}
      <div className="screen-scroll" style={{ paddingTop: restTimer && restTimer.secs > 0 ? 80 : 16, paddingBottom: 40, transition: 'padding-top 0.3s' }}>
        {sessionExercises.map((ex, ei) => {
          const exSets   = sets[ei] || [];
          const allLogged = exSets.length > 0 && exSets.every(s => s.logged);
          return (
            <ExerciseCard
              key={ex.id + ei}
              ex={ex} ei={ei} exSets={exSets} allLogged={allLogged}
              swapped={swappedIds[ei]} color={color}
              editingCell={editingCell} setEditingCell={setEditingCell}
              onUpdateSet={updateSet} onLogSet={logSet} onAddSet={addSet}
              onSwap={() => setSwappingExIdx(ei)}
              onDeleteSet={(si) => deleteSet(ei, si)}
              savedToPlan={!!savedToPlans[ei]}
              onSaveToPlan={() => {
                setSavedToPlans(prev => ({ ...prev, [ei]: true }));
                onSaveSwap && onSaveSwap(day.id, ei, sessionExercises[ei]);
              }}
            />
          );
        })}

        {/* Cancel workout */}
        <div style={{ padding: '4px 16px 8px' }}>
          {cancelConfirm ? (
            <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 14, padding: '14px 16px' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Cancel this workout?</p>
              <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>Your progress won't be saved.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={onClose}
                  style={{ flex: 1, padding: '10px', borderRadius: 10, background: '#ef4444', border: 'none', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Yes, cancel workout
                </button>
                <button onClick={() => setCancelConfirm(false)}
                  style={{ padding: '10px 16px', borderRadius: 10, background: '#fff', border: '1.5px solid #e8eaed', color: '#6b7280', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Keep going
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setCancelConfirm(true)}
              style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'transparent', border: '1.5px solid #fca5a5', color: '#ef4444', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Cancel workout
            </button>
          )}
        </div>
      </div>

      {/* Swap sheet */}
      {swappingExIdx !== null && (
        <SwapSheet
          exercise={sessionExercises[swappingExIdx]}
          onSwap={handleSwap}
          onClose={() => setSwappingExIdx(null)}
          color={color}
        />
      )}
    </div>
  );
}

// ---- SWIPEABLE SET ROW ----
function SwipeableSetRow({ children, onDelete, isLast }) {
  const [offset, setOffset]   = useState(0);
  const [settled, setSettled] = useState(true); // false while finger is down
  const startX    = useRef(null);
  const startY    = useRef(null);
  const startOff  = useRef(0);
  const dragging  = useRef(false);
  const direction = useRef(null);
  const DELETE_W  = 72;
  const THRESHOLD = 36;

  function onTouchStart(e) {
    startX.current    = e.touches[0].clientX;
    startY.current    = e.touches[0].clientY;
    startOff.current  = offset;
    dragging.current  = true;
    direction.current = null;
    setSettled(false);
  }

  function onTouchMove(e) {
    if (!dragging.current) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = Math.abs(e.touches[0].clientY - startY.current);
    if (direction.current === null) {
      if (Math.abs(dx) > 4 || dy > 4)
        direction.current = Math.abs(dx) > dy ? 'h' : 'v';
      return;
    }
    if (direction.current === 'v') return;
    e.preventDefault();
    setOffset(Math.max(0, Math.min(DELETE_W, startOff.current - dx)));
  }

  function onTouchEnd() {
    dragging.current = false;
    setSettled(true);
    setOffset(prev => prev > THRESHOLD ? DELETE_W : 0);
  }

  const spring = 'transform 0.65s cubic-bezier(0.34, 2.4, 0.64, 1)';
  const snap   = 'transform 0.5s cubic-bezier(0.34, 1.5, 0.64, 1)';

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderBottom: isLast ? 'none' : '1px solid #f8f9fa', transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}>
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: DELETE_W, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <button onClick={() => { setOffset(0); onDelete(); }}
          style={{ width: '100%', height: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
          </svg>
        </button>
      </div>
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ transform: `translateX(-${offset}px)`, transition: settled ? (offset === 0 ? snap : spring) : 'none', background: 'inherit' }}>
        {children}
      </div>
    </div>
  );
}

// ---- EXERCISE CARD ----
function ExerciseCard({ ex, ei, exSets, allLogged, swapped, color, editingCell, setEditingCell, onUpdateSet, onLogSet, onAddSet, onSwap, onDeleteSet, savedToPlan, onSaveToPlan }) {
  return (
    <div style={{ background: '#fff', borderRadius: 18, margin: '0 16px 14px', border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden', opacity: allLogged ? 0.7 : 1, transition: 'opacity 0.2s' }}>
      {/* Header */}
      <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #f8f9fa' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {allLogged && (
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              )}
              <h3 style={{ fontSize: 16, fontWeight: 700, color: allLogged ? '#9ca3af' : '#111827', lineHeight: 1.2 }}>{ex.name}</h3>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 3, alignItems: 'center' }}>
              {swapped && <span style={{ fontSize: 10, color: '#f97316', fontWeight: 700, background: '#fff7ed', padding: '2px 6px', borderRadius: 4 }}>SUB</span>}
              <span style={{ fontSize: 12, color: '#9ca3af' }}>{ex.sets} sets · {ex.repRange} reps · RPE {ex.rpe}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '28px 80px 1fr 64px 64px 36px', gap: 0, padding: '8px 18px', background: '#fafafa', borderBottom: '1px solid #f3f4f6' }}>
        {['Set','Previous','Target','lb','Reps',''].map((h, i) => (
          <span key={i} style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: i >= 3 ? 'center' : 'left' }}>{h}</span>
        ))}
      </div>

      {/* Set rows */}
      {exSets.map((s, si) => {
        const isLogged   = s.logged;
        const isEditingW = editingCell?.ei === ei && editingCell?.si === si && editingCell?.field === 'weight';
        const isEditingR = editingCell?.ei === ei && editingCell?.si === si && editingCell?.field === 'reps';
        const prevSet    = si > 0 ? exSets[si - 1] : null;
        const prevText   = prevSet ? `${prevSet.weight > 0 ? prevSet.weight + ' × ' : ''}${prevSet.reps}` : '—';

        return (
          <SwipeableSetRow key={si} isLast={si === exSets.length - 1} onDelete={() => onDeleteSet(si)}>
          <div style={{ display: 'grid', gridTemplateColumns: '28px 80px 1fr 64px 64px 36px', gap: 0, padding: '11px 18px', background: isLogged ? color + '08' : '#fff', alignItems: 'center', transition: 'background 0.2s' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: isLogged ? color : '#9ca3af' }}>{si + 1}</span>
            <span style={{ fontSize: 13, color: '#9ca3af' }}>{prevText}</span>
            <span style={{ fontSize: 13, color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.repRange}</span>

            {/* Weight */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {isEditingW ? (
                <input autoFocus type="number" value={s.weight}
                  onChange={e => onUpdateSet(ei, si, 'weight', Number(e.target.value))}
                  onBlur={() => setEditingCell(null)}
                  style={{ width: 60, padding: '6px 4px', borderRadius: 8, border: `2px solid ${color}`, background: '#fff', color: '#111827', fontSize: 15, fontWeight: 700, fontFamily: 'inherit', textAlign: 'center', outline: 'none' }} />
              ) : (
                <button onClick={() => !isLogged && setEditingCell({ ei, si, field: 'weight' })}
                  style={{ width: 60, padding: '6px 4px', borderRadius: 8, background: isLogged ? 'transparent' : '#f3f4f6', border: isLogged ? 'none' : '1px solid #e8eaed', color: isLogged ? color : '#111827', fontSize: 15, fontWeight: 700, fontFamily: 'inherit', cursor: isLogged ? 'default' : 'pointer', textAlign: 'center' }}>
                  {s.weight === 0 ? 'BW' : s.weight}
                </button>
              )}
            </div>

            {/* Reps */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {isEditingR ? (
                <input autoFocus type="number" value={s.reps}
                  onChange={e => onUpdateSet(ei, si, 'reps', Number(e.target.value))}
                  onBlur={() => setEditingCell(null)}
                  style={{ width: 60, padding: '6px 4px', borderRadius: 8, border: `2px solid ${color}`, background: '#fff', color: '#111827', fontSize: 15, fontWeight: 700, fontFamily: 'inherit', textAlign: 'center', outline: 'none' }} />
              ) : (
                <button onClick={() => !isLogged && setEditingCell({ ei, si, field: 'reps' })}
                  style={{ width: 60, padding: '6px 4px', borderRadius: 8, background: isLogged ? 'transparent' : '#f3f4f6', border: isLogged ? 'none' : '1px solid #e8eaed', color: isLogged ? color : '#111827', fontSize: 15, fontWeight: 700, fontFamily: 'inherit', cursor: isLogged ? 'default' : 'pointer', textAlign: 'center' }}>
                  {s.reps}
                </button>
              )}
            </div>

            {/* Check */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button onClick={() => onLogSet(ei, si)}
                style={{ width: 32, height: 32, borderRadius: '50%', background: isLogged ? color : '#f3f4f6', border: isLogged ? 'none' : '1.5px solid #e8eaed', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={isLogged ? '#fff' : '#9ca3af'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </button>
            </div>
          </div>
          </SwipeableSetRow>
        );
      })}

      {/* Footer */}
      <div style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 20, borderTop: '1px solid #f3f4f6' }}>
        <button onClick={() => onAddSet(ei)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Set
        </button>
        <button onClick={onSwap}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6b7280', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
            <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
          </svg>
          Swap
        </button>

        {/* Save to plan — only visible after a swap */}
        {swapped && (
          savedToPlan ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: color }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Saved to plan
            </span>
          ) : (
            <button onClick={onSaveToPlan}
              style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', color: '#6b7280', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
              </svg>
              Save to plan
            </button>
          )
        )}
      </div>
    </div>
  );
}

Object.assign(window, { WorkoutScreen });
