// ============================================================
// SHARED UI COMPONENTS
// ============================================================
const { useState, useEffect, useRef } = React;

function NavBar({ tab, setTab, workoutActive }) {
  if (workoutActive) return null;
  const tabs = [
    { id: 'home',    label: 'Home',    icon: (a) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg> },
    { id: 'program', label: 'Program', icon: (a) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg> },
    { id: 'history', label: 'History', icon: (a) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:1.8} strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
    { id: 'profile', label: 'Profile', icon: (a) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> },
  ];
  return (
    <nav style={{ height: 'calc(72px + env(safe-area-inset-bottom))', paddingBottom: 'env(safe-area-inset-bottom)', borderTop: '1px solid #e8eaed', display: 'flex', background: '#ffffff', flexShrink: 0, position: 'relative', zIndex: 10 }}>
      {tabs.map(t => {
        const active = tab === t.id;
        return (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: active ? ACCENT : '#9ca3af', fontFamily: 'inherit', fontSize: 10, fontWeight: 600, letterSpacing: '0.04em', transition: 'color 0.15s' }}>
            <span style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.icon(active)}</span>
            {t.label.toUpperCase()}
          </button>
        );
      })}
    </nav>
  );
}

function WeekDots({ history, weekDone = [] }) {
  const dayIds = ['A','B','C','D'];
  // weekDone is authoritative — never fall back to calendar history
  const recentIds = weekDone;
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {dayIds.map(id => {
        const done = recentIds.includes(id);
        const day = PROGRAM_DAYS.find(d => d.id === id);
        const color = DAY_COLORS[id];
        return (
          <div key={id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: done ? color : '#f3f4f6', border: done ? 'none' : '1.5px solid #e8eaed', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
              {done
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                : <span style={{ fontSize: 13, fontWeight: 700, color: '#9ca3af' }}>{id}</span>
              }
            </div>
            <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>{day.shortDay}</span>
          </div>
        );
      })}
    </div>
  );
}

function MiniChart({ data, color = ACCENT }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data) * 0.97;
  const max = Math.max(...data) * 1.01;
  const W = 120, H = 40;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / (max - min)) * H;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <path d={`M${pts.split(' ').join(' L')}`} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function RPEPills({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[6,7,8,9,10].map(r => {
        const active = value === r;
        return (
          <button key={r} onClick={() => onChange(r)} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: active ? 'none' : '1.5px solid #e8eaed', background: active ? ACCENT : '#fff', color: active ? '#fff' : '#6b7280', fontWeight: 700, fontSize: 14, fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s' }}>
            {r}
          </button>
        );
      })}
    </div>
  );
}

