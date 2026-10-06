(function () {
  "use strict";

  // Runs at the top of <body>, so the theme is set before the page paints.
  // The visitor's choice is kept in sessionStorage; with no choice yet, follow the system setting.
  var STORAGE_KEY = "theme";
  var body = document.body;

  function readChoice() {
    try {
      return sessionStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function saveChoice(value) {
    try {
      sessionStorage.setItem(STORAGE_KEY, value);
    } catch (e) {
      // Storage unavailable (e.g. private mode): the toggle still works for this page view.
    }
  }

  var saved = readChoice();
  var startDark = saved
    ? saved === "dark"
    : window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

  body.classList.toggle("dark", startDark);

  function syncButton(button) {
    var isDark = body.classList.contains("dark");
    button.textContent = isDark ? "Light mode" : "Dark mode";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var button = document.getElementById("theme-toggle");
    if (!button) {
      return;
    }

    syncButton(button);

    button.addEventListener("click", function () {
      var isDark = body.classList.toggle("dark");
      saveChoice(isDark ? "dark" : "light");
      syncButton(button);
    });
  });
})();
