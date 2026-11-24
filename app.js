// Personal Canvas: all widget content is built with DOM APIs and filled with
// .value / .textContent. Stored or imported text is never parsed as HTML.

const titleEl = document.getElementById("dashboard-title");
const TITLE_LIMIT = 32;
const BACKUP_VERSION = 2; // v2: layout stores {id, type, x, y, w, h}, never HTML
const SUPPORTED_BACKUP_VERSIONS = new Set([1, 2]);
const MAX_BACKUP_BYTES = 2 * 1024 * 1024;
const SUPPORTED_THEMES = new Set(["dark", "light", "minimal"]);
const WIDGET_ID_PATTERN = /^(widget|checklist)-[0-9]{1,16}(-[0-9]{1,4})?$/;
const MAX_WIDGETS = 200;
const MAX_TEXT_LENGTH = 100000;
const MAX_CHECKLIST_ITEMS = 500;
const MAX_ITEM_LENGTH = 1000;
const GRID_COLUMNS = 12;

// ---------- Safe parsing helpers ----------

function readJson(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return value === null ? fallback : value;
    } catch {
        return fallback;
    }
}

function clampInt(value, min, max, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, Math.round(n)));
}

// v1 layouts (grid.save(true)) carried each widget's rendered HTML in
// `content`. Read only data-id / data-type from it, in an inert document
// (DOMParser never runs scripts or loads resources), and discard the HTML.
function legacyIdentity(content) {
    if (typeof content !== "string") return {};
    const doc = new DOMParser().parseFromString(content, "text/html");
    const widget = doc.querySelector(".widget");
    if (!widget) return {};
    return {
        id: widget.getAttribute("data-id"),
        type: widget.getAttribute("data-type") === "checklist" ? "checklist" : "text"
    };
}

function sanitizeLayout(raw) {
    if (!Array.isArray(raw)) return [];
    const seen = new Set();
    const layout = [];

    for (const entry of raw.slice(0, MAX_WIDGETS)) {
        if (typeof entry !== "object" || entry === null) continue;

        const legacy = entry.id === undefined ? legacyIdentity(entry.content) : {};
        const id = typeof entry.id === "string" ? entry.id : legacy.id;
        if (typeof id !== "string" || !WIDGET_ID_PATTERN.test(id) || seen.has(id)) continue;

        const type = entry.type === "checklist" || entry.type === "text"
            ? entry.type
            : legacy.type || (id.startsWith("checklist-") ? "checklist" : "text");

        seen.add(id);
        layout.push({
            id,
            type,
            x: clampInt(entry.x, 0, GRID_COLUMNS - 1, 0),
            y: clampInt(entry.y, 0, 10000, 0),
            w: clampInt(entry.w, 1, GRID_COLUMNS, 3),
            h: clampInt(entry.h, 1, 50, type === "checklist" ? 3 : 2)
        });
    }
    return layout;
}

function sanitizeWidgetData(raw) {
    const data = {};
    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return data;

    for (const [id, value] of Object.entries(raw)) {
        if (!WIDGET_ID_PATTERN.test(id)) continue;
        if (typeof value === "string") {
            data[id] = value.slice(0, MAX_TEXT_LENGTH);
        } else if (Array.isArray(value)) {
            data[id] = value.slice(0, MAX_CHECKLIST_ITEMS)
                .filter(item => typeof item === "object" && item !== null)
                .map(item => ({
                    text: typeof item.text === "string" ? item.text.slice(0, MAX_ITEM_LENGTH) : "",
                    checked: item.checked === true
                }));
        }
    }
    return data;
}

// ---------- State ----------

let widgetData = sanitizeWidgetData(readJson("widgetData", {}));
let idCounter = 0;

function newId(prefix) {
    idCounter = (idCounter + 1) % 10000;
    return `${prefix}-${Date.now()}-${idCounter}`;
}

function saveWidgetData() {
    localStorage.setItem("widgetData", JSON.stringify(widgetData));
}

// ---------- Title ----------

const savedTitle = localStorage.getItem("dashboardTitle");
if (savedTitle) {
    titleEl.textContent = savedTitle.slice(0, TITLE_LIMIT);
}

titleEl.addEventListener("input", () => {
    if (titleEl.textContent.length > TITLE_LIMIT) {
        titleEl.textContent = titleEl.textContent.slice(0, TITLE_LIMIT);
        placeCaretAtEnd(titleEl);
    }
    localStorage.setItem("dashboardTitle", titleEl.textContent.trim());
});

