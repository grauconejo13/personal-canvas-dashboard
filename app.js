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
    grid.addWidget({
        w: 3,
        h: 2,
        content: `
      <div class="widget">
        <textarea
          placeholder="Write here..."
          style="width:100%;height:100%;background:transparent;border:none;color:inherit;resize:none;">
        </textarea>
      </div>
    `
    });
}