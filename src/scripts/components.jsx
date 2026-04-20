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
    <nav style={{ height: 72, borderTop: '1px solid #e8eaed', display: 'flex', background: '#ffffff', flexShrink: 0, position: 'relative', zIndex: 10 }}>
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

function WeekDots({ history }) {
  const dayIds = ['A','B','C','D'];
  const oneWeekAgo = Date.now() - 7 * 86400000;
  const recentIds = history.filter(h => h.date > oneWeekAgo).map(h => h.dayId);
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
function SwapSheet({ exercise, onSwap, onClose, color }) {
  const [custom, setCustom] = useState('');
  const group      = SWAP_GROUPS[exercise.id];
  const candidates = (SWAP_CANDIDATES[group] || []).filter(c => c.id !== exercise.id);
  const trimmed    = custom.trim();

  function handleCustomSwap() {
    if (!trimmed) return;
    onSwap({ id: 'custom-' + trimmed.toLowerCase().replace(/\s+/g, '-'), name: trimmed });
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 50 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderRadius: '20px 20px 0 0', zIndex: 51, maxHeight: '70%', display: 'flex', flexDirection: 'column', boxShadow: '0 -8px 40px rgba(0,0,0,0.12)' }}>

        {/* Header */}
        <div style={{ padding: '12px 20px 0', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#e8eaed', margin: '0 auto 16px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>Swap exercise</h3>
              <p style={{ fontSize: 12, color: '#9ca3af' }}>Replacing: <span style={{ color: '#374151', fontWeight: 600 }}>{exercise.name}</span></p>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', background: '#f3f4f6', border: 'none', color: '#6b7280', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>

          {/* Custom write-in */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <input
              type="text"
              placeholder="Type a custom exercise…"
              value={custom}
              onChange={e => setCustom(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCustomSwap()}
              style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${trimmed ? color : '#e8eaed'}`, background: '#fafafa', color: '#111827', fontSize: 14, fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.15s' }}
            />
            <button
              onClick={handleCustomSwap}
              disabled={!trimmed}
              style={{ padding: '10px 16px', borderRadius: 10, background: trimmed ? color : '#f3f4f6', border: 'none', color: trimmed ? '#fff' : '#9ca3af', fontWeight: 700, fontSize: 13, fontFamily: 'inherit', cursor: trimmed ? 'pointer' : 'default', transition: 'all 0.15s', flexShrink: 0 }}>
              Use
            </button>
          </div>

          {candidates.length > 0 && (
            <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Suggestions</p>
          )}
        </div>

        {/* Candidates list */}
        <div style={{ overflowY: 'auto', padding: '0 20px 32px' }}>
          {candidates.length === 0
            ? <p style={{ fontSize: 14, color: '#9ca3af', textAlign: 'center', padding: '16px 0' }}>No suggestions — use the box above to enter any exercise.</p>
            : candidates.map(c => (
              <button key={c.id} onClick={() => onSwap(c)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 12, background: '#f8f9fa', border: '1.5px solid #f0f0f0', marginBottom: 8, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{c.name}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            ))
          }
        </div>
      </div>
    </>
  );
}

Object.assign(window, { NavBar, WeekDots, MiniChart, RPEPills, NumStepper, SwapSheet });
