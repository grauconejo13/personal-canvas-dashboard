"use strict";

var widgetData = JSON.parse(localStorage.getItem("widgetData")) || {}; // Theme

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

var savedLayout = JSON.parse(localStorage.getItem("layout"));

if (savedLayout) {
  grid.load(savedLayout);
  setTimeout(hydrateWidgetText, 100);
} // Save layout on change


grid.on("change", function () {
  localStorage.setItem("layout", JSON.stringify(grid.save()));
}); // Add text widget

function addTextWidget() {
  var savedId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  var savedText = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
  var widgetId = savedId || "widget-".concat(Date.now());
  grid.addWidget({
    w: 3,
    h: 2,
    content: "\n      <div class=\"widget\" data-id=\"".concat(widgetId, "\">\n        <div class=\"widget-header\">\n          <button class=\"delete-btn\">\u2715</button>\n        </div>\n        <textarea\n          class=\"widget-text\"\n          placeholder=\"Write here...\">").concat(savedText, "</textarea>\n      </div>\n    ")
  });
  attachWidgetEvents();
}

function attachWidgetEvents() {
  document.querySelectorAll(".delete-btn").forEach(function (btn) {
    btn.onclick = function (e) {
      var item = e.target.closest(".grid-stack-item");
      var widget = e.target.closest(".widget");
      var id = widget.dataset.id;
      delete widgetData[id];
      localStorage.setItem("widgetData", JSON.stringify(widgetData));
      grid.removeWidget(item);
    };
  });
  attachTextPersistence();
}

function attachTextPersistence() {
  document.querySelectorAll(".widget-text").forEach(function (textarea) {
    textarea.oninput = function (e) {
      var widget = e.target.closest(".widget");
      var id = widget.dataset.id;
      widgetData[id] = e.target.value;
      localStorage.setItem("widgetData", JSON.stringify(widgetData));
    };
  });
}

function resetDashboard() {
  var confirmed = confirm("This will clear all widgets and notes. Are you sure?");
  if (!confirmed) return;
  grid.removeAll();
  localStorage.removeItem("layout");
  localStorage.removeItem("widgetData");
  widgetData = {};
}

function hydrateWidgetText() {
  document.querySelectorAll(".widget").forEach(function (widget) {
    var id = widget.dataset.id;
    var textarea = widget.querySelector(".widget-text");

    if (widgetData[id]) {
      textarea.value = widgetData[id];
    }
  });
  attachWidgetEvents();
}
//# sourceMappingURL=app.dev.js.map
