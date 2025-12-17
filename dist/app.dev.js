"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

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
  setTimeout(function () {
    Object.entries(widgetData).forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          id = _ref2[0],
          text = _ref2[1];

      addTextWidget(id, text);
    });
  }, 100);
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
//# sourceMappingURL=app.dev.js.map
