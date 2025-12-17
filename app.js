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
const saved = JSON.parse(localStorage.getItem("layout"));
if (saved) {
    grid.load(saved);
}

// Save layout on change
grid.on("change", () => {
    localStorage.setItem("layout", JSON.stringify(grid.save()));
});

// Add text widget
function addTextWidget() {
    const widgetId = `widget-${Date.now()}`;

    grid.addWidget({
        w: 3,
        h: 2,
        content: `
      <div class="widget" data-id="${widgetId}">
        <div class="widget-header">
          <button class="delete-btn">✕</button>
        </div>
        <textarea
          placeholder="Write here..."
          class="widget-text">
        </textarea>
      </div>
    `
    });

    attachWidgetEvents();
}

function attachWidgetEvents() {
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.onclick = (e) => {
            const item = e.target.closest(".grid-stack-item");
            grid.removeWidget(item);
        };
    });
}