function placeCaretAtEnd(el) {
    el.focus();
    document.getSelection().selectAllChildren(el);
    document.getSelection().collapseToEnd();
}

// ---------- Theme ----------

function normalizeTheme(theme) {
    return SUPPORTED_THEMES.has(theme) ? theme : "dark";
}

document.documentElement.dataset.theme = normalizeTheme(localStorage.getItem("theme"));

function setTheme(theme) {
    const safe = normalizeTheme(theme);
    document.documentElement.dataset.theme = safe;
    localStorage.setItem("theme", safe);
}

// ---------- Grid ----------

const grid = GridStack.init({
    float: true,
    cellHeight: 120,
    disableOneColumnMode: false,
    oneColumnSize: 600
});

let loading = false;

function serializeLayout() {
    return grid.getGridItems().flatMap(item => {
        const node = item.gridstackNode;
        const widget = item.querySelector(".widget");
        // Gridstack fires "added" before mountWidget attaches content.
        if (!node || !widget) return [];
        return [{
            id: widget.dataset.id,
            type: widget.dataset.type === "checklist" ? "checklist" : "text",
            x: node.x,
            y: node.y,
            w: node.w,
            h: node.h
        }];
    });
}

function saveLayout() {
    if (loading) return;
    localStorage.setItem("layout", JSON.stringify(serializeLayout()));
}

grid.on("change", saveLayout);
grid.on("added", saveLayout);
grid.on("removed", saveLayout);

// ---------- Widget DOM ----------

function createWidgetShell(id, type) {
    const widget = document.createElement("div");
    widget.className = "widget";
    widget.dataset.id = id;
    if (type === "checklist") widget.dataset.type = "checklist";

    const header = document.createElement("div");
    header.className = "widget-header";

    const del = document.createElement("button");
    del.type = "button";
    del.className = "delete-btn";
    del.textContent = "✕";
    del.setAttribute("aria-label", "Delete widget");
    del.addEventListener("click", () => {
        delete widgetData[id];
        saveWidgetData();
        grid.removeWidget(widget.closest(".grid-stack-item"));
    });

    header.appendChild(del);
    widget.appendChild(header);
    return widget;
}

function buildTextWidget(id, text) {
    const widget = createWidgetShell(id, "text");
    const textarea = document.createElement("textarea");
    textarea.className = "widget-text";
    textarea.placeholder = "Write here...";
    textarea.value = typeof text === "string" ? text : "";
    textarea.addEventListener("input", () => {
        widgetData[id] = textarea.value.slice(0, MAX_TEXT_LENGTH);
        saveWidgetData();
    });
    widget.appendChild(textarea);
    return widget;
}

function buildChecklistWidget(id, items) {
    const widget = createWidgetShell(id, "checklist");
    const list = document.createElement("div");
    list.className = "checklist";

    const save = () => {
        widgetData[id] = [...list.querySelectorAll(".check-item")].map(row => ({
            text: row.querySelector("input[type='text']").value.slice(0, MAX_ITEM_LENGTH),
            checked: row.querySelector("input[type='checkbox']").checked
        }));
        saveWidgetData();
    };

    const addRow = (item, placeholder) => {
        const row = document.createElement("label");
        row.className = "check-item";

        const box = document.createElement("input");
        box.type = "checkbox";
        box.checked = item.checked === true;

        const input = document.createElement("input");
        input.type = "text";
        input.value = typeof item.text === "string" ? item.text : "";
        if (placeholder) input.placeholder = placeholder;

        box.addEventListener("change", save);
        input.addEventListener("input", save);

        row.append(box, input);
        list.insertBefore(row, addBtn);
    };

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "add-item";
    addBtn.textContent = "＋ Add item";
    addBtn.addEventListener("click", () => {
        if (list.querySelectorAll(".check-item").length >= MAX_CHECKLIST_ITEMS) return;
        addRow({ text: "", checked: false }, "List item");
        save();
    });

    list.appendChild(addBtn);
    (Array.isArray(items) ? items : []).forEach(item => addRow(item));
    widget.appendChild(list);
    return widget;
}

function mountWidget(entry) {
    const el = grid.addWidget({
        x: entry.x,
        y: entry.y,
        w: entry.w,
        h: entry.h,
        autoPosition: entry.x === undefined
    });
    const contentEl = el.querySelector(".grid-stack-item-content") || el;
    const data = widgetData[entry.id];
    contentEl.appendChild(
        entry.type === "checklist"
            ? buildChecklistWidget(entry.id, data)
            : buildTextWidget(entry.id, data)
    );
    return el;
}

