// ============================================================
// HOME SCREEN
// ============================================================

function HomeScreen({ history, onStartWorkout, weights, programDays = PROGRAM_DAYS, currentWeek = 1, weekDone = [] }) {
  const [expandedLift, setExpandedLift] = useState(null);

  // Use weekDone (current training week) to find what's up next
  const nextDay = programDays.find(d => !weekDone.includes(d.id)) || programDays[0];

  const totalSets     = history.reduce((a, b) => a + b.sets, 0);
  const totalSessions = history.length;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const color = DAY_COLORS[nextDay.id];

  function realSeriesForExercise(ex, fallbackKey) {
    const series = history
      .filter(session => session.exerciseLog)
      .map(session => {
        const log = session.exerciseLog.find(e => e.id === ex?.id || e.name === ex?.name);
        if (!log?.sets?.length) return null;
        return Math.max(...log.sets.map(s => Number(s.weight) || 0));
      })
      .filter(v => v !== null);
    return series.length >= 2 ? series : (LIFT_HISTORY[fallbackKey] || []);
  }

  // Build key lifts from program slots so swaps auto-update the displayed name
  const keyLifts = KEY_LIFT_SLOTS.map(slot => {
    const day = programDays.find(d => d.id === slot.dayId);
    const ex  = day?.exercises[slot.slotIdx];
    return {
      name: ex?.name || slot.histKey,
      data: realSeriesForExercise(ex, slot.histKey),
    };
  }).filter(kl => kl.data.length > 0);

  return (
    <div style={{ padding: '28px 20px 0' }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500, marginBottom: 4 }}>{greeting}</p>
        <h1 style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.1, color: '#111827' }}>Connor</h1>
      </div>

      {/* Week progress */}
      <div style={{ background: '#fff', borderRadius: 18, padding: '18px 20px', marginBottom: 14, border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase' }}>This week</span>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>Week {currentWeek} · Block {Math.ceil(currentWeek / 6)}</span>
        </div>
        <WeekDots history={history} weekDone={weekDone} />
      </div>

      {/* Next session CTA */}
      <div style={{ background: color, borderRadius: 18, padding: '22px 22px', marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.12)' }} />
        <div style={{ position: 'absolute', bottom: -30, right: 20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.2)', color: '#fff', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10 }}>Up next</span>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, color: '#fff' }}>{nextDay.name}</h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 20 }}>{nextDay.exercises.length} exercises · {nextDay.exercises.reduce((a,b)=>a+b.sets,0)} sets · {nextDay.day}</p>
        <button onClick={() => onStartWorkout(nextDay)} style={{ width: '100%', padding: '14px', borderRadius: 12, background: '#fff', color, border: 'none', fontWeight: 700, fontSize: 15, fontFamily: 'inherit', cursor: 'pointer' }}>
          Start Session →
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
        {[
          { label: 'Sessions', value: totalSessions },
          { label: 'Total sets', value: totalSets },
          { label: 'Streak', value: '2 wks' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: '16px 12px', textAlign: 'center', border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 3, color: '#111827' }}>{s.value}</div>
            <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Key lifts — expandable */}
      <div style={{ background: '#fff', borderRadius: 18, padding: '18px 20px', marginBottom: 8, border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>Key lifts</p>

        {keyLifts.map(({ name, data }) => {
          const current  = data[data.length - 1];
          const prev     = data[data.length - 2];
          const up       = current > prev;
          const isOpen   = expandedLift === name;

          // Build weekly rows newest-first (up to 6 entries)
          const weekRows = [...data].reverse().slice(0, 6).map((w, i) => ({
            label: i === 0 ? 'Current' : i === 1 ? 'Last session' : `${i} sessions ago`,
            weight: w,
            isCurrent: i === 0,
          }));
          const maxW = Math.max(...data);

          return (
            <div key={name} style={{ marginBottom: isOpen ? 20 : 16 }}>
              {/* Summary row — tap to expand */}
              <button
                onClick={() => setExpandedLift(isOpen ? null : name)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, textAlign: 'left' }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{name}</div>
                  <div style={{ fontSize: 13, marginTop: 1 }}>
                    <span style={{ color: '#374151', fontWeight: 600 }}>{current} lb</span>
                    {up && (
                      <span style={{ marginLeft: 8, fontSize: 11, color: ACCENT, fontWeight: 700, background: '#eff6ff', padding: '1px 6px', borderRadius: 4 }}>
                        ↑ +{current - prev}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <MiniChart data={data} color={ACCENT} />
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </button>

              {/* Expanded session history */}
              {isOpen && (
                <div style={{ marginTop: 14, borderTop: '1px solid #f3f4f6', paddingTop: 12 }}>
                  {weekRows.map(({ label, weight, isCurrent }) => {
                    const barPct = maxW > 0 ? (weight / maxW) * 100 : 0;
                    return (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <span style={{ fontSize: 11, color: '#9ca3af', width: 96, flexShrink: 0 }}>{label}</span>
                        <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#f3f4f6', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${barPct}%`, borderRadius: 3, background: isCurrent ? ACCENT : ACCENT + '55', transition: 'width 0.4s' }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? '#111827' : '#6b7280', width: 52, textAlign: 'right', flexShrink: 0 }}>
                          {weight} lb
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen });
