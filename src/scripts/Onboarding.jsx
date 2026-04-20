// ============================================================
// ONBOARDING FLOW
// ============================================================

const EXERCISE_LIBRARY = [
  {
    group: 'Lower — Quad',
    exercises: [
      { id: 'leg-press',       name: 'Leg Press' },
      { id: 'bulgarian-split', name: 'Bulgarian Split Squat' },
      { id: 'hack-squat',      name: 'Hack Squat (machine)' },
      { id: 'goblet-squat',    name: 'Goblet Squat' },
      { id: 'lunges',          name: 'DB Lunges' },
      { id: 'step-ups',        name: 'Step Ups' },
      { id: 'leg-extension',   name: 'Leg Extension' },
      { id: 'back-squat',      name: 'Barbell Back Squat' },
    ]
  },
  {
    group: 'Lower — Posterior',
    exercises: [
      { id: 'deadlift',        name: 'Conventional Deadlift' },
      { id: 'rdl',             name: 'Romanian Deadlift' },
      { id: 'hip-thrust',      name: 'Machine Hip Thrust' },
      { id: 'leg-curl',        name: 'Seated Leg Curl' },
      { id: 'nordic',          name: 'Nordic Curl' },
      { id: 'good-morning',    name: 'Good Morning' },
    ]
  },
  {
    group: 'Push — Horizontal',
    exercises: [
      { id: 'machine-chest',   name: 'Machine Chest Press' },
      { id: 'db-bench',        name: 'DB Bench Press' },
      { id: 'incline-db',      name: 'Incline DB Press' },
      { id: 'cable-fly',       name: 'Cable Fly' },
      { id: 'pec-dec',         name: 'Pec Dec (machine)' },
      { id: 'barbell-bench',   name: 'Barbell Bench Press' },
    ]
  },
  {
    group: 'Push — Vertical',
    exercises: [
      { id: 'barbell-ohp',     name: 'Barbell OHP' },
      { id: 'seated-press',    name: 'Seated Machine Press' },
      { id: 'db-lateral',      name: 'Lateral Raise (DB)' },
      { id: 'cable-lateral',   name: 'Lateral Raise (cable)' },
      { id: 'face-pull',       name: 'Face Pull' },
      { id: 'rear-delt-fly',   name: 'Rear Delt Fly' },
    ]
  },
  {
    group: 'Pull — Horizontal',
    exercises: [
      { id: 'barbell-row',     name: 'Barbell Bent Over Row' },
      { id: 'db-row',          name: 'DB Row' },
      { id: 'cable-row',       name: 'Seated Cable Row' },
      { id: 'machine-row',     name: 'Machine Row' },
      { id: 'chest-row',       name: 'Chest Supported Row' },
    ]
  },
  {
    group: 'Pull — Vertical',
    exercises: [
      { id: 'pullup',          name: 'Pull Up' },
      { id: 'chinup',          name: 'Chin Up' },
      { id: 'lat-pulldown',    name: 'Lat Pulldown (bar)' },
      { id: 'neutral-pull',    name: 'Lat Pulldown (neutral)' },
      { id: 'str-pulldown',    name: 'Straight Arm Pulldown' },
    ]
  },
  {
    group: 'Arms',
    exercises: [
      { id: 'barbell-curl',    name: 'Barbell Curl' },
      { id: 'hammer-curl',     name: 'Hammer Curl' },
      { id: 'incline-db-curl', name: 'Incline DB Curl' },
      { id: 'tricep-pushdown', name: 'Tricep Pushdown' },
      { id: 'oh-tricep',       name: 'OH Tricep Extension' },
      { id: 'dips',            name: 'Dips (tricep)' },
    ]
  },
];

