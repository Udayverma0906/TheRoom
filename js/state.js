// ============================================================
// state.js — the single source of truth for the booking flow.
// Everything is kept in localStorage under one key so it survives
// reloads and page-to-page navigation (each page is a separate
// HTML file, so we can't just keep it in a JS variable).
// ============================================================

const STORAGE_KEY = "privateCinema.booking";

// Shape of a brand-new, empty booking.
function emptyBooking() {
  return {
    guest: { name: "", email: "", extraEmails: "", copyHost: true },
    movie: { id: "", title: "", genre: "", duration: "", rating: "", poster: "", showtime: "sunset", scheduledAt: "", gif: "" },
    seat: { id: "", name: "" },
    refreshments: [], // [{ id, name, size, qty, unitPrice }]
    pricing: {
      movieFee: 0,
      comfortFee: 0,
      entertainmentFee: 0,
      refreshments: 0,
      convenienceFee: 0,
      subtotal: 0,
      discount: 0,
      finalTotal: 0,
    },
    bookingId: "",
    createdAt: "",
  };
}

/** Read the current booking from localStorage (never throws). */
function getBooking() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyBooking();
    const parsed = JSON.parse(raw);
    // Merge with empty shape so older/partial saves don't break newer pages.
    return { ...emptyBooking(), ...parsed };
  } catch (err) {
    console.warn("Booking state unreadable, starting fresh.", err);
    return emptyBooking();
  }
}

/** Overwrite the whole booking object. */
function saveBooking(booking) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(booking));
    return true;
  } catch (err) {
    console.warn("Could not save booking (localStorage unavailable).", err);
    return false;
  }
}

/** Shallow-merge a patch into the current booking and save it. */
function updateBooking(patch) {
  const current = getBooking();
  const next = { ...current, ...patch };
  saveBooking(next);
  return next;
}

/** Wipe the booking completely (used after "Back to Home" / new booking). */
function clearBooking() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn("Could not clear booking.", err);
  }
}

/** True if localStorage actually works in this browser/context. */
function isStorageAvailable() {
  try {
    const testKey = "__pc_test__";
    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/** Simple readable booking ID, e.g. PC-7F3K9Q. */
function generateBookingId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "PC-";
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

export {
  getBooking,
  saveBooking,
  updateBooking,
  clearBooking,
  isStorageAvailable,
  generateBookingId,
  emptyBooking,
};
