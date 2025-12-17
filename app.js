let widgetData = JSON.parse(localStorage.getItem("widgetData")) || {};

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

    setTimeout(() => {
        Object.entries(widgetData).forEach(([id, text]) => {
            addTextWidget(id, text);
        });
    }, 100);
}

// Save layout on change
grid.on("change", () => {
    localStorage.setItem("layout", JSON.stringify(grid.save()));
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