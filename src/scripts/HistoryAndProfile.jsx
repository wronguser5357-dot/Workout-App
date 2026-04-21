// ============================================================
// HISTORY + PROFILE SCREENS
// ============================================================

// ---- SWIPEABLE SESSION ROW ----
function SwipeableSessionRow({ children, onDelete, isLast }) {
  const [offset, setOffset]   = useState(0);
  const [settled, setSettled] = useState(true);
  const startX    = useRef(null);
  const startY    = useRef(null);
  const startOff  = useRef(0);
  const dragging  = useRef(false);
  const direction = useRef(null);
  const DELETE_W  = 80;
  const THRESHOLD = 40;

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
      if (Math.abs(dx) > 4 || dy > 4) direction.current = Math.abs(dx) > dy ? 'h' : 'v';
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
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 14, marginBottom: 10 }}>
      {/* Delete button behind */}
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: DELETE_W, background: '#ef4444', borderRadius: '0 14px 14px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <button onClick={() => { setOffset(0); onDelete(); }}
          style={{ width: '100%', height: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
          </svg>
          <span style={{ fontSize: 10, color: '#fff', fontWeight: 700 }}>Delete</span>
        </button>
      </div>
      {/* Swipeable content */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ transform: `translateX(-${offset}px)`, transition: settled ? (offset === 0 ? snap : spring) : 'none' }}>
        {children}
      </div>
    </div>
  );
}

