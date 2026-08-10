// ============================================================
// nav.js — progress indicator + step guards shared by every page.
// Keeping this centralized means the flow order only lives in one place.
// ============================================================

import { getBooking } from "./state.js";
import { showToast } from "./toast.js";

const STEPS = [
  { key: "personal", label: "Info", href: "personal.html" },
  { key: "movies", label: "Movie", href: "movies.html" },
  { key: "seats", label: "Seat", href: "seats.html" },
  { key: "refreshments", label: "Snacks", href: "refreshments.html" },
  { key: "bill", label: "Confirm", href: "bill.html" },
];

/** Render the dot progress bar into any element with [data-progress]. */
function renderProgress(activeKey) {
  const mount = document.querySelector("[data-progress]");
  if (!mount) return;

  const activeIndex = STEPS.findIndex((s) => s.key === activeKey);
  const track = document.createElement("div");
  track.className = "progress-track";

  STEPS.forEach((step, i) => {
    const dot = document.createElement("div");
    dot.className = "progress-dot";
    if (i < activeIndex) dot.classList.add("done");
    if (i === activeIndex) dot.classList.add("active");
    track.appendChild(dot);
  });

  const label = document.createElement("div");
  label.className = "progress-label";
  const current = STEPS[activeIndex];
  label.textContent = current
    ? `STEP ${activeIndex + 1} OF ${STEPS.length} · ${current.label.toUpperCase()}`
    : "";

  mount.innerHTML = "";
  mount.appendChild(track);
  mount.appendChild(label);
}

/**
 * Redirect away if a required piece of booking data is missing,
 * so users can't jump straight to /bill.html without picking anything.
 * Returns true if the guard passed (safe to continue rendering the page).
 */
function guardStep(requirement) {
  const booking = getBooking();

  const checks = {
    guest: () => booking.guest.name && booking.guest.email,
    movie: () => Boolean(booking.movie.id),
    seat: () => Boolean(booking.seat.id),
    completed: () => Boolean(booking.completed),
  };

  const messages = {
    guest: "Let's start with your name and email first.",
    movie: "Pick a movie before choosing your seat.",
    seat: "Choose your seat before ordering snacks.",
    completed: "Complete your booking first — let's get you there.",
  };

  const fallbacks = {
    guest: "personal.html",
    movie: "movies.html",
    seat: "seats.html",
    completed: "personal.html",
  };

  for (const req of requirement) {
    if (!checks[req] || !checks[req]()) {
      showToast(messages[req], "danger");
      setTimeout(() => {
        window.location.href = fallbacks[req];
      }, 900);
      return false;
    }
  }
  return true;
}

export { STEPS, renderProgress, guardStep };
