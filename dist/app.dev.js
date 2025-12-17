"use strict";

// Theme
document.documentElement.dataset.theme = localStorage.getItem("theme") || "dark";

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("theme", theme);
} // Init Gridstack


var grid = GridStack.init({
  "float": true,
  cellHeight: 120,
  disableOneColumnMode: false
}); // Load saved layout

var saved = JSON.parse(localStorage.getItem("layout"));

if (saved) {
  grid.load(saved);
} // Save layout on change


grid.on("change", function () {
  localStorage.setItem("layout", JSON.stringify(grid.save()));
}); // Add text widget

function addTextWidget() {
  grid.addWidget({
    w: 3,
    h: 2,
    content: "\n      <div class=\"widget\">\n        <textarea\n          placeholder=\"Write here...\"\n          style=\"width:100%;height:100%;background:transparent;border:none;color:inherit;resize:none;\">\n        </textarea>\n      </div>\n    "
  });
}
//# sourceMappingURL=app.dev.js.map
