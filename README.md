# Workout — Design to Code Handoff

This folder is the handoff workspace between Claude Design (prototype/visual work) and Claude Code (implementation).

## Folder layout

```
.
├── CLAUDE.md            # Context Claude Code reads first
├── README.md            # This file
├── design/              # Inputs from Claude Design
│   ├── mockups/         # PNG/JPG/SVG screenshots and mockups
│   ├── specs/           # Written specs, requirements, user stories
│   └── assets/          # Source assets (icons, logos, photos)
├── prototype/           # HTML/CSS/JS prototype(s) produced by Claude Design
├── src/                 # Production implementation target
│   ├── index.html
│   ├── styles/
│   ├── scripts/
│   └── assets/
└── docs/                # Notes, decisions, open questions
```

## Workflow

1. Drop design outputs into `design/` and any working prototype into `prototype/`.
2. Fill in `CLAUDE.md` with intent, scope, and constraints so Claude Code has full context.
3. Point Claude Code at this folder and ask it to implement `src/` based on `design/` + `prototype/`.
4. Track decisions and open questions in `docs/`.
