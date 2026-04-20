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
    </div>
  );
}

Object.assign(window, { HistoryScreen, ProfileScreen });
