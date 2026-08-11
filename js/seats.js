// ============================================================
// seats.js — step 3: "choose your comfort zone". Only 2 seats exist
// because this is a private home projector, not a real cinema.
// ============================================================

import { getBooking, updateBooking } from "./state.js";
import { renderProgress, guardStep } from "./nav.js";

const SEATS = [
  { id: "bed-01", name: "Private Bed", sub: "One personal bed · Stretch, lounge, and settle in your way" },
];

function initSeatsPage() {
  if (!guardStep(["guest", "movie"])) return;
  renderProgress("seats");

  const booking = getBooking();
  renderSeats(booking.seat.id);
  wireContinue(booking.seat.id);
}

function renderSeats(selectedId) {
  const hall = document.querySelector("[data-seat-hall]");
  if (!hall) return;

  hall.innerHTML = SEATS.map(
    (seat) => `
    <div class="seat-unit${seat.id === selectedId ? " selected" : ""}" data-seat-id="${seat.id}">
            <div class="screen-wrap">
            <div class="screen"></div>
            <div class="screen-label">Screen this way</div>
          </div>
      <div class="seat-icon">
        <span class="beam"></span>
        <span>🛏️</span>
      </div>
      <div class="seat-name">${seat.name}</div>
      <div class="seat-sub">${seat.sub}</div>
    </div>`
  ).join("");

  hall.querySelectorAll(".seat-unit").forEach((unit) => {
    unit.addEventListener("click", () => handleSelect(unit.dataset.seatId));
  });

  if (selectedId) showConfirmCard(selectedId);
}

function handleSelect(seatId) {
  const seat = SEATS.find((s) => s.id === seatId);
  if (!seat) return;

  document.querySelectorAll(".seat-unit").forEach((u) => {
    u.classList.toggle("selected", u.dataset.seatId === seatId);
  });

  updateBooking({ seat: { id: seat.id, name: seat.name } });
  showConfirmCard(seatId);
  wireContinue(seatId);
}

function showConfirmCard(seatId) {
  const card = document.querySelector("[data-seat-confirm]");
  const seat = SEATS.find((s) => s.id === seatId);
  if (!card || !seat) return;
  card.querySelector("[data-seat-confirm-name]").textContent = seat.name;
  card.classList.add("show");
}

function wireContinue(seatId) {
  const btn = document.querySelector("[data-continue-btn]");
  if (!btn) return;
  btn.disabled = !seatId;
  btn.onclick = () => {
    if (!seatId) return;
    window.location.href = "refreshments.html";
  };
}

export { initSeatsPage };
