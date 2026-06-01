// ============================================================
// WORKOUT APP — DATA LAYER
// ============================================================

const APP_VERSION = 'workout-v28';
const ACCENT = '#478dff';

const DAY_COLORS = { A: '#478dff', B: '#f97316', C: '#0891b2', D: '#7c3aed' };

const PROGRAM_DAYS = [
  {
    id: 'A', name: 'Lower — Quad', day: 'Monday', shortDay: 'Mon',
    exercises: [
      { id: 'leg-press',            name: 'Leg Press',              sets: 4, repRange: '8–10', rpe: 8 },
      { id: 'bulgarian-split',      name: 'Bulgarian Split Squat',  sets: 3, repRange: '10–12', rpe: 8 },
      { id: 'lunges',               name: 'DB Lunges',              sets: 3, repRange: '12', rpe: 7 },
      { id: 'leg-extension',        name: 'Leg Extension',          sets: 3, repRange: '12–15', rpe: 7 },
      { id: 'calf-raise',           name: 'Standing Calf Raise',    sets: 4, repRange: '12–15', rpe: 7 },
    ]
  },
  {
    id: 'B', name: 'Upper — Push', day: 'Tuesday', shortDay: 'Tue',
    exercises: [
      { id: 'machine-chest',        name: 'Machine Chest Press',    sets: 4, repRange: '8–10',  rpe: 8, note: '★ Favourite — focus on stretch' },
      { id: 'incline-db',           name: 'Incline DB Press',       sets: 3, repRange: '10–12', rpe: 8 },
      { id: 'cable-fly',            name: 'Cable Fly',              sets: 3, repRange: '12–15', rpe: 7 },
      { id: 'barbell-ohp',          name: 'Barbell OHP',            sets: 3, repRange: '8–10',  rpe: 8 },
      { id: 'cable-lateral',        name: 'Cable Lateral Raise',    sets: 3, repRange: '15',    rpe: 7 },
      { id: 'tricep-pushdown',      name: 'Tricep Pushdown',        sets: 3, repRange: '12–15', rpe: 7 },
      { id: 'oh-tricep',            name: 'OH Tricep Extension',    sets: 3, repRange: '12–15', rpe: 7 },
    ]
  },
  {
    id: 'C', name: 'Upper — Pull', day: 'Thursday', shortDay: 'Thu',
    exercises: [
      { id: 'pullup',               name: 'Pull Ups',               sets: 4, repRange: '6–8',   rpe: 8, note: '★ Priority pull' },
      { id: 'barbell-row',          name: 'Barbell Bent Over Row',  sets: 4, repRange: '8–10',  rpe: 8 },
      { id: 'lat-pulldown',         name: 'Lat Pulldown (neutral)', sets: 3, repRange: '10–12', rpe: 7 },
      { id: 'cable-row',            name: 'Seated Cable Row',       sets: 3, repRange: '10–12', rpe: 7 },
      { id: 'face-pull',            name: 'Face Pull',              sets: 3, repRange: '15–20', rpe: 7 },
      { id: 'barbell-curl',         name: 'Barbell Curl',           sets: 3, repRange: '10–12', rpe: 7 },
      { id: 'incline-db-curl',      name: 'Incline DB Curl',        sets: 3, repRange: '12–15', rpe: 7 },
    ]
  },
  {
    id: 'D', name: 'Lower — Posterior', day: 'Friday', shortDay: 'Fri',
    exercises: [
      { id: 'deadlift',             name: 'Conventional Deadlift',  sets: 4, repRange: '5–6',   rpe: 8, note: 'Main strength lift — brace hard' },
      { id: 'rdl',                  name: 'Romanian Deadlift',      sets: 3, repRange: '8–10',  rpe: 8 },
      { id: 'hip-thrust',           name: 'Machine Hip Thrust',     sets: 3, repRange: '10–12', rpe: 7 },
      { id: 'leg-curl',             name: 'Seated Leg Curl',        sets: 3, repRange: '12–15', rpe: 7 },
      { id: 'nordic',               name: 'Nordic Curl',            sets: 3, repRange: '6–8',   rpe: 8 },
    ]
  },
];

