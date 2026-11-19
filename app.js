let widgetData = JSON.parse(localStorage.getItem("widgetData")) || {};

const titleEl = document.getElementById("dashboard-title");
const TITLE_LIMIT = 32;

// Load saved title
const savedTitle = localStorage.getItem("dashboardTitle");
if (savedTitle) {
    titleEl.textContent = savedTitle;
}

// Enforce limit + save
titleEl.addEventListener("input", () => {
    if (titleEl.textContent.length > TITLE_LIMIT) {
        titleEl.textContent = titleEl.textContent.slice(0, TITLE_LIMIT);
        placeCaretAtEnd(titleEl);
    }
    localStorage.setItem("dashboardTitle", titleEl.textContent.trim());
});

// Helper to keep cursor at end
function placeCaretAtEnd(el) {
    el.focus();
    document.getSelection().selectAllChildren(el);
    document.getSelection().collapseToEnd();
}

// Theme
document.documentElement.dataset.theme =
    localStorage.getItem("theme") || "dark";

function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
}

// Init Gridstack
const grid = GridStack.init({
    float: true,
    cellHeight: 120,
    disableOneColumnMode: false,
    oneColumnSize: 600
});


// Load saved layout
const savedLayout = JSON.parse(localStorage.getItem("layout"));
if (savedLayout) {
    grid.load(savedLayout);
    setTimeout(hydrateWidgets, 100);
}

// Save layout on change
grid.on("change", () => {
    localStorage.setItem("layout", JSON.stringify(grid.save(true)));
});

// Add text widget
function addTextWidget(savedId = null, savedText = "") {
    const widgetId = savedId || `widget-${Date.now()}`;

    grid.addWidget({
        w: 3,
        h: 2,
        content: `
      <div class="widget" data-id="${widgetId}">
        <div class="widget-header">
          <button class="delete-btn">✕</button>
        </div>
        <textarea
          class="widget-text"
          placeholder="Write here...">${savedText}</textarea>
      </div>
    `
    });

    attachWidgetEvents();
}

function attachWidgetEvents() {
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.onclick = (e) => {
            const item = e.target.closest(".grid-stack-item");
            const widget = e.target.closest(".widget");
            const id = widget.dataset.id;

            delete widgetData[id];
            localStorage.setItem("widgetData", JSON.stringify(widgetData));

            grid.removeWidget(item);
        };
    });

    attachTextPersistence();
}

function attachTextPersistence() {
    document.querySelectorAll(".widget-text").forEach(textarea => {
        textarea.oninput = (e) => {
            const widget = e.target.closest(".widget");
            const id = widget.dataset.id;
            widgetData[id] = e.target.value;
            localStorage.setItem("widgetData", JSON.stringify(widgetData));
        };
    });
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


function addChecklistWidget(savedId = null, savedItems = []) {
    const widgetId = savedId || `checklist-${Date.now()}`;

    const itemsHTML = savedItems.map(
        item => `
      <label class="check-item">
        <input type="checkbox" ${item.checked ? "checked" : ""} />
        <input type="text" value="${item.text}" />
      </label>
    `
    ).join("");

    grid.addWidget({
        w: 3,
        h: 3,
        content: `
      <div class="widget" data-id="${widgetId}" data-type="checklist">
        <div class="widget-header">
          <button class="delete-btn">✕</button>
        </div>
        <div class="checklist">
          ${itemsHTML}
          <button class="add-item">＋ Add item</button>
        </div>
      </div>
    `
    });

    attachWidgetEvents();
    attachChecklistEvents();
}

function attachChecklistEvents() {
    document.querySelectorAll(".widget[data-type='checklist']").forEach(widget => {
        const id = widget.dataset.id;

        const save = () => {
            const items = [...widget.querySelectorAll(".check-item")].map(row => ({
                text: row.querySelector("input[type='text']").value,
                checked: row.querySelector("input[type='checkbox']").checked
            }));

            widgetData[id] = items;
            localStorage.setItem("widgetData", JSON.stringify(widgetData));
        };

        widget.querySelectorAll("input").forEach(input => {
            input.oninput = save;
            input.onchange = save;
        });

        widget.querySelector(".add-item").onclick = () => {
            const row = document.createElement("label");
            row.className = "check-item";
            row.innerHTML = `
        <input type="checkbox" />
        <input type="text" placeholder="List item" />
      `;
            widget.querySelector(".checklist").insertBefore(row, widget.querySelector(".add-item"));
            attachChecklistEvents();
            save();
        };
    });
}

function hydrateWidgets() {
    document.querySelectorAll(".widget").forEach(widget => {
        const id = widget.dataset.id;
        const type = widget.dataset.type;

        // TEXT WIDGET
        if (!type && widgetData[id]) {
            const textarea = widget.querySelector(".widget-text");
            if (textarea) textarea.value = widgetData[id];
        }

        // CHECKLIST WIDGET
        if (type === "checklist" && widgetData[id]) {
            const list = widget.querySelector(".checklist");
            const addBtn = list.querySelector(".add-item");

            // Clear existing items
            list.querySelectorAll(".check-item").forEach(i => i.remove());

            widgetData[id].forEach(item => {
                const row = document.createElement("label");
                row.className = "check-item";
                row.innerHTML = `
          <input type="checkbox" ${item.checked ? "checked" : ""} />
          <input type="text" value="${item.text}" />
        `;
                list.insertBefore(row, addBtn);
            });
        }
    });

    attachWidgetEvents();
    attachChecklistEvents();
}

function exportDashboard() {
    const backup = {
        version: 1,
        exportedAt: new Date().toISOString(),
        dashboardTitle: localStorage.getItem("dashboardTitle") || "Canvas",
        theme: localStorage.getItem("theme") || "dark",
        layout: JSON.parse(localStorage.getItem("layout") || "[]"),
        widgetData: JSON.parse(localStorage.getItem("widgetData") || "{}")
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

function importDashboard(file) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
        try {
            const backup = JSON.parse(reader.result);

            if (
                backup.version !== 1 ||
                !Array.isArray(backup.layout) ||
                typeof backup.widgetData !== "object" ||
                backup.widgetData === null
            ) {
                throw new Error("Unsupported backup format");
            }

            const confirmed = confirm(
                "Importing this backup will replace the current canvas. Continue?"
            );

            if (!confirmed) return;

            localStorage.setItem(
                "dashboardTitle",
                String(backup.dashboardTitle || "Canvas").slice(0, TITLE_LIMIT)
            );
            localStorage.setItem("theme", String(backup.theme || "dark"));
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
