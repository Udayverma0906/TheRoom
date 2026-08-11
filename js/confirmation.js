// ============================================================
// confirmation.js — final step: show the digital ticket, fire off
// the two confirmation emails, and let the user start a new booking.
// ============================================================

import { getBooking, clearBooking } from "./state.js";
import { guardStep } from "./nav.js";
import { sendBookingEmails, buildGuestNotificationHtml, buildHostNotificationHtml, formatShowtimeText } from "./email.js";

function initConfirmationPage() {
  if (!guardStep(["completed"])) return;

  const booking = getBooking();
  renderTicket(booking);
  renderNotificationPreview(booking);
  sendEmails(booking);

  const homeBtn = document.querySelector("[data-back-home]");
  if (homeBtn) {
    homeBtn.addEventListener("click", () => {
      clearBooking();
      window.location.href = "index.html";
    });
  }
}

function renderNotificationPreview(booking) {
  const guestEl = document.querySelector("[data-guest-notification-preview]");
  const hostEl = document.querySelector("[data-host-notification-preview]");
  if (guestEl) guestEl.innerHTML = buildGuestNotificationHtml(booking);
  if (hostEl) hostEl.innerHTML = buildHostNotificationHtml(booking);
}

function renderTicket(booking) {
  const nameEl = document.querySelector("[data-guest-name]");
  if (nameEl) nameEl.textContent = booking.guest.name.split(" ")[0];

  const setText = (selector, value) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  };

  setText("[data-ticket-movie]", booking.movie.title);
  setText("[data-ticket-guest]", booking.guest.name);
  setText("[data-ticket-seat]", booking.seat.name);

  const refreshmentsText = booking.refreshments.length
    ? booking.refreshments.map((r) => `${r.name} × ${r.qty} · ${r.timing || "beginning"}`).join(" + ")
    : "None";
  setText("[data-ticket-showtime]", formatShowtimeText(booking));
  setText("[data-ticket-food]", refreshmentsText);
  setText("[data-ticket-total]", `₹${booking.pricing.finalTotal}`);
  setText("[data-ticket-id]", `BOOKING ID ${booking.bookingId} · ${booking.createdAt}`);
}

function setEmailPopup(type, message) {
  const popupEl = document.querySelector("[data-email-status]");
  const messageEl = document.querySelector("[data-email-status-message]");
  const closeBtn = document.querySelector("[data-email-close]");

  if (!popupEl || !messageEl) return;

  popupEl.hidden = false;
  popupEl.classList.remove("success", "error");
  if (type) popupEl.classList.add(type);
  messageEl.textContent = message;

  if (closeBtn) {
    closeBtn.onclick = () => {
      popupEl.hidden = true;
    };
  }
}

async function sendEmails(booking) {
  setEmailPopup("", "Sending your confirmation email…");

  const result = await sendBookingEmails(booking);

  if (result.customerSent) {
    setEmailPopup(
      "success",
      "Your confirmation email is on its way. Please check your spam folder if it doesn’t appear in your inbox."
    );
  } else {
    setEmailPopup("error", "We couldn’t send the email. Please try again and check your spam folder if needed.");
  }
}

export { initConfirmationPage };
