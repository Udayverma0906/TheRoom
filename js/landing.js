// ============================================================
// landing.js — the cinematic entry point.
// ============================================================

import { movies } from "./movies-data.js";
import { clearBooking } from "./state.js";

const FUN_LINES = [
  "No ads. No strangers. No screaming kids.",
  "Unlimited legroom activated.",
  "Your armrest belongs to you.",
  "Pause the movie whenever you want.",
  "Yes, you can bring your own blanket.",
  "Showtime is your call, not the clock’s.",
  "The couch is officially your VIP lounge.",
];

function initLandingPage() {
  // Starting a fresh visit to the landing page means starting a fresh booking.
  clearBooking();

  renderMovieStrip();
  startCountdown();
  rotateFunLine();

  const bookBtn = document.querySelector("[data-book-btn]");
  if (bookBtn) {
    bookBtn.addEventListener("click", () => {
      window.location.href = "personal.html";
    });
  }
}

function renderMovieStrip() {
  const strip = document.querySelector("[data-movie-strip]");
  if (!strip) return;

  strip.innerHTML = movies
    .map(
      (m) => `
      <div class="mini-card">
        <img class="mini-poster" src="${m.poster}" alt="${m.title} poster" loading="lazy" />
        <div class="mini-body">
          <div class="title">${m.title}</div>
          <div class="meta">${m.genre} · ${m.duration}</div>
        </div>
      </div>`
    )
    .join("");
}

function startCountdown() {
  const el = document.querySelector("[data-countdown]");
  if (!el) return;

  // Purely decorative — resets to a fresh ~2-3 hour window each load.
  let totalSeconds = 2 * 3600 + 14 * 60 + 32;

  function tick() {
    if (totalSeconds <= 0) totalSeconds = 2 * 3600 + 14 * 60 + 32;
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const s = String(totalSeconds % 60).padStart(2, "0");
    el.textContent = `${h}:${m}:${s}`;
    totalSeconds--;
  }

  tick();
  setInterval(tick, 1000);
}

function rotateFunLine() {
  const el = document.querySelector("[data-fun-line]");
  if (!el) return;
  let i = 0;
  el.textContent = FUN_LINES[i];
  setInterval(() => {
    i = (i + 1) % FUN_LINES.length;
    el.style.opacity = "0";
    setTimeout(() => {
      el.textContent = FUN_LINES[i];
      el.style.opacity = "1";
    }, 250);
  }, 3200);
}

export { initLandingPage };