function HistoryScreen({ history, onDeleteSession }) {
  const [selectedLift, setSelectedLift] = useState('Deadlift');
  const [expandedSession, setExpandedSession] = useState(null);
  const liftNames = Object.keys(LIFT_HISTORY);

  const formatDate   = (ts) => new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const formatDayAgo = (ts) => {
    const days = Math.round((Date.now() - ts) / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };
  const formatTime = (ts) => new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Sessions</p>
        {history.length > 0 && <span style={{ fontSize: 11, color: '#9ca3af' }}>Swipe to delete</span>}
      </div>
      {history.length === 0 && (
        <div style={{ background: '#fff', borderRadius: 14, padding: '28px 20px', textAlign: 'center', border: '1px solid #f0f0f0' }}>
          <p style={{ fontSize: 14, color: '#9ca3af' }}>No sessions yet — complete a workout to see your history here.</p>
        </div>
      )}
      {[...history].reverse().map(session => {
        const color    = DAY_COLORS[session.dayId] || ACCENT;
        const isOpen   = expandedSession === session.id;
        return (
          <SwipeableSessionRow key={session.id} onDelete={() => onDeleteSession && onDeleteSession(session.id)}>
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
              {/* Header row — tap to expand */}
              <button onClick={() => setExpandedSession(isOpen ? null : session.id)}
                style={{ width: '100%', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color }}>{session.dayId}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{session.name}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>{session.sets} sets · {session.duration} min</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{formatDate(session.date)}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{formatDayAgo(session.date)}</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginLeft: 4 }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {/* Expanded summary */}
              {isOpen && (
                <div style={{ borderTop: `2px solid ${color}15`, padding: '14px 18px 18px', background: '#fafbfc' }}>
                  {/* Stats row */}
                  <div style={{ display: 'flex', gap: 10, marginBottom: session.topLifts && session.topLifts.length > 0 ? 14 : 0 }}>
                    {[
                      { label: 'Sets', value: session.sets },
                      { label: 'Duration', value: `${session.duration} min` },
                      { label: 'Time', value: formatTime(session.date) },
                    ].map(stat => (
                      <div key={stat.label} style={{ flex: 1, background: '#fff', borderRadius: 10, padding: '10px 8px', textAlign: 'center', border: '1px solid #f0f0f0' }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>{stat.value}</div>
                        <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 2 }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Top lifts */}
                  {session.topLifts && session.topLifts.length > 0 && (
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Top lifts</p>
                      {session.topLifts.map((lift, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: i < session.topLifts.length - 1 ? 8 : 0, marginBottom: i < session.topLifts.length - 1 ? 8 : 0, borderBottom: i < session.topLifts.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                          <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{lift.name}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color }}>
                            {lift.w > 0 ? `${lift.w} lb` : 'BW'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </SwipeableSessionRow>
        );
      })}
    </div>
  );
}

// ============================================================
// PROFILE SCREEN
// ============================================================

function ProfileScreen({ weights, onUpdateWeight, onResetOnboarding }) {
  const [editingField,  setEditingField]  = useState(null); // which profile field is open
  const [editingWeight, setEditingWeight] = useState(null); // which weight row is open
  const [weightVal,     setWeightVal]     = useState(0);

  // Live profile state — reads from localStorage, writes back on save
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wapp_profile')) || {}; } catch { return {}; }
  });

  function saveField(field, value) {
    const next = { ...profile, [field]: value };
    setProfile(next);
    localStorage.setItem('wapp_profile', JSON.stringify(next));
    setEditingField(null);
  }

  const name        = profile.name        || 'Connor';
  const experience  = profile.experience  || 'advanced';
  const goals       = profile.goals       || [];
  const daysPerWeek = profile.daysPerWeek || 4;
  const equipment   = profile.equipment   || 'commercial';
  const limitations = profile.limitations || '';
  const prefers     = profile.prefers     || '';

  const goalLabels  = { hypertrophy: 'Hypertrophy', strength: 'Strength', 'fat-loss': 'Fat loss', fitness: 'General fitness' };
  const equipLabels = { commercial: 'Commercial gym', 'home-full': 'Home gym (full)', 'home-basic': 'Basic home setup', bodyweight: 'Bodyweight only' };
  const expLabels   = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

  // ---- inline editors for each field type ----

  function GoalEditor() {
    const [draft, setDraft] = useState(goals);
    const toggle = g => setDraft(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
    return (
      <div style={{ marginTop: 10 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {Object.entries(goalLabels).map(([id, label]) => {
            const on = draft.includes(id);
            return (
              <button key={id} onClick={() => toggle(id)}
                style={{ padding: '7px 14px', borderRadius: 20, border: on ? 'none' : '1.5px solid #e8eaed', background: on ? ACCENT : '#f3f4f6', color: on ? '#fff' : '#6b7280', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                {label}
              </button>
            );
          })}
        </div>
        <button onClick={() => saveField('goals', draft)} disabled={draft.length === 0}
          style={{ padding: '8px 20px', borderRadius: 10, background: draft.length > 0 ? ACCENT : '#e8eaed', color: draft.length > 0 ? '#fff' : '#9ca3af', border: 'none', fontWeight: 700, fontSize: 13, cursor: draft.length > 0 ? 'pointer' : 'default', fontFamily: 'inherit' }}>
          Save
        </button>
      </div>
    );
  }

  function ScheduleEditor() {
    const [draft, setDraft] = useState(daysPerWeek);
    return (
      <div style={{ marginTop: 10 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          {[3,4,5].map(d => (
            <button key={d} onClick={() => setDraft(d)}
              style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: draft === d ? `2px solid ${ACCENT}` : '1.5px solid #e8eaed', background: draft === d ? '#eff6ff' : '#f9fafb', color: draft === d ? ACCENT : '#374151', fontWeight: 800, fontSize: 18, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
              {d}<span style={{ display: 'block', fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>days</span>
            </button>
          ))}
        </div>
        <button onClick={() => saveField('daysPerWeek', draft)}
          style={{ padding: '8px 20px', borderRadius: 10, background: ACCENT, color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          Save
        </button>
      </div>
    );
  }

  function EquipmentEditor() {
    const [draft, setDraft] = useState(equipment);
    return (
      <div style={{ marginTop: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {Object.entries(equipLabels).map(([id, label]) => (
            <button key={id} onClick={() => setDraft(id)}
              style={{ padding: '11px 14px', borderRadius: 12, border: draft === id ? `2px solid ${ACCENT}` : '1.5px solid #e8eaed', background: draft === id ? '#eff6ff' : '#f9fafb', color: draft === id ? ACCENT : '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s' }}>
              {label}
            </button>
          ))}
        </div>
        <button onClick={() => saveField('equipment', draft)}
          style={{ padding: '8px 20px', borderRadius: 10, background: ACCENT, color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          Save
        </button>
      </div>
    );
  }

  function ExperienceEditor() {
    const [draft, setDraft] = useState(experience);
    return (
      <div style={{ marginTop: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {Object.entries(expLabels).map(([id, label]) => (
            <button key={id} onClick={() => setDraft(id)}
              style={{ padding: '11px 14px', borderRadius: 12, border: draft === id ? `2px solid ${ACCENT}` : '1.5px solid #e8eaed', background: draft === id ? '#eff6ff' : '#f9fafb', color: draft === id ? ACCENT : '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s' }}>
              {label}
            </button>
          ))}
        </div>
        <button onClick={() => saveField('experience', draft)}
          style={{ padding: '8px 20px', borderRadius: 10, background: ACCENT, color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          Save
        </button>
      </div>
    );
  }

  function TextField({ field, current }) {
    const [draft, setDraft] = useState(current);
    return (
      <div style={{ marginTop: 10 }}>
        <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={3}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${ACCENT}`, background: '#fafafa', color: '#111827', fontSize: 13, fontFamily: 'inherit', resize: 'none', lineHeight: 1.5, outline: 'none', boxSizing: 'border-box' }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button onClick={() => saveField(field, draft)}
            style={{ padding: '8px 20px', borderRadius: 10, background: ACCENT, color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            Save
          </button>
          <button onClick={() => setEditingField(null)}
            style={{ padding: '8px 14px', borderRadius: 10, background: '#f3f4f6', color: '#6b7280', border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Profile rows config
  const profileRows = [
    {
      label: 'Goal',
      value: goals.length > 0 ? goals.map(g => goalLabels[g] || g).join(' + ') : 'Not set',
      field: 'goals',
      Editor: () => <GoalEditor />,
    },
    {
      label: 'Experience',
      value: expLabels[experience] || experience,
      field: 'experience',
      Editor: () => <ExperienceEditor />,
    },
    {
      label: 'Schedule',
      value: `${daysPerWeek} days/week`,
      field: 'daysPerWeek',
      Editor: () => <ScheduleEditor />,
    },
    {
      label: 'Equipment',
      value: equipLabels[equipment] || equipment,
      field: 'equipment',
      Editor: () => <EquipmentEditor />,
    },
    {
      label: 'Limitations',
      value: limitations || 'None',
      field: 'limitations',
      Editor: () => <TextField field="limitations" current={limitations} />,
    },
    {
      label: 'Prefers',
      value: prefers || 'Not set',
      field: 'prefers',
      Editor: () => <TextField field="prefers" current={prefers} />,
    },
  ];

  return (
    <div style={{ padding: '28px 20px 0' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4, color: '#111827' }}>{name}</h1>
      <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 24 }}>
        {expLabels[experience] || experience} · {daysPerWeek} days/week
        {goals.length > 0 ? ' · ' + goals.map(g => goalLabels[g] || g).join(' + ') : ''}
      </p>

      {/* Profile card — all fields tap-to-edit */}
      <div style={{ background: '#fff', borderRadius: 18, padding: '18px 20px', marginBottom: 14, border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Profile</p>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>Tap to edit</span>
        </div>
        {profileRows.map(({ label, value, field, Editor }, i) => {
          const isOpen = editingField === field;
          return (
            <div key={field} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: i < profileRows.length - 1 ? '1px solid #f9fafb' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#9ca3af' }}>{label}</span>
                <button onClick={() => setEditingField(isOpen ? null : field)}
                  style={{ background: 'none', border: 'none', color: '#111827', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right', maxWidth: '60%' }}>
                  {value}
                </button>
              </div>
              {isOpen && <Editor />}
            </div>
          );
        })}
      </div>

      {/* Working weights */}
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
              const isEditing = editingWeight === ex.id;
              return (
                <div key={ex.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, marginBottom: 10, borderBottom: i < arr.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                  <span style={{ fontSize: 13, color: '#374151' }}>{ex.name}</span>
                  {isEditing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="number" value={weightVal} onChange={e => setWeightVal(Number(e.target.value))}
                        style={{ width: 72, padding: '5px 8px', borderRadius: 8, background: '#f8f9fa', border: '1.5px solid #e8eaed', color: '#111827', fontSize: 14, fontFamily: 'inherit', textAlign: 'right' }} />
                      <button onClick={() => { onUpdateWeight(ex.id, weightVal); setEditingWeight(null); }}
                        style={{ padding: '5px 10px', borderRadius: 8, background: ACCENT, border: 'none', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>✓</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingWeight(ex.id); setWeightVal(w); }}
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

      <button onClick={onResetOnboarding} style={{ marginBottom: 24, padding: '10px 16px', borderRadius: 10, background: '#fff', border: '1.5px solid #e8eaed', color: '#6b7280', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
        ↩ Redo full setup
      </button>

      {/* Danger zone */}
      <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 24, marginBottom: 40 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>Danger zone</p>
        <DeleteAllButton onResetOnboarding={onResetOnboarding} />
      </div>
    </div>
  );
}

function DeleteAllButton({ onResetOnboarding }) {
  const [confirming, setConfirming] = useState(false);

  function handleDelete() {
    const keys = ['wapp_profile','wapp_history','wapp_weights','wapp_tab','wapp_tweaks','wapp_program_swaps','wapp_day_names'];
    keys.forEach(k => localStorage.removeItem(k));
    onResetOnboarding();
  }

  if (confirming) {
    return (
      <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 14, padding: '16px 18px' }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Delete everything?</p>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>This removes all history, weights, and settings. It cannot be undone.</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleDelete}
            style={{ flex: 1, padding: '11px', borderRadius: 10, background: '#ef4444', border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
            Yes, delete all data
          </button>
          <button onClick={() => setConfirming(false)}
            style={{ padding: '11px 18px', borderRadius: 10, background: '#fff', border: '1.5px solid #e8eaed', color: '#6b7280', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button onClick={() => setConfirming(true)}
      style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: 'transparent', border: '1.5px solid #fca5a5', color: '#ef4444', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
      🗑 Delete all data &amp; start fresh
    </button>
  );
}

Object.assign(window, { HistoryScreen, ProfileScreen });
