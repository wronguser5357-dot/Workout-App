// ============================================================
// HISTORY + PROFILE SCREENS
// ============================================================

function HistoryScreen({ history }) {
  const [selectedLift, setSelectedLift] = useState('Deadlift');
  const liftNames = Object.keys(LIFT_HISTORY);

  const formatDate   = (ts) => new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const formatDayAgo = (ts) => {
    const days = Math.round((Date.now() - ts) / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  const chartData = LIFT_HISTORY[selectedLift];
  const min = Math.min(...chartData) * 0.96;
  const max = Math.max(...chartData) * 1.02;
  const W = 300, H = 100;
  const pts = chartData.map((v, i) => [
    (i / (chartData.length - 1)) * W,
    H - ((v - min) / (max - min)) * H
  ]);
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
  const areaPath = `${linePath} L${W},${H} L0,${H} Z`;

  return (
    <div style={{ padding: '28px 20px 0' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: '#111827' }}>History</h1>

      {/* Lift chart */}
      <div style={{ background: '#fff', borderRadius: 18, padding: '18px 20px', marginBottom: 16, border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>Lift progress</p>
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 2 }}>
          {liftNames.map(name => (
            <button key={name} onClick={() => setSelectedLift(name)} style={{ whiteSpace: 'nowrap', padding: '6px 12px', borderRadius: 8, border: 'none', background: selectedLift === name ? ACCENT : '#f3f4f6', color: selectedLift === name ? '#fff' : '#6b7280', fontWeight: 600, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer' }}>
              {name}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 36, fontWeight: 800, color: '#111827' }}>{chartData[chartData.length - 1]}</span>
          <span style={{ fontSize: 14, color: '#9ca3af' }}>lb</span>
          <span style={{ fontSize: 13, color: '#478dff', fontWeight: 700, background: '#eff6ff', padding: '2px 8px', borderRadius: 6 }}>
            +{chartData[chartData.length - 1] - chartData[0]} over 8 wks
          </span>
        </div>

        <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ height: 100, display: 'block' }}>
          <defs>
            <linearGradient id="histGradLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ACCENT} stopOpacity="0.15"/>
              <stop offset="100%" stopColor={ACCENT} stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#histGradLight)"/>
          <path d={linePath} fill="none" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          {pts.map(([x,y], i) => <circle key={i} cx={x} cy={y} r="3.5" fill={ACCENT}/>)}
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          {chartData.map((_, i) => <span key={i} style={{ fontSize: 10, color: '#d1d5db' }}>W{i+1}</span>)}
        </div>
      </div>

      {/* Session list */}
      <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>Sessions</p>
      {[...history].reverse().map(session => {
        const color = DAY_COLORS[session.dayId] || ACCENT;
        return (
          <div key={session.id} style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14, border: '1px solid #f0f0f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color }}>{session.dayId}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{session.name}</div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>{session.sets} sets · {session.duration} min</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{formatDate(session.date)}</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>{formatDayAgo(session.date)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// PROFILE SCREEN
// ============================================================

function ProfileScreen({ weights, onUpdateWeight, onResetOnboarding }) {
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState(0);

  const profile = (() => {
    try { return JSON.parse(localStorage.getItem('wapp_profile')) || {}; } catch { return {}; }
  })();

  const name       = profile.name       || 'Connor';
  const experience = profile.experience || 'Advanced';
  const daysPerWeek = profile.daysPerWeek || 4;
  const goals      = profile.goals       || [];
  const equipment  = profile.equipment   || 'Commercial gym';
  const limitations = profile.limitations || 'Avoids back squats (spinal load)';

  const goalLabels = { hypertrophy: 'Hypertrophy', strength: 'Strength', 'fat-loss': 'Fat loss', fitness: 'General fitness' };

  return (
    <div style={{ padding: '28px 20px 0' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4, color: '#111827' }}>{name}</h1>
      <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 24 }}>
        {experience.charAt(0).toUpperCase() + experience.slice(1)} · {daysPerWeek} days/week
        {goals.length > 0 ? ' · ' + goals.map(g => goalLabels[g] || g).join(' + ') : ''}
      </p>

      <button onClick={onResetOnboarding} style={{ marginBottom: 16, padding: '10px 16px', borderRadius: 10, background: '#fff', border: '1.5px solid #e8eaed', color: '#6b7280', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
        ↩ Redo setup
      </button>

      <div style={{ background: '#fff', borderRadius: 18, padding: '18px 20px', marginBottom: 14, border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>Profile</p>
        {[
          { label: 'Goal',        value: goals.length > 0 ? goals.map(g => goalLabels[g] || g).join(' + ') : 'General fitness' },
          { label: 'Schedule',    value: `${daysPerWeek} days/week` },
          { label: 'Equipment',   value: equipment === 'commercial' ? 'Commercial gym' : equipment },
          { label: 'Limitations', value: limitations || 'None' },
        ].map((r, i, arr) => (
          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, marginBottom: 12, borderBottom: i < arr.length - 1 ? '1px solid #f9fafb' : 'none' }}>
            <span style={{ fontSize: 13, color: '#9ca3af' }}>{r.label}</span>
            <span style={{ fontSize: 13, color: '#111827', fontWeight: 500, textAlign: 'right', maxWidth: '58%' }}>{r.value}</span>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 18, padding: '18px 20px', marginBottom: 14, border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Working weights</p>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>Tap to edit</span>
        </div>
        {PROGRAM_DAYS.map(day => (
          <div key={day.id} style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 11, color: DAY_COLORS[day.id], fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{day.name}</p>
            {day.exercises.map((ex, i, arr) => {
              const w         = weights[ex.id]?.w ?? 0;
              const isEditing = editing === ex.id;
              return (
                <div key={ex.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, marginBottom: 10, borderBottom: i < arr.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                  <span style={{ fontSize: 13, color: '#374151' }}>{ex.name}</span>
                  {isEditing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="number" value={editVal} onChange={e => setEditVal(Number(e.target.value))}
                        style={{ width: 72, padding: '5px 8px', borderRadius: 8, background: '#f8f9fa', border: '1.5px solid #e8eaed', color: '#111827', fontSize: 14, fontFamily: 'inherit', textAlign: 'right' }} />
                      <button onClick={() => { onUpdateWeight(ex.id, editVal); setEditing(null); }}
                        style={{ padding: '5px 10px', borderRadius: 8, background: ACCENT, border: 'none', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>✓</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditing(ex.id); setEditVal(w); }}
                      style={{ background: 'none', border: 'none', color: w === 0 ? '#9ca3af' : '#111827', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {w === 0 ? 'BW' : `${w} lb`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { HistoryScreen, ProfileScreen });
