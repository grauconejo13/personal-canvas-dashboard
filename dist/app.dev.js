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
  var widgetId = "widget-".concat(Date.now());
  grid.addWidget({
    w: 3,
    h: 2,
    content: "\n      <div class=\"widget\" data-id=\"".concat(widgetId, "\">\n        <div class=\"widget-header\">\n          <button class=\"delete-btn\">\u2715</button>\n        </div>\n        <textarea\n          placeholder=\"Write here...\"\n          class=\"widget-text\">\n        </textarea>\n      </div>\n    ")
  });
  attachWidgetEvents();
}

function attachWidgetEvents() {
  document.querySelectorAll(".delete-btn").forEach(function (btn) {
    btn.onclick = function (e) {
      var item = e.target.closest(".grid-stack-item");
      grid.removeWidget(item);
    };
  });
}
//# sourceMappingURL=app.dev.js.map
