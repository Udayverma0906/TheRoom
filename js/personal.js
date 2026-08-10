// ============================================================
// personal.js — step 1: collect name + email, validate, save.
// ============================================================

import { getBooking, updateBooking } from "./state.js";
import { renderProgress } from "./nav.js";
import { showToast } from "./toast.js";

function initPersonalPage() {
  renderProgress("personal");

  const form = document.querySelector("#personal-form");
  const nameField = document.querySelector("#guest-name");
  const emailField = document.querySelector("#guest-email");
  const extraEmailsField = document.querySelector("#guest-extra-emails");
  const notifyHostField = document.querySelector("#notify-host");
  if (!form) return;

  // Pre-fill if the user already entered details earlier.
  const booking = getBooking();
  if (booking.guest.name) nameField.value = booking.guest.name;
  if (booking.guest.email) emailField.value = booking.guest.email;
  if (booking.guest.extraEmails) extraEmailsField.value = booking.guest.extraEmails;
  if (typeof booking.guest.copyHost === "boolean") notifyHostField.checked = booking.guest.copyHost;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = nameField.value.trim();
    const email = emailField.value.trim();
    const extraEmails = (extraEmailsField?.value || "").trim();
    const copyHost = notifyHostField ? notifyHostField.checked : true;

    const nameOk = validateField(nameField, name.length >= 2, "Please enter your full name.");
    const emailOk = validateField(
      emailField,
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      "Please enter a valid email address."
    );
    const extraEmailsOk = validateEmailList(extraEmailsField, extraEmails);

    if (!nameOk || !emailOk || !extraEmailsOk) {
      showToast("Please fix the highlighted fields.", "danger");
      return;
    }

    updateBooking({ guest: { name, email, extraEmails, copyHost } });
    window.location.href = "movies.html";
  });

  // Clear error state as the user types.
  [nameField, emailField, extraEmailsField].forEach((field) => {
    if (!field) return;
    field.addEventListener("input", () => {
      field.closest(".field").classList.remove("has-error");
    });
  });
}

function validateEmailList(fieldEl, rawValue) {
  if (!fieldEl) return true;
  const values = (rawValue || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const isValid = values.every((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
  const wrap = fieldEl.closest(".field");
  const errorEl = wrap.querySelector(".field-error");
  if (isValid) {
    wrap.classList.remove("has-error");
    return true;
  }
  wrap.classList.add("has-error");
  if (errorEl) errorEl.textContent = "Please enter valid email addresses separated by commas.";
  return false;
}

function validateField(fieldEl, isValid, message) {
  const wrap = fieldEl.closest(".field");
  const errorEl = wrap.querySelector(".field-error");
  if (isValid) {
    wrap.classList.remove("has-error");
    return true;
  }
  wrap.classList.add("has-error");
  if (errorEl) errorEl.textContent = message;
  return false;
}

export { initPersonalPage };
