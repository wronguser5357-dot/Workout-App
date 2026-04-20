// ============================================================
// PROGRAM SCREEN
// ============================================================

function ProgramScreen({ onStartWorkout, history, programDays = PROGRAM_DAYS, onEditSwap, onRenameDay }) {
  const [expanded, setExpanded]     = useState(null);
  const [editingDay, setEditingDay] = useState(null);   // day.id currently in edit mode
  const [renamingDay, setRenamingDay] = useState(null); // day.id whose name is being edited
  const [renameVal, setRenameVal]   = useState('');
  const [swappingEx, setSwappingEx] = useState(null);   // { dayId, slotIdx, ex }
  const oneWeekAgo = Date.now() - 7 * 86400000;
  const recentIds  = history.filter(h => h.date > oneWeekAgo).map(h => h.dayId);

  function handleProgramSwap(newEx) {
    if (!swappingEx) return;
    onEditSwap && onEditSwap(swappingEx.dayId, swappingEx.slotIdx, newEx);
    setSwappingEx(null);
  }

  return (
    <div style={{ padding: '28px 20px 0', position: 'relative' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4, color: '#111827' }}>4-Day Split</h1>
      <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 24 }}>Upper / Lower · Hypertrophy focus · Block 1 of 3</p>

      {programDays.map(day => {
        const color     = DAY_COLORS[day.id];
        const done      = recentIds.includes(day.id);
        const open      = expanded === day.id;
        const editing   = editingDay === day.id;
        const totalSets = day.exercises.reduce((a,b) => a+b.sets, 0);

        return (
          <div key={day.id} style={{ background: '#fff', borderRadius: 18, marginBottom: 12, overflow: 'hidden', border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            {/* Day header row */}
            <button onClick={() => {
                const opening = !open;
                setExpanded(opening ? day.id : null);
                if (!opening) setEditingDay(null);
              }}
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

                {/* Day name — tap pencil to rename */}
                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 14, marginBottom: 14 }}>
                  {renamingDay === day.id ? (
                    <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                      <input
                        autoFocus
                        value={renameVal}
                        onChange={e => setRenameVal(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && renameVal.trim()) {
                            onRenameDay && onRenameDay(day.id, renameVal.trim());
                            setRenamingDay(null);
                          }
                          if (e.key === 'Escape') setRenamingDay(null);
                        }}
                        style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: `1.5px solid ${color}`, background: '#fafafa', color: '#111827', fontSize: 15, fontWeight: 700, fontFamily: 'inherit', outline: 'none' }}
                      />
                      <button
                        onClick={() => { if (renameVal.trim()) { onRenameDay && onRenameDay(day.id, renameVal.trim()); } setRenamingDay(null); }}
                        style={{ padding: '8px 14px', borderRadius: 10, background: color, border: 'none', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                        Save
                      </button>
                      <button
                        onClick={() => setRenamingDay(null)}
                        style={{ padding: '8px 12px', borderRadius: 10, background: '#f3f4f6', border: 'none', color: '#6b7280', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#111827', flex: 1 }}>{day.name}</span>
                      <button
                        onClick={() => { setRenamingDay(day.id); setRenameVal(day.name); }}
                        title="Rename day"
                        style={{ width: 28, height: 28, borderRadius: 8, background: color + '15', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Exercises header + Edit/Done toggle */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Exercises</span>
                    <button
                      onClick={e => { e.stopPropagation(); setEditingDay(editing ? null : day.id); }}
                      style={{
                        padding: '4px 12px', borderRadius: 8, border: editing ? 'none' : `1.5px solid ${color}`,
                        background: editing ? color : 'transparent',
                        color: editing ? '#fff' : color,
                        fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'all 0.15s'
                      }}>
                      {editing ? 'Done' : 'Edit'}
                    </button>
                  </div>

                  {day.exercises.map((ex, i) => (
                    <div key={ex.id + i} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: 11, marginBottom: i < day.exercises.length - 1 ? 11 : 0, borderBottom: i < day.exercises.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: ex.note ? 2 : 0 }}>{ex.name}</div>
                        {ex.note && <div style={{ fontSize: 11, color, fontWeight: 600 }}>{ex.note}</div>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginLeft: 12 }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{ex.sets}×{ex.repRange}</span>
                          <span style={{ display: 'block', fontSize: 11, color: '#9ca3af' }}>RPE {ex.rpe}</span>
                        </div>
                        {editing && (
                          <button
                            onClick={() => setSwappingEx({ dayId: day.id, slotIdx: i, ex })}
                            title="Swap exercise"
                            style={{ width: 32, height: 32, borderRadius: 10, background: color + '15', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
                              <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
                            </svg>
                          </button>
                        )}
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

      {/* Swap sheet overlay */}
      {swappingEx && (
        <SwapSheet
          exercise={swappingEx.ex}
          onSwap={handleProgramSwap}
          onClose={() => setSwappingEx(null)}
          color={DAY_COLORS[swappingEx.dayId]}
        />
      )}
    </div>
  );
}

Object.assign(window, { ProgramScreen });