function NumStepper({ value, onChange, step = 2.5, min = 0, label, unit = 'lb', big = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => onChange(Math.max(min, value - step))} style={{ width: 44, height: 44, borderRadius: 12, background: '#f3f4f6', border: '1.5px solid #e8eaed', color: '#374151', fontSize: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>−</button>
        <div style={{ minWidth: 90, textAlign: 'center' }}>
          <span style={{ fontSize: big ? 52 : 40, fontWeight: 700, lineHeight: 1, color: '#111827' }}>{value}</span>
          <span style={{ fontSize: 14, color: '#9ca3af', marginLeft: 4 }}>{unit}</span>
        </div>
        <button onClick={() => onChange(value + step)} style={{ width: 44, height: 44, borderRadius: 12, background: '#f3f4f6', border: '1.5px solid #e8eaed', color: '#374151', fontSize: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>+</button>
      </div>
    </div>
  );
}

// ---- SWAP SHEET (shared by WorkoutScreen + ProgramScreen) ----
function SwapSheet({ exercise, onSwap, onClose, color, title = 'Swap exercise', contextLabel = 'Replacing', excludeCurrent = true }) {
  const [custom, setCustom] = useState('');
  const [savedCustom, setSavedCustom] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wapp_custom_exercises') || '[]'); }
    catch { return []; }
  });
  const group   = SWAP_GROUPS[exercise.id];
  const groupMeta = SWAP_CATEGORY_META[group];
  const query   = custom.trim().toLowerCase();
  const trimmed = custom.trim();

  function withCategory(item, category = SWAP_GROUPS[item.id] || group) {
    return {
      ...item,
      category,
      categoryLabel: SWAP_CATEGORY_META[category]?.label || 'Exercise',
      categoryShort: SWAP_CATEGORY_META[category]?.shortLabel || 'Exercise',
    };
  }

  function uniqueById(list) {
    const seen = new Set();
    return list.filter(item => {
      const key = item.id || item.name;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  const fallbackCandidates = uniqueById(Object.entries(SWAP_CANDIDATES).flatMap(([cat, list]) => list.map(item => withCategory(item, cat))));
  const candidates = uniqueById(group ? (SWAP_CANDIDATES[group] || []).map(item => withCategory(item, group)) : fallbackCandidates)
    .filter(c => !excludeCurrent || c.id !== exercise.id)
    .filter(c => !query || c.name.toLowerCase().includes(query))
    .slice(0, query ? 8 : 10);
  const customMatches = savedCustom
    .filter(c => !excludeCurrent || c.id !== exercise.id)
    .filter(c => query || !group || !c.category || c.category === group)
    .filter(c => !query || c.name.toLowerCase().includes(query))
    .map(c => withCategory(c, c.category || group))
    .slice()
    .sort((a, b) => (b.lastUsedAt || b.createdAt || 0) - (a.lastUsedAt || a.createdAt || 0))
    .slice(0, 8);

  function persistCustomExercise(ex) {
    if (!ex.name || !ex.id.startsWith('custom-')) return ex;
    const now = Date.now();
    const existing = savedCustom.find(item => item.id === ex.id);
    const saved = {
      ...ex,
      category: ex.category || group || 'custom',
      categoryLabel: SWAP_CATEGORY_META[ex.category || group]?.label || 'Custom',
      createdAt: existing?.createdAt || ex.createdAt || now,
      lastUsedAt: now,
      uses: (existing?.uses || 0) + 1,
    };
    const next = [
      saved,
      ...savedCustom.filter(item => item.id !== ex.id),
    ].slice(0, 60);
    localStorage.setItem('wapp_custom_exercises', JSON.stringify(next));
    setSavedCustom(next);
    return saved;
  }

  function handlePick(ex) {
    const picked = ex.id.startsWith('custom-')
      ? persistCustomExercise(ex)
      : ex;
    onSwap({ id: picked.id, name: picked.name, category: picked.category });
  }

  function handleCustomSwap() {
    if (!trimmed) return;
    const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || Date.now().toString(36);
    handlePick(withCategory({ id: 'custom-' + slug, name: trimmed }, group));
  }

  function ExerciseOption({ item, source }) {
    return (
      <button key={item.id} onClick={() => handlePick(item)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderRadius: 14, background: '#fff', border: '1.5px solid #eef1f4', marginBottom: 8, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', boxShadow: '0 1px 2px rgba(17,24,39,0.03)' }}>
        <span style={{ width: 32, height: 32, borderRadius: 10, background: source === 'custom' ? '#f5f3ff' : color + '14', color: source === 'custom' ? '#7c3aed' : color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {source === 'custom' ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5h11M6.5 17.5h11M3 12h18"/></svg>
          )}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 15, fontWeight: 700, color: '#111827' }}>{item.name}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 7px', borderRadius: 999, background: source === 'custom' ? '#f5f3ff' : '#f8fafc', color: source === 'custom' ? '#7c3aed' : '#64748b', fontSize: 10, fontWeight: 800, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
              {item.categoryShort}
            </span>
            {source === 'custom' && item.createdAt && (
              <span style={{ fontSize: 11, color: '#9ca3af' }}>Added {new Date(item.createdAt).toLocaleDateString()}</span>
            )}
          </span>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </button>
    );
  }

  return (
    <>
      <div onClick={onClose} className="swap-sheet-overlay" />
      <div className="swap-sheet-panel">

        {/* Header */}
        <div style={{ padding: '12px 18px 0', flexShrink: 0, background: 'linear-gradient(180deg, #ffffff 0%, #fbfcfd 100%)' }}>
          <div style={{ width: 42, height: 5, borderRadius: 999, background: '#e5e7eb', margin: '0 auto 16px' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ width: 28, height: 28, borderRadius: 9, background: color + '16', color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10M7 17h10M4 12h16"/></svg>
                </span>
                <h3 style={{ fontSize: 18, fontWeight: 850, color: '#111827' }}>{title}</h3>
              </div>
              {contextLabel && <p style={{ fontSize: 12, color: '#9ca3af' }}>{contextLabel}: <span style={{ color: '#374151', fontWeight: 700 }}>{exercise.name}</span></p>}
              {groupMeta && (
                <p style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '5px 9px', borderRadius: 999, background: color + '12', color, fontSize: 11, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  {groupMeta.label}
                </p>
              )}
            </div>
            <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: '50%', background: '#f3f4f6', border: 'none', color: '#6b7280', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
          </div>

          {/* Custom write-in */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              type="text"
              placeholder="Search or type a custom exercise..."
              value={custom}
              onChange={e => setCustom(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCustomSwap()}
              style={{ flex: 1, padding: '12px 14px', borderRadius: 14, border: `1.5px solid ${trimmed ? color : '#e8eaed'}`, background: '#fff', color: '#111827', fontSize: 14, fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.15s', boxShadow: trimmed ? `0 0 0 3px ${color}14` : 'none' }}
            />
            <button
              onClick={handleCustomSwap}
              disabled={!trimmed}
              style={{ padding: '10px 16px', borderRadius: 14, background: trimmed ? color : '#f3f4f6', border: 'none', color: trimmed ? '#fff' : '#9ca3af', fontWeight: 800, fontSize: 13, fontFamily: 'inherit', cursor: trimmed ? 'pointer' : 'default', transition: 'all 0.15s', flexShrink: 0 }}>
              Use
            </button>
          </div>
        </div>

        {/* Candidates list */}
        <div className="swap-sheet-list">
          {customMatches.length > 0 && (
            <>
              <p style={{ fontSize: 11, fontWeight: 800, color: '#7c3aed', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '6px 0 10px' }}>{groupMeta ? `Your custom ${groupMeta.shortLabel.toLowerCase()} list` : 'Your custom list'}</p>
              {customMatches.map(c => <ExerciseOption key={c.id} item={c} source="custom" />)}
            </>
          )}

          {candidates.length > 0 && (
            <>
              <p style={{ fontSize: 11, fontWeight: 800, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', margin: customMatches.length ? '18px 0 10px' : '6px 0 10px' }}>{groupMeta ? `Suggested ${groupMeta.shortLabel.toLowerCase()} exercises` : 'Suggested exercises'}</p>
              {candidates.map(c => <ExerciseOption key={c.id} item={c} source="suggested" />)}
            </>
          )}

          {customMatches.length === 0 && candidates.length === 0 && (
            <div style={{ background: '#f8fafc', border: '1.5px dashed #dbe2ea', borderRadius: 16, padding: '18px', textAlign: 'center', marginTop: 8 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 4 }}>No matches yet</p>
              <p style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.4 }}>Tap Use to save this as a custom exercise for next time.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ---- WORKOUT BANNER (minimised workout persistent bar) ----
function WorkoutBanner({ day, startTime, onResume }) {
  const [elapsed, setElapsed] = useState(Math.floor((Date.now() - startTime) / 1000));
  const color = DAY_COLORS[day.id];

  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [startTime]);

  const mm = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const ss = (elapsed % 60).toString().padStart(2, '0');

  return (
    <button onClick={onResume}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', background: color, border: 'none', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, textAlign: 'left', paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}>
      {/* Pulsing dot */}
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', flexShrink: 0, animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{day.name}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>Workout in progress — tap to return</div>
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em' }}>{mm}:{ss}</div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
  );
}

Object.assign(window, { NavBar, WeekDots, MiniChart, RPEPills, NumStepper, SwapSheet, WorkoutBanner });
