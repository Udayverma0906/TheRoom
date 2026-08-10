// ============================================================
// main.js — the one script every page loads. It looks at
// <body data-page="..."> and boots the matching page module.
// Keeping one entry point per page makes each page independently
// debuggable (open its file, see its own init function).
// ============================================================

import { initLandingPage } from "./landing.js";
import { initPersonalPage } from "./personal.js";
import { initMoviesPage } from "./movies.js";
import { initSeatsPage } from "./seats.js";
import { initRefreshmentsPage } from "./refreshments.js";
import { initBillPage } from "./bill.js";
import { initConfirmationPage } from "./confirmation.js";
import { isStorageAvailable } from "./state.js";
import { showToast } from "./toast.js";

const page = document.body.dataset.page;

function initThemeToggle() {
  const savedTheme = localStorage.getItem("privateCinema.theme") || "dark";
  if (savedTheme === "light") document.body.classList.add("light-mode");

  const existing = document.querySelector("[data-theme-toggle]");
  if (existing) return;

  const toggle = document.createElement("button");
  toggle.className = "theme-toggle";
  toggle.type = "button";
  toggle.setAttribute("data-theme-toggle", "");
  toggle.setAttribute("aria-label", "Toggle color theme");
  toggle.innerHTML = "☀️";
  document.querySelector(".topbar-inner")?.appendChild(toggle);

  toggle.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("light-mode");
    localStorage.setItem("privateCinema.theme", isLight ? "light" : "dark");
    toggle.innerHTML = isLight ? "🌙" : "☀️";
  });
}

if (!isStorageAvailable()) {
  showToast(
    "Your browser is blocking local storage, so your booking won't be saved between pages.",
    "danger",
    5000
  );
}

initThemeToggle();

switch (page) {
  case "landing":
    initLandingPage();
    break;
  case "personal":
    initPersonalPage();
    break;
  case "movies":
    initMoviesPage();
    break;
  case "seats":
    initSeatsPage();
    break;
  case "refreshments":
    initRefreshmentsPage();
    break;
  case "bill":
    initBillPage();
    break;
  case "confirmation":
    initConfirmationPage();
    break;
  default:
    console.warn(`No page module for data-page="${page}"`);
}
