// ============================================================
// HOME SCREEN
// ============================================================

function HomeScreen({ history, onStartWorkout, weights }) {
  const nextDay = (() => {
    const oneWeekAgo = Date.now() - 7 * 86400000;
    const recentIds = history.filter(h => h.date > oneWeekAgo).map(h => h.dayId);
    return PROGRAM_DAYS.find(d => !recentIds.includes(d.id)) || PROGRAM_DAYS[0];
  })();

  const totalSets     = history.reduce((a, b) => a + b.sets, 0);
  const totalSessions = history.length;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const color = DAY_COLORS[nextDay.id];

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
          <span style={{ fontSize: 12, color: '#9ca3af' }}>Week 3 · Block 1</span>
        </div>
        <WeekDots history={history} />
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

      {/* Key lifts */}
      <div style={{ background: '#fff', borderRadius: 18, padding: '18px 20px', marginBottom: 8, border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>Key lifts</p>
        {Object.entries(LIFT_HISTORY).map(([name, data]) => {
          const current = data[data.length - 1];
          const prev    = data[data.length - 2];
          const up      = current > prev;
          return (
            <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{name}</div>
                <div style={{ fontSize: 13, marginTop: 1 }}>
                  <span style={{ color: '#374151', fontWeight: 600 }}>{current} lb</span>
                  {up && <span style={{ marginLeft: 8, fontSize: 11, color: '#478dff', fontWeight: 700, background: '#eff6ff', padding: '1px 6px', borderRadius: 4 }}>↑ +{current - prev}</span>}
                </div>
              </div>
              <MiniChart data={data} color={ACCENT} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen });
