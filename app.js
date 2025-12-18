let widgetData = JSON.parse(localStorage.getItem("widgetData")) || {};

const titleEl = document.getElementById("dashboard-title");

// Load saved title
const savedTitle = localStorage.getItem("dashboardTitle");
if (savedTitle) {
    titleEl.textContent = savedTitle;
}

// Save on edit
titleEl.addEventListener("input", () => {
    localStorage.setItem("dashboardTitle", titleEl.textContent.trim());
});


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
    disableOneColumnMode: false
});

// Load saved layout
const savedLayout = JSON.parse(localStorage.getItem("layout"));
if (savedLayout) {
    grid.load(savedLayout);
    setTimeout(hydrateWidgetText, 100);
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

function hydrateWidgetText() {
    document.querySelectorAll(".widget").forEach(widget => {
        const id = widget.dataset.id;
        const textarea = widget.querySelector(".widget-text");

        if (widgetData[id]) {
            textarea.value = widgetData[id];
        }
    });

    attachWidgetEvents();
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

function hydrateWidgetText() {
    document.querySelectorAll(".widget").forEach(widget => {
        const id = widget.dataset.id;
        const type = widget.dataset.type;

        if (type === "checklist" && widgetData[id]) {
            addChecklistWidget(id, widgetData[id]);
        }

        if (!type && widgetData[id]) {
            widget.querySelector(".widget-text").value = widgetData[id];
        }
    });

    attachWidgetEvents();
}