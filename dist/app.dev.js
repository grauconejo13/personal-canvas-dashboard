"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

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
  localStorage.setItem("layout", JSON.stringify(grid.save(true)));
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

function addChecklistWidget() {
  var savedId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  var savedItems = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var widgetId = savedId || "checklist-".concat(Date.now());
  var itemsHTML = savedItems.map(function (item) {
    return "\n      <label class=\"check-item\">\n        <input type=\"checkbox\" ".concat(item.checked ? "checked" : "", " />\n        <input type=\"text\" value=\"").concat(item.text, "\" />\n      </label>\n    ");
  }).join("");
  grid.addWidget({
    w: 3,
    h: 3,
    content: "\n      <div class=\"widget\" data-id=\"".concat(widgetId, "\" data-type=\"checklist\">\n        <div class=\"widget-header\">\n          <button class=\"delete-btn\">\u2715</button>\n        </div>\n        <div class=\"checklist\">\n          ").concat(itemsHTML, "\n          <button class=\"add-item\">\uFF0B Add item</button>\n        </div>\n      </div>\n    ")
  });
  attachWidgetEvents();
  attachChecklistEvents();
}

function attachChecklistEvents() {
  document.querySelectorAll(".widget[data-type='checklist']").forEach(function (widget) {
    var id = widget.dataset.id;

    var save = function save() {
      var items = _toConsumableArray(widget.querySelectorAll(".check-item")).map(function (row) {
        return {
          text: row.querySelector("input[type='text']").value,
          checked: row.querySelector("input[type='checkbox']").checked
        };
      });

      widgetData[id] = items;
      localStorage.setItem("widgetData", JSON.stringify(widgetData));
    };

    widget.querySelectorAll("input").forEach(function (input) {
      input.oninput = save;
      input.onchange = save;
    });

    widget.querySelector(".add-item").onclick = function () {
      var row = document.createElement("label");
      row.className = "check-item";
      row.innerHTML = "\n        <input type=\"checkbox\" />\n        <input type=\"text\" placeholder=\"List item\" />\n      ";
      widget.querySelector(".checklist").insertBefore(row, widget.querySelector(".add-item"));
      attachChecklistEvents();
      save();
    };
  });
}
//# sourceMappingURL=app.dev.js.map
