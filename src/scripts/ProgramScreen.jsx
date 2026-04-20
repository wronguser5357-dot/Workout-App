// ============================================================
// PROGRAM SCREEN
// ============================================================

function ProgramScreen({ onStartWorkout, history, programDays = PROGRAM_DAYS }) {
  const [expanded, setExpanded] = useState(null);
  const oneWeekAgo = Date.now() - 7 * 86400000;
  const recentIds  = history.filter(h => h.date > oneWeekAgo).map(h => h.dayId);

  return (
    <div style={{ padding: '28px 20px 0' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4, color: '#111827' }}>4-Day Split</h1>
      <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 24 }}>Upper / Lower · Hypertrophy focus · Block 1 of 3</p>

      {programDays.map(day => {
        const color     = DAY_COLORS[day.id];
        const done      = recentIds.includes(day.id);
        const open      = expanded === day.id;
        const totalSets = day.exercises.reduce((a,b) => a+b.sets, 0);

        return (
          <div key={day.id} style={{ background: '#fff', borderRadius: 18, marginBottom: 12, overflow: 'hidden', border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <button onClick={() => setExpanded(open ? null : day.id)}
              style={{ width: '100%', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: done ? color : color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {done
                  ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  : <span style={{ fontSize: 16, fontWeight: 800, color }}>{day.id}</span>
                }
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{day.name}</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>{day.shortDay} · {day.exercises.length} exercises · {totalSets} sets</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {open && (
              <div style={{ padding: '0 20px 18px' }}>
                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 14, marginBottom: 14 }}>
                  {day.exercises.map((ex, i) => (
                    <div key={ex.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: 11, marginBottom: i < day.exercises.length - 1 ? 11 : 0, borderBottom: i < day.exercises.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: ex.note ? 2 : 0 }}>{ex.name}</div>
                        {ex.note && <div style={{ fontSize: 11, color, fontWeight: 600 }}>{ex.note}</div>}
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{ex.sets}×{ex.repRange}</span>
                        <span style={{ display: 'block', fontSize: 11, color: '#9ca3af' }}>RPE {ex.rpe}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => onStartWorkout(day)}
                  style={{ width: '100%', padding: '13px', borderRadius: 12, background: color, color: '#fff', border: 'none', fontWeight: 700, fontSize: 14, fontFamily: 'inherit', cursor: 'pointer' }}>
                  Start {day.name}
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Progression rules */}
      <div style={{ background: '#fff', borderRadius: 18, padding: '18px 20px', marginBottom: 8, border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>Progression rules</p>
        {[
          { label: 'Upper compounds', rule: '+2.5 lb when top of rep range hit 2× at target RPE' },
          { label: 'Lower compounds', rule: '+5 lb same condition' },
          { label: 'Accessories',     rule: 'Add reps before adding weight' },
          { label: 'Deload',          rule: 'Every 4–6 weeks or when stalling' },
        ].map(r => (
          <div key={r.label} style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: ACCENT }}>{r.label} </span>
            <span style={{ fontSize: 12, color: '#6b7280' }}>{r.rule}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { ProgramScreen });
