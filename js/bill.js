// ============================================================
// bill.js — step 5: show the (fake, inflated) bill, then reveal the
// 100%-off private-cinema coupon before sending the user to their ticket.
// ============================================================

import { getBooking, updateBooking, generateBookingId } from "./state.js";
import { renderProgress, guardStep } from "./nav.js";
import { computePricing } from "./pricing.js";

function initBillPage() {
  if (!guardStep(["guest", "movie", "seat"])) return;
  renderProgress("bill");

  const booking = getBooking();
  const pricing = computePricing(booking, false);
  updateBooking({ pricing });

  renderSummary(booking, pricing);

  const completeBtn = document.querySelector("[data-complete-btn]");
  if (completeBtn) {
    completeBtn.addEventListener("click", () => runCouponSequence(pricing.subtotal));
  }
}

function renderSummary(booking, pricing) {
  const detailsEl = document.querySelector("[data-booking-details]");
  if (detailsEl) {
    detailsEl.innerHTML = `
      <div class="bill-row"><span class="k">Name</span><span class="v">${booking.guest.name}</span></div>
      <div class="bill-row"><span class="k">Email</span><span class="v">${booking.guest.email}</span></div>
      <div class="bill-row"><span class="k">Movie</span><span class="v">${booking.movie.title}</span></div>
      <div class="bill-row"><span class="k">Showtime</span><span class="v">${booking.movie.showtime ? booking.movie.showtime.charAt(0).toUpperCase() + booking.movie.showtime.slice(1) : "Sunset start"}</span></div>
      <div class="bill-row"><span class="k">Seat</span><span class="v">${booking.seat.name}</span></div>
      <div class="bill-row"><span class="k">Experience</span><span class="v">Private Home Cinema · One Bed</span></div>
    `;
  }

  const refreshEl = document.querySelector("[data-refresh-details]");
  if (refreshEl) {
    if (booking.refreshments.length === 0) {
      refreshEl.innerHTML = `<div class="bill-row"><span class="k">Refreshments</span><span class="v">None selected</span></div>`;
    } else {
      refreshEl.innerHTML = booking.refreshments
        .map(
          (r) =>
            `<div class="bill-row"><span class="k">${r.name} (${r.size}) × ${r.qty} · ${r.timing || "beginning"}</span><span class="v">₹${r.unitPrice * r.qty}</span></div>`
        )
        .join("");
    }
  }

  const priceEl = document.querySelector("[data-price-details]");
  if (priceEl) {
    priceEl.innerHTML = `
      <div class="bill-row"><span class="k">Private Cinema Fee</span><span class="v">₹${pricing.movieFee}</span></div>
      <div class="bill-row"><span class="k">Premium Comfort Fee</span><span class="v">₹${pricing.comfortFee}</span></div>
      <div class="bill-row"><span class="k">Entertainment Fee</span><span class="v">₹${pricing.entertainmentFee}</span></div>
      <div class="bill-row"><span class="k">Refreshments</span><span class="v">₹${pricing.refreshments}</span></div>
      <div class="bill-row"><span class="k">Convenience Fee</span><span class="v">₹${pricing.convenienceFee}</span></div>
      <div class="bill-row total"><span class="k">Total</span><span class="v">₹${pricing.subtotal}</span></div>
    `;
  }
}

function runCouponSequence(subtotal) {
  const overlay = document.querySelector("[data-modal-overlay]");
  const flip = document.querySelector("[data-ticket-flip]");
  const couponName = document.querySelector("[data-coupon-name]");
  const priceCount = document.querySelector("[data-price-count]");
  const fromEl = priceCount.querySelector(".from");
  const toEl = priceCount.querySelector(".to");
  const continueBtn = document.querySelector("[data-modal-continue]");

  fromEl.textContent = `₹${subtotal}`;
  toEl.textContent = `₹${subtotal}`;
  couponName.classList.remove("show");
  priceCount.classList.remove("show");
  flip.classList.remove("flipped");
  continueBtn.classList.add("hidden");

  overlay.classList.add("show");
  document.body.style.overflow = "hidden";

  // Beat 1: flip the mystery card into the coupon.
  setTimeout(() => flip.classList.add("flipped"), 500);

  // Beat 2: reveal the coupon name + confetti.
  setTimeout(() => {
    couponName.classList.add("show");
    launchConfetti();
  }, 1300);

  // Beat 3: count the price down from subtotal to ₹0.
  setTimeout(() => {
    priceCount.classList.add("show");
    animateCountdown(toEl, subtotal, 0, 900);
  }, 1900);

  // Beat 4: reveal the continue button.
  setTimeout(() => {
    continueBtn.classList.remove("hidden");
  }, 2900);

  continueBtn.onclick = () => finalizeBooking(subtotal);
}

function animateCountdown(el, from, to, duration) {
  const start = performance.now();
  function frame(now) {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(from + (to - from) * eased);
    el.textContent = `₹${value}`;
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function launchConfetti() {
  const colors = ["#e8a33d", "#f0c27a", "#c4443b", "#f2ede4", "#6fbf8b"];
  const layer = document.createElement("div");
  layer.className = "confetti-layer";
  document.body.appendChild(layer);

  for (let i = 0; i < 70; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = `${1.6 + Math.random() * 1.4}s`;
    piece.style.animationDelay = `${Math.random() * 0.3}s`;
    piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    layer.appendChild(piece);
  }

  setTimeout(() => layer.remove(), 3200);
}

function finalizeBooking(subtotal) {
  const pricing = computePricing(getBooking(), true);
  updateBooking({
    pricing,
    completed: true,
    bookingId: generateBookingId(),
    createdAt: new Date().toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }),
  });
  window.location.href = "confirmation.html";
}

export { initBillPage };