const KEY_LIFTS = [
  { id: 'leg-press',     name: 'Leg Press',             default: 180, step: 10 },
  { id: 'deadlift',      name: 'Conventional Deadlift', default: 135, step: 5 },
  { id: 'machine-chest', name: 'Machine Chest Press',   default: 90,  step: 5 },
  { id: 'barbell-row',   name: 'Barbell Row',           default: 95,  step: 5 },
  { id: 'barbell-ohp',   name: 'Barbell OHP',           default: 65,  step: 5 },
  { id: 'pullup',        name: 'Pull Ups',              default: 0,   step: 1, unit: 'reps' },
];

const STEPS = ['welcome','profile','goal','schedule','equipment','limitations','exercises','weights','done'];

function OnboardingFlow({ onComplete, onStartFresh }) {
  const [step, setStep] = useState(0);

  const [name, setName] = useState('');
  const [experience, setExperience] = useState('');
  const [goals, setGoals] = useState([]);
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [equipment, setEquipment] = useState('');
  const [limitations, setLimitations] = useState('');
  const [exStatus, setExStatus] = useState(() => {
    const s = {};
    EXERCISE_LIBRARY.forEach(g => g.exercises.forEach(e => { s[e.id] = 'YES'; }));
    return s;
  });
  const [liftWeights, setLiftWeights] = useState(() => {
    const w = {};
    KEY_LIFTS.forEach(l => { w[l.id] = l.default; });
    return w;
  });

  const total = STEPS.length;
  const progress = step / (total - 1);

  function goNext() { if (step < total - 1) setStep(s => s + 1); }
  function goBack() { if (step > 0) setStep(s => s - 1); }

  function toggleGoal(g) {
    setGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  }

  function cycleEx(id) {
    setExStatus(prev => {
      const cur = prev[id];
      const next = cur === 'YES' ? 'SUB' : cur === 'SUB' ? 'NO' : 'YES';
      return { ...prev, [id]: next };
    });
  }

  function handleComplete() {
    const profile = { name: name || 'Athlete', experience, goals, daysPerWeek, equipment, limitations, exStatus, liftWeights };
    onComplete(profile);
  }

  const canProceed = () => {
    if (STEPS[step] === 'profile') return name.trim().length > 0 && experience;
    if (STEPS[step] === 'goal') return goals.length > 0;
    if (STEPS[step] === 'equipment') return equipment;
    return true;
  };

  const stepName = STEPS[step];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f0f2f5', overflow: 'hidden' }}>
      {stepName !== 'welcome' && stepName !== 'done' && (
        <div style={{ padding: '16px 24px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <button onClick={goBack} style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff', border: '1px solid #e8eaed', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div style={{ flex: 1, height: 3, background: '#e8eaed', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress * 100}%`, background: ACCENT, borderRadius: 2, transition: 'width 0.35s ease' }} />
            </div>
            <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>{step}/{total - 1}</span>
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: stepName === 'welcome' || stepName === 'done' ? 0 : '20px 24px 0' }}
           className="screen-scroll">
        {stepName === 'welcome'     && <StepWelcome onStart={goNext} onStartFresh={onStartFresh} />}
        {stepName === 'profile'     && <StepProfile name={name} setName={setName} experience={experience} setExperience={setExperience} />}
        {stepName === 'goal'        && <StepGoal goals={goals} toggleGoal={toggleGoal} />}
        {stepName === 'schedule'    && <StepSchedule daysPerWeek={daysPerWeek} setDaysPerWeek={setDaysPerWeek} />}
        {stepName === 'equipment'   && <StepEquipment equipment={equipment} setEquipment={setEquipment} />}
        {stepName === 'limitations' && <StepLimitations limitations={limitations} setLimitations={setLimitations} />}
        {stepName === 'exercises'   && <StepExercises exStatus={exStatus} cycleEx={cycleEx} />}
        {stepName === 'weights'     && <StepWeights liftWeights={liftWeights} setLiftWeights={setLiftWeights} />}
        {stepName === 'done'        && <StepDone name={name} goals={goals} daysPerWeek={daysPerWeek} onComplete={handleComplete} />}
      </div>

      {!['welcome','done','exercises'].includes(stepName) && (
        <div style={{ padding: '16px 24px 32px', flexShrink: 0, background: '#f0f2f5' }}>
          <button onClick={canProceed() ? goNext : undefined}
            style={{ width: '100%', padding: '16px', borderRadius: 14, background: canProceed() ? ACCENT : '#e8eaed', color: canProceed() ? '#fff' : '#9ca3af', border: 'none', fontWeight: 700, fontSize: 16, fontFamily: 'inherit', cursor: canProceed() ? 'pointer' : 'default', transition: 'all 0.2s' }}>
            Continue
          </button>
        </div>
      )}
      {stepName === 'exercises' && (
        <div style={{ padding: '16px 24px 32px', flexShrink: 0, background: '#f0f2f5' }}>
          <button onClick={goNext} style={{ width: '100%', padding: '16px', borderRadius: 14, background: ACCENT, color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, fontFamily: 'inherit', cursor: 'pointer' }}>
            Done — looks good
          </button>
        </div>
      )}
    </div>
  );
}

function StepWelcome({ onStart, onStartFresh }) {
  const hasExistingData = !!(
    localStorage.getItem('wapp_history') ||
    localStorage.getItem('wapp_weights') ||
    localStorage.getItem('wapp_tweaks')
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100%', padding: '0 0 32px' }}>
      <div style={{ background: ACCENT, padding: '60px 32px 48px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.5 6.5h11M6.5 17.5h11M3 12h18M3 6.5a1 1 0 010-2h2a1 1 0 010 2M3 17.5a1 1 0 010-2h2a1 1 0 010 2M19 6.5a1 1 0 010-2h2a1 1 0 010 2M19 17.5a1 1 0 010-2h2a1 1 0 010 2"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 34, fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: 12 }}>Your personal<br/>program, built<br/>around you.</h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>Tell us your equipment, goals, and what you can do. We'll build a smart program with automatic progression.</p>
      </div>

      <div style={{ padding: '32px 24px 0', flex: 1 }}>
        {[
          { icon: '⚡', text: 'Built around your available exercises' },
          { icon: '📈', text: 'Automatic weight progression week to week' },
          { icon: '🔁', text: 'Swap any exercise mid-session' },
        ].map(f => (
          <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <span style={{ fontSize: 20 }}>{f.icon}</span>
            <span style={{ fontSize: 15, color: '#374151', fontWeight: 500 }}>{f.text}</span>
          </div>
        ))}

        <button onClick={onStart} style={{ width: '100%', padding: '18px', borderRadius: 16, background: ACCENT, color: '#fff', border: 'none', fontWeight: 700, fontSize: 17, fontFamily: 'inherit', cursor: 'pointer', marginTop: 16 }}>
          Continue Setup →
        </button>

        {hasExistingData && (
          <button onClick={onStartFresh}
            style={{ width: '100%', padding: '16px', borderRadius: 16, background: 'transparent', border: '1.5px solid #e8eaed', color: '#6b7280', fontWeight: 600, fontSize: 15, fontFamily: 'inherit', cursor: 'pointer', marginTop: 12 }}>
            Start Fresh — clear all data
          </button>
        )}

        <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 12 }}>Takes about 3 minutes</p>
      </div>
    </div>
  );
}

function StepProfile({ name, setName, experience, setExperience }) {
  return (
    <div>
      <h2 style={onboardH2}>About you</h2>
      <p style={onboardSub}>We'll use this to calibrate your program intensity.</p>

      <label style={labelStyle}>Your name</label>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Alex" style={inputStyle} />

      <label style={{ ...labelStyle, marginTop: 24 }}>Training experience</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
        {[
          { id: 'beginner',     label: 'Beginner',     sub: 'Under 1 year of consistent training' },
          { id: 'intermediate', label: 'Intermediate', sub: '1–3 years, know the basics well' },
          { id: 'advanced',     label: 'Advanced',     sub: '3+ years, strong technique on compounds' },
        ].map(opt => {
          const active = experience === opt.id;
          return (
            <button key={opt.id} onClick={() => setExperience(opt.id)}
              style={{ padding: '14px 16px', borderRadius: 14, border: active ? `2px solid ${ACCENT}` : '1.5px solid #e8eaed', background: active ? '#eff6ff' : '#fff', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: active ? ACCENT : '#111827' }}>{opt.label}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{opt.sub}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepGoal({ goals, toggleGoal }) {
  const opts = [
    { id: 'hypertrophy', label: 'Build muscle',    sub: 'Maximise size and definition' },
    { id: 'strength',    label: 'Get stronger',    sub: 'Progress on key compound lifts' },
    { id: 'fat-loss',    label: 'Lose fat',         sub: 'Retain muscle while cutting' },
    { id: 'fitness',     label: 'General fitness', sub: 'Health, energy, and longevity' },
  ];
  return (
    <div>
      <h2 style={onboardH2}>What's your goal?</h2>
      <p style={onboardSub}>Pick one or more — your program will be weighted accordingly.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
        {opts.map(opt => {
          const active = goals.includes(opt.id);
          return (
            <button key={opt.id} onClick={() => toggleGoal(opt.id)}
              style={{ padding: '14px 16px', borderRadius: 14, border: active ? `2px solid ${ACCENT}` : '1.5px solid #e8eaed', background: active ? '#eff6ff' : '#fff', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.15s' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: active ? ACCENT : '#111827' }}>{opt.label}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{opt.sub}</div>
              </div>
              {active && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepSchedule({ daysPerWeek, setDaysPerWeek }) {
  const splits = {
    3: '3-day full body or push/pull/legs',
    4: '4-day upper/lower split',
    5: '5-day PPL + upper/lower',
  };
  return (
    <div>
      <h2 style={onboardH2}>Training schedule</h2>
      <p style={onboardSub}>How many days per week can you train consistently?</p>
      <div style={{ display: 'flex', gap: 12, marginTop: 16, marginBottom: 20 }}>
        {[3,4,5].map(d => {
          const active = daysPerWeek === d;
          return (
            <button key={d} onClick={() => setDaysPerWeek(d)}
              style={{ flex: 1, padding: '20px 0', borderRadius: 16, border: active ? `2px solid ${ACCENT}` : '1.5px solid #e8eaed', background: active ? '#eff6ff' : '#fff', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: active ? ACCENT : '#111827' }}>{d}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>days</div>
            </button>
          );
        })}
      </div>
      <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid #f0f0f0' }}>
        <p style={{ fontSize: 13, color: '#6b7280' }}><span style={{ fontWeight: 600, color: '#374151' }}>Recommended split: </span>{splits[daysPerWeek]}</p>
      </div>
    </div>
  );
}

function StepEquipment({ equipment, setEquipment }) {
  const opts = [
    { id: 'commercial', label: 'Commercial gym',   sub: 'Full range — barbells, cables, machines, DBs', icon: '🏋️' },
    { id: 'home-full',  label: 'Home gym',         sub: 'Barbell, rack, and dumbbells', icon: '🏠' },
    { id: 'home-basic', label: 'Basic home setup', sub: 'Dumbbells and/or resistance bands', icon: '💪' },
    { id: 'bodyweight', label: 'Bodyweight only',  sub: 'No equipment — floor and pull-up bar', icon: '🤸' },
  ];
  return (
    <div>
      <h2 style={onboardH2}>Your equipment</h2>
      <p style={onboardSub}>This determines which exercises are available to you.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
        {opts.map(opt => {
          const active = equipment === opt.id;
          return (
            <button key={opt.id} onClick={() => setEquipment(opt.id)}
              style={{ padding: '14px 16px', borderRadius: 14, border: active ? `2px solid ${ACCENT}` : '1.5px solid #e8eaed', background: active ? '#eff6ff' : '#fff', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.15s' }}>
              <span style={{ fontSize: 22 }}>{opt.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: active ? ACCENT : '#111827' }}>{opt.label}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{opt.sub}</div>
              </div>
              {active && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepLimitations({ limitations, setLimitations }) {
  const examples = ['Bad knees — avoid deep squats', 'Lower back issues — no heavy deadlifts', 'Shoulder impingement — avoid overhead pressing', 'None — all good'];
  return (
    <div>
      <h2 style={onboardH2}>Injuries & limits</h2>
      <p style={onboardSub}>Anything to avoid? We'll work around it. Leave blank if none.</p>
      <textarea value={limitations} onChange={e => setLimitations(e.target.value)}
        placeholder="e.g. I avoid back squats due to lower back load. No other restrictions."
        rows={4}
        style={{ ...inputStyle, resize: 'none', lineHeight: 1.6, marginBottom: 20 }} />
      <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 10, fontWeight: 600 }}>Common examples</p>
      {examples.map(ex => (
        <button key={ex} onClick={() => setLimitations(ex)}
          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: 10, background: limitations === ex ? '#eff6ff' : '#fff', border: limitations === ex ? `1.5px solid ${ACCENT}` : '1px solid #f0f0f0', color: '#374151', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', marginBottom: 8 }}>
          {ex}
        </button>
      ))}
    </div>
  );
}

function StepExercises({ exStatus, cycleEx }) {
  const [openGroup, setOpenGroup] = useState(0);
  const statusColors = {
    YES: { bg: '#eff6ff', color: ACCENT, border: ACCENT },
    SUB: { bg: '#fffbeb', color: '#d97706', border: '#fbbf24' },
    NO:  { bg: '#fef2f2', color: '#ef4444', border: '#fca5a5' },
  };
  const statusLabels = { YES: 'Yes', SUB: 'Sub', NO: 'No' };

  return (
    <div>
      <h2 style={onboardH2}>Exercise library</h2>
      <p style={onboardSub}>Tap each exercise to cycle: <span style={{ color: ACCENT, fontWeight: 700 }}>Yes</span> → <span style={{ color: '#d97706', fontWeight: 700 }}>Substitute</span> → <span style={{ color: '#ef4444', fontWeight: 700 }}>No</span></p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, marginTop: 4 }}>
        {Object.entries(statusLabels).map(([k, v]) => {
          const s = statusColors[k];
          return <span key={k} style={{ padding: '3px 10px', borderRadius: 8, background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontSize: 12, fontWeight: 700 }}>{v}</span>;
        })}
      </div>

      {EXERCISE_LIBRARY.map((g, gi) => {
        const open = openGroup === gi;
        const nos  = g.exercises.filter(e => exStatus[e.id] === 'NO').length;
        const subs = g.exercises.filter(e => exStatus[e.id] === 'SUB').length;
        return (
          <div key={g.group} style={{ background: '#fff', borderRadius: 14, marginBottom: 10, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
            <button onClick={() => setOpenGroup(open ? -1 : gi)}
              style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{g.group}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>
                  {g.exercises.length} exercises
                  {nos  > 0 && <span style={{ color: '#ef4444', marginLeft: 6 }}>· {nos} excluded</span>}
                  {subs > 0 && <span style={{ color: '#d97706', marginLeft: 6 }}>· {subs} subbed</span>}
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {open && (
              <div style={{ borderTop: '1px solid #f3f4f6', padding: '8px 16px 12px' }}>
                {g.exercises.map(ex => {
                  const st = exStatus[ex.id] || 'YES';
                  const s  = statusColors[st];
                  return (
                    <div key={ex.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid #f9fafb' }}>
                      <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{ex.name}</span>
                      <button onClick={() => cycleEx(ex.id)}
                        style={{ padding: '4px 12px', borderRadius: 8, background: s.bg, color: s.color, border: `1.5px solid ${s.border}`, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', minWidth: 48, transition: 'all 0.15s' }}>
                        {statusLabels[st]}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepWeights({ liftWeights, setLiftWeights }) {
  return (
    <div>
      <h2 style={onboardH2}>Starting weights</h2>
      <p style={onboardSub}>Your current working weights — not your 1RM. Use what you can hit for 3×8 at RPE 7–8.</p>
      <div style={{ marginTop: 8 }}>
        {KEY_LIFTS.map(lift => {
          const w = liftWeights[lift.id] ?? lift.default;
          const unit = lift.unit || 'lb';
          return (
            <div key={lift.id} style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', marginBottom: 10, border: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{lift.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => setLiftWeights(prev => ({ ...prev, [lift.id]: Math.max(0, w - lift.step) }))}
                    style={{ width: 32, height: 32, borderRadius: 8, background: '#f3f4f6', border: 'none', color: '#374151', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>−</button>
                  <span style={{ minWidth: 70, textAlign: 'center', fontSize: 18, fontWeight: 700, color: '#111827' }}>{w} <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>{unit}</span></span>
                  <button onClick={() => setLiftWeights(prev => ({ ...prev, [lift.id]: w + lift.step }))}
                    style={{ width: 32, height: 32, borderRadius: 8, background: '#f3f4f6', border: 'none', color: '#374151', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>+</button>
                </div>
              </div>
              {lift.unit === 'reps' && <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Enter max reps per set if bodyweight</p>}
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>Don't know yet? Keep the defaults — you can update them after your first session.</p>
    </div>
  );
}

function StepDone({ name, goals, daysPerWeek, onComplete }) {
  const goalLabels = { hypertrophy: 'Build muscle', strength: 'Get stronger', 'fat-loss': 'Lose fat', fitness: 'General fitness' };
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '48px 24px 32px' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#111827', marginBottom: 8 }}>You're all set{name ? `, ${name}` : ''}.</h2>
        <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.5 }}>Your program is ready. We'll track every session and tell you when it's time to add weight.</p>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', marginBottom: 24, border: '1px solid #f0f0f0' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Your program</p>
        {[
          { label: 'Split',       value: `${daysPerWeek}-day Upper / Lower` },
          { label: 'Focus',       value: goals.map(g => goalLabels[g] || g).join(', ') || 'General fitness' },
          { label: 'Progression', value: 'RPE-based · auto weight bumps' },
          { label: 'Blocks',      value: '3 × 4 weeks + deload' },
        ].map((r, i, arr) => (
          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: i < arr.length - 1 ? 10 : 0, marginBottom: i < arr.length - 1 ? 10 : 0, borderBottom: i < arr.length - 1 ? '1px solid #f9fafb' : 'none' }}>
            <span style={{ fontSize: 13, color: '#9ca3af' }}>{r.label}</span>
            <span style={{ fontSize: 13, color: '#111827', fontWeight: 600 }}>{r.value}</span>
          </div>
        ))}
      </div>

      <button onClick={onComplete} style={{ width: '100%', padding: '18px', borderRadius: 16, background: ACCENT, color: '#fff', border: 'none', fontWeight: 700, fontSize: 17, fontFamily: 'inherit', cursor: 'pointer' }}>
        Start training →
      </button>
    </div>
  );
}

const onboardH2   = { fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 6 };
const onboardSub  = { fontSize: 14, color: '#6b7280', marginBottom: 20, lineHeight: 1.5 };
const labelStyle  = { fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 };
const inputStyle  = { width: '100%', padding: '14px 16px', borderRadius: 12, border: '1.5px solid #e8eaed', background: '#fff', color: '#111827', fontSize: 15, fontFamily: 'inherit', outline: 'none' };

Object.assign(window, { OnboardingFlow });
