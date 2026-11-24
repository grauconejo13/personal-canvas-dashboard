# Personal Canvas Dashboard

A lightweight, browser-based dashboard for capturing ideas, notes, and lists in one flexible space.

Built as a small, focused project to turn scattered ideas into something finished and usable.

Live demo:  
https://personal-canvas-dashboard.vercel.app/

---

## ✨ Features

- **Modular dashboard**
  - Drag and resize widgets freely
  - Single-column layout on mobile

- **Text widgets**
  - Edit in place
  - Automatically persisted in the browser

- **Checklist widgets**
  - Add, edit, and check off items
  - State persists on refresh

- **Editable dashboard title**
  - Click to rename your space
  - Saved locally

- **Themes**
  - Light, dark, and minimalist modes

- **Offline-first**
  - No accounts
  - No backend
  - Uses `localStorage` only

- **Local backup and restore**
  - Export the canvas as a portable JSON backup
  - Preview the backup title, theme, widget count, and export date before confirming restore
  - Versioned schema (v2) with validation before local data is replaced; v1 backups still import
  - Rejects oversized files and invalid layout/widget structures
  - Backups store plain data only (positions and text), never HTML, so a tampered file can't run code
  - Falls back safely when a backup contains an unsupported theme
  - Includes title, theme, layout, text, and checklist state

- **Reset with confirmation**
  - Clear the canvas intentionally when needed

---

## 🧠 Design Philosophy

- Small and finished over large and unfinished
- Private by default
- No cloud, no sync, no tracking
- Calm UI with low cognitive load

This project is intentionally minimal and scoped as an MVP.

---

## 🛠 Tech Stack

- HTML
- CSS (Flexbox, CSS variables)
- Vanilla JavaScript
- Gridstack.js
- localStorage
- Deployed on Vercel

---

## ▶️ Run locally

No install or build step:

```bash
npx serve .        # or: python3 -m http.server 8000
```

Or just open `index.html` in a browser. Source files are `index.html`, `app.js` and `styles.css`. The `dist/` folder is an old build output that's out of date (it predates backup and restore), so don't edit it.

AI coding agents: see [AGENTS.md](AGENTS.md).

---

## 📱 Responsiveness

- Desktop: multi-column draggable layout
- Mobile: automatic single-column stacking
- Touch-friendly controls

---

## 🚧 Status

**Work in Progress (WIP)**  
This is a stable MVP. Future improvements may include:
- Image widgets
- Export to PNG/PDF
- Keyboard shortcuts
- Additional widget types

---

## ⚠️ Notes

All data is stored locally in the browser.  
Clearing browser storage or using the Reset button will remove all content. Export a JSON backup first if you want a portable copy that can be restored later.

---

## 📄 License

MIT
