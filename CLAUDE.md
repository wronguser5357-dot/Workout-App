# Claude Code Context — Workout

> This file is read first by Claude Code. Keep it current. If anything here conflicts with other notes, this file wins.

## Project

Workout — (one-line description goes here).

## Stack

- Plain HTML / CSS / JavaScript (no framework, no build step unless added later).
- No package manager required to run; `src/index.html` should be openable directly in a browser.

## Inputs (what to read before coding)

1. `design/specs/` — written requirements and behavior specs.
2. `design/mockups/` — visual reference. Treat as source of truth for layout, color, spacing.
3. `prototype/` — working prototype from Claude Design. Use as the structural starting point; refactor for production quality.
4. `design/assets/` — images, icons, fonts to reuse.

## Output target

All production code lives in `src/`:
- `src/index.html` — entry point
- `src/styles/` — CSS (prefer a single `main.css` unless the design calls for more)
- `src/scripts/` — JS modules
- `src/assets/` — optimized assets used at runtime

## Implementation guidelines

- Semantic HTML first, then styling, then behavior.
- Mobile-first responsive layout unless specs say otherwise.
- No external frameworks without asking; small utility libs are fine if justified.
- Keep accessibility in mind: alt text, labels, keyboard nav, color contrast.
- Match mockups for spacing/typography/color; pull exact values from the prototype CSS when possible.

## Out of scope (unless asked)

- Backend / API work.
- Auth, analytics, build tooling.
- Refactoring the prototype in place — write fresh code in `src/`.

## Open questions

Track anything ambiguous in `docs/decisions.md` rather than guessing silently.