const DEFAULT_WEIGHTS = {
  'leg-press':       { w: 200 }, 'bulgarian-split': { w: 50 },
  'lunges':          { w: 40 },  'leg-extension':   { w: 80 },
  'calf-raise':      { w: 135 }, 'machine-chest':   { w: 120 },
  'incline-db':      { w: 50 },  'cable-fly':       { w: 30 },
  'barbell-ohp':     { w: 115 }, 'cable-lateral':   { w: 20 },
  'tricep-pushdown': { w: 70 },  'oh-tricep':       { w: 50 },
  'pullup':          { w: 0 },   'barbell-row':     { w: 135 },
  'lat-pulldown':    { w: 110 }, 'cable-row':       { w: 90 },
  'face-pull':       { w: 40 },  'barbell-curl':    { w: 60 },
  'incline-db-curl': { w: 25 },  'deadlift':        { w: 270 },
  'rdl':             { w: 215 }, 'hip-thrust':      { w: 180 },
  'leg-curl':        { w: 100 }, 'nordic':          { w: 0 },
};

function makeSeedHistory() {
  const now = Date.now();
  const day = 86400000;
  return [
    { id: 'h1', dayId: 'A', date: now - 25*day, name: 'Lower — Quad',      duration: 58, sets: 17, topLifts: [{ name: 'Leg Press', w: 185 }] },
    { id: 'h2', dayId: 'B', date: now - 24*day, name: 'Upper — Push',      duration: 62, sets: 20, topLifts: [{ name: 'Machine Chest', w: 115 }] },
    { id: 'h3', dayId: 'C', date: now - 22*day, name: 'Upper — Pull',      duration: 64, sets: 21, topLifts: [{ name: 'Barbell Row', w: 135 }] },
    { id: 'h4', dayId: 'D', date: now - 21*day, name: 'Lower — Posterior', duration: 55, sets: 16, topLifts: [{ name: 'Deadlift', w: 265 }] },
    { id: 'h5', dayId: 'A', date: now - 14*day, name: 'Lower — Quad',      duration: 60, sets: 17, topLifts: [{ name: 'Leg Press', w: 195 }] },
    { id: 'h6', dayId: 'B', date: now - 13*day, name: 'Upper — Push',      duration: 65, sets: 20, topLifts: [{ name: 'Machine Chest', w: 120 }] },
    { id: 'h7', dayId: 'C', date: now -  7*day, name: 'Upper — Pull',      duration: 63, sets: 21, topLifts: [{ name: 'Barbell Row', w: 135 }] },
    { id: 'h8', dayId: 'D', date: now -  6*day, name: 'Lower — Posterior', duration: 57, sets: 16, topLifts: [{ name: 'Deadlift', w: 270 }] },
  ];
}

const LIFT_HISTORY = {
  'Deadlift':      [245, 250, 255, 255, 260, 265, 265, 270],
  'Machine Chest': [100, 105, 110, 110, 115, 115, 120, 120],
  'Barbell Row':   [115, 120, 120, 125, 130, 130, 135, 135],
  'Barbell OHP':   [100, 100, 105, 105, 110, 110, 115, 115],
};

const SWAP_GROUPS = {
  'leg-press': 'quad', 'bulgarian-split': 'quad', 'lunges': 'quad',
  'step-ups': 'quad', 'goblet-squat': 'quad', 'leg-extension': 'quad',
  'hack-squat': 'quad', 'back-squat': 'quad',
  'deadlift': 'posterior', 'rdl': 'posterior', 'hip-thrust': 'posterior',
  'leg-curl': 'posterior', 'nordic': 'posterior', 'good-morning': 'posterior',
  'machine-chest': 'h-push', 'db-bench': 'h-push', 'incline-db': 'h-push',
  'cable-fly': 'h-push', 'pec-dec': 'h-push', 'barbell-bench': 'h-push',
  'barbell-ohp': 'v-push', 'seated-press': 'v-push', 'db-lateral': 'v-push',
  'cable-lateral': 'v-push', 'face-pull': 'v-push', 'rear-delt-fly': 'v-push',
  'barbell-row': 'h-pull', 'db-row': 'h-pull', 'cable-row': 'h-pull',
  'machine-row': 'h-pull', 'chest-row': 'h-pull',
  'pullup': 'v-pull', 'chinup': 'v-pull', 'lat-pulldown': 'v-pull',
  'neutral-pull': 'v-pull', 'str-pulldown': 'v-pull',
  'barbell-curl': 'biceps', 'hammer-curl': 'biceps', 'incline-db-curl': 'biceps',
  'tricep-pushdown': 'triceps', 'oh-tricep': 'triceps', 'dips': 'triceps',
  'calf-raise': 'calves',
};

