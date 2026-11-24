# Personal Canvas Dashboard: agent instructions

Shared by Claude Code, Codex and other agents (`CLAUDE.md` points here).

## What this is

A small, finished-feeling, offline-first dashboard: draggable text and checklist widgets, themes, an editable title, and JSON backup and restore. **No backend, no accounts, no build step.** All data lives in the browser's `localStorage`. Deployed as a static site on Vercel.

## Stack and files

```text
index.html    markup + toolbar (inline onclick handlers call globals in app.js)
app.js        all logic: widgets, persistence, themes, backup/restore
styles.css    themes via CSS variables, mobile single-column layout
dist/         STALE old Babel output. Lacks backup/restore, and its index.html
              points to files not in dist/. Do not edit; do not treat as source.
```

Gridstack.js **10.1.1** is loaded from jsDelivr in `index.html`. Keep the CSS and JS versions pinned together.

## Run and check

```bash
npx serve .            # or: python3 -m http.server 8000, or open index.html directly
node --check app.js    # syntax check (there are no tests or linter)
```

Before finishing, manually check in a browser: add, drag, resize and delete widgets; reload and confirm state persists; switch all three themes; export, then import that file (confirm the preview dialog); Reset; and a narrow (mobile) viewport.

## localStorage contract (don't break existing users' data)

Keys: `dashboardTitle`, `theme` (`dark` | `light` | `minimal`), `layout` (array of `{id, type, x, y, w, h}`), `widgetData` (object keyed by widget id: a string for text widgets, `[{text, checked}]` for checklists).

- Don't rename or reshape these keys without a migration that reads the old format.
- Backups are versioned and validated in `app.js`. If you change the shape, bump the version and keep importing older backups.
- Keep import size limits and validation. Never `eval` or inject backup content as HTML.
- Never interpolate stored or imported text into HTML strings. Build elements and set `.textContent` / `.value`.

## Security notes

- Layout is stored as `{id, type, x, y, w, h}` (backup v2). **Never store or render widget HTML.** Widgets are built in `mountWidget()` with DOM APIs.
- Imported and stored data go through `sanitizeLayout()` / `sanitizeWidgetData()`. Keep the ID pattern, size clamps and length caps.
- v1 backups and legacy layouts still migrate via `legacyIdentity()` (inert `DOMParser`, reads only `data-id`/`data-type`). Don't remove it while old backups may exist.
- History: fixed a backup script-injection bug in #2 (2026-11).

## Rules

- Keep it vanilla: no framework, bundler or npm dependencies without the owner's approval.
- Private by default: no analytics, tracking, cloud sync or network calls beyond the Gridstack CDN.
- Small and calm: match the existing minimal UI. Keep buttons keyboard-accessible with `aria-label`s.
- Update `README.md` when features change.
- Work on a branch and open a PR. Never push to `main` or deploy.

## Handoff report (end every task with this)

- **Summary:** what changed and why
- **Files:** each changed file and what changed
- **Checks:** `node --check app.js`, plus the manual browser checks you actually did
- **Not verified:** anything untested (e.g. Safari, mobile)
- **Needs owner approval:** anything touching the storage format or dependencies