// Toolbar actions (called from index.html)
function addTextWidget() {
    mountWidget({ id: newId("widget"), type: "text", w: 3, h: 2 });
    saveLayout();
}

function addChecklistWidget() {
    mountWidget({ id: newId("checklist"), type: "checklist", w: 3, h: 3 });
    saveLayout();
}

function resetDashboard() {
    const confirmed = confirm(
        "This will clear all widgets and notes. Are you sure?"
    );

    if (!confirmed) return;

    grid.removeAll();
    localStorage.removeItem("layout");
    localStorage.removeItem("widgetData");

    widgetData = {};
}

// ---------- Initial load ----------

(function loadSavedLayout() {
    const layout = sanitizeLayout(readJson("layout", []));
    loading = true;
    grid.batchUpdate();
    layout.forEach(mountWidget);
    grid.batchUpdate(false);
    loading = false;
    // Rewrite in the safe v2 format (drops any legacy stored HTML).
    if (localStorage.getItem("layout") !== null) saveLayout();
})();

// ---------- Backup ----------

function exportDashboard() {
    const backup = {
        version: BACKUP_VERSION,
        exportedAt: new Date().toISOString(),
        dashboardTitle: (localStorage.getItem("dashboardTitle") || "Canvas").slice(0, TITLE_LIMIT),
        theme: normalizeTheme(localStorage.getItem("theme")),
        layout: serializeLayout(),
        widgetData
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `personal-canvas-backup-${date}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

function normalizeBackup(raw) {
    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
        throw new Error("Backup must be a JSON object");
    }

    if (!SUPPORTED_BACKUP_VERSIONS.has(raw.version)) {
        throw new Error("Unsupported backup version");
    }

    if (!Array.isArray(raw.layout)) {
        throw new Error("Backup layout is invalid");
    }

    if (
        typeof raw.widgetData !== "object" ||
        raw.widgetData === null ||
        Array.isArray(raw.widgetData)
    ) {
        throw new Error("Backup widget data is invalid");
    }

    const layout = sanitizeLayout(raw.layout);
    if (raw.layout.length > 0 && layout.length === 0) {
        throw new Error("Backup layout has no valid widgets");
    }

    const ids = new Set(layout.map(entry => entry.id));
    const widgetDataClean = Object.fromEntries(
        Object.entries(sanitizeWidgetData(raw.widgetData)).filter(([id]) => ids.has(id))
    );

    const dashboardTitle = String(raw.dashboardTitle || "Canvas")
        .trim()
        .slice(0, TITLE_LIMIT) || "Canvas";

    const exportedAt =
        typeof raw.exportedAt === "string" && !Number.isNaN(Date.parse(raw.exportedAt))
            ? raw.exportedAt
            : null;

    return {
        version: BACKUP_VERSION,
        exportedAt,
        dashboardTitle,
        theme: normalizeTheme(raw.theme),
        layout,
        widgetData: widgetDataClean
    };
}

function getBackupPreview(backup) {
    const exportedLabel = backup.exportedAt
        ? new Date(backup.exportedAt).toLocaleString()
        : "Unknown";

    return [
        "Restore this Personal Canvas backup?",
        "",
        `Title: ${backup.dashboardTitle}`,
        `Theme: ${backup.theme}`,
        `Widgets: ${backup.layout.length}`,
        `Exported: ${exportedLabel}`,
        "",
        "Your current canvas will be replaced."
    ].join("\n");
}

function importDashboard(file) {
    if (!file) return;

    if (file.size > MAX_BACKUP_BYTES) {
        alert("That backup is too large to import safely.");
        return;
    }

    const reader = new FileReader();

    reader.onload = () => {
        try {
            const backup = normalizeBackup(JSON.parse(reader.result));

            const confirmed = confirm(getBackupPreview(backup));

            if (!confirmed) return;

            localStorage.setItem("dashboardTitle", backup.dashboardTitle);
            localStorage.setItem("theme", backup.theme);
            localStorage.setItem("layout", JSON.stringify(backup.layout));
            localStorage.setItem("widgetData", JSON.stringify(backup.widgetData));

            window.location.reload();
        } catch (error) {
            console.error("Could not import dashboard backup", error);
            alert("That file is not a valid Personal Canvas backup.");
        }
    };

    reader.readAsText(file);
}