const SWAP_CANDIDATES = {
  quad:      [{ id: 'leg-press', name: 'Leg Press' }, { id: 'bulgarian-split', name: 'Bulgarian Split Squat' }, { id: 'lunges', name: 'DB Lunges' }, { id: 'goblet-squat', name: 'Goblet Squat' }, { id: 'hack-squat', name: 'Hack Squat' }, { id: 'step-ups', name: 'Step Ups' }, { id: 'leg-extension', name: 'Leg Extension' }],
  posterior: [{ id: 'deadlift', name: 'Conventional Deadlift' }, { id: 'rdl', name: 'Romanian Deadlift' }, { id: 'hip-thrust', name: 'Machine Hip Thrust' }, { id: 'leg-curl', name: 'Seated Leg Curl' }, { id: 'nordic', name: 'Nordic Curl' }, { id: 'good-morning', name: 'Good Morning' }],
  'h-push':  [{ id: 'machine-chest', name: 'Machine Chest Press' }, { id: 'db-bench', name: 'DB Bench Press' }, { id: 'incline-db', name: 'Incline DB Press' }, { id: 'cable-fly', name: 'Cable Fly' }, { id: 'pec-dec', name: 'Pec Dec' }, { id: 'barbell-bench', name: 'Barbell Bench Press' }],
  'v-push':  [{ id: 'barbell-ohp', name: 'Barbell OHP' }, { id: 'seated-press', name: 'Seated Machine Press' }, { id: 'cable-lateral', name: 'Cable Lateral Raise' }, { id: 'db-lateral', name: 'DB Lateral Raise' }, { id: 'face-pull', name: 'Face Pull' }, { id: 'rear-delt-fly', name: 'Rear Delt Fly' }],
  'h-pull':  [{ id: 'barbell-row', name: 'Barbell Row' }, { id: 'db-row', name: 'DB Row' }, { id: 'cable-row', name: 'Seated Cable Row' }, { id: 'machine-row', name: 'Machine Row' }, { id: 'chest-row', name: 'Chest Supported Row' }],
  'v-pull':  [{ id: 'pullup', name: 'Pull Ups' }, { id: 'chinup', name: 'Chin Ups' }, { id: 'lat-pulldown', name: 'Lat Pulldown (bar)' }, { id: 'neutral-pull', name: 'Lat Pulldown (neutral)' }, { id: 'str-pulldown', name: 'Straight Arm Pulldown' }],
  biceps:    [{ id: 'barbell-curl', name: 'Barbell Curl' }, { id: 'hammer-curl', name: 'Hammer Curl' }, { id: 'incline-db-curl', name: 'Incline DB Curl' }],
  triceps:   [{ id: 'tricep-pushdown', name: 'Tricep Pushdown' }, { id: 'oh-tricep', name: 'OH Tricep Extension' }, { id: 'dips', name: 'Dips' }],
  calves:    [{ id: 'calf-raise', name: 'Standing Calf Raise' }],
};

// Which program slots feed the "Key Lifts" card on the Home screen.
// histKey = the matching key in LIFT_HISTORY for the progression data.
const KEY_LIFT_SLOTS = [
  { histKey: 'Deadlift',      dayId: 'D', slotIdx: 0 },
  { histKey: 'Machine Chest', dayId: 'B', slotIdx: 0 },
  { histKey: 'Barbell Row',   dayId: 'C', slotIdx: 1 },
  { histKey: 'Barbell OHP',   dayId: 'B', slotIdx: 3 },
];

const WAPP_STORAGE_KEYS = [
  'wapp_profile',
  'wapp_history',
  'wapp_weights',
  'wapp_tab',
  'wapp_tweaks',
  'wapp_program_swaps',
  'wapp_day_names',
  'wapp_deletions',
  'wapp_additions',
  'wapp_custom_exercises',
  'wapp_week',
  'wapp_active_workout',
];

// Applies saved exercise overrides to PROGRAM_DAYS.
// overrides format: { "C:2": { id: "lat-pulldown", name: "Lat Pulldown (neutral)" }, ... }
// where the key is dayId:slotIndex (position in the exercises array).
function applyProgramSwaps(days, overrides) {
  if (!overrides || Object.keys(overrides).length === 0) return days;
  return days.map(day => ({
    ...day,
    exercises: day.exercises.map((ex, i) => {
      const override = overrides[`${day.id}:${i}`];
      return override ? { ...ex, id: override.id, name: override.name } : ex;
    })
  }));
}

Object.assign(window, { APP_VERSION, PROGRAM_DAYS, DEFAULT_WEIGHTS, DAY_COLORS, ACCENT, makeSeedHistory, LIFT_HISTORY, KEY_LIFT_SLOTS, WAPP_STORAGE_KEYS, SWAP_GROUPS, SWAP_CANDIDATES, applyProgramSwaps });
