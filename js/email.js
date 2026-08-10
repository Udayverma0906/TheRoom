// ============================================================
// email.js — all email sending lives here, isolated from the rest
// of the app. Uses EmailJS (https://www.emailjs.com), a free service
// built for static sites — no backend needed.
//
// >>> EDIT THESE FOUR VALUES AFTER YOU CREATE YOUR EMAILJS ACCOUNT <<<
// EmailJS dashboard → Email Services → Service ID
//                    → Email Templates → Template ID (one per template)
//                    → Account → General → Public Key
//
// IMPORTANT: this file already builds two full HTML emails
// (see buildGuestNotificationHtml / buildHostNotificationHtml below) and
// sends them as the `guest_notification_html` / `host_notification_html`
// params. Your EmailJS template body should be nothing more than
// {{{guest_notification_html}}} or {{{host_notification_html}}}
// (TRIPLE curly braces — that's EmailJS's "render as raw HTML" syntax).
// Do NOT paste this file's JS source into the EmailJS template editor —
// that's what causes literal "${...}" text to show up in the sent email.
// Full walkthrough: see EMAILJS_TEMPLATE_GUIDE.md in the project root.
// ============================================================

const EMAIL_CONFIG = {
  serviceId: "service_xx7izl5",
  customerTemplateId: "template_9owh11d",
  adminTemplateId: "template_9vmsoia",
  publicKey: "mSmvY-47qzusz0EIg",
  adminEmail: "udayv09@gmail.com", // <-- where booking alerts go
};

let emailjsReady = false;

/** Loads the EmailJS SDK once (it's included via <script> in every HTML page)
 *  and initializes it with the public key above. Safe to call multiple times. */
function ensureEmailJsInitialized() {
  if (emailjsReady) return true;
  if (typeof window.emailjs === "undefined") {
    console.warn("EmailJS SDK not loaded — check the <script> tag in this page's HTML.");
    return false;
  }
  if (EMAIL_CONFIG.publicKey === "YOUR_PUBLIC_KEY") {
    console.warn("EmailJS is not configured yet — see js/email.js EMAIL_CONFIG.");
    return false;
  }
  window.emailjs.init({ publicKey: EMAIL_CONFIG.publicKey });
  emailjsReady = true;
  return true;
}

/** Builds a flat, template-friendly params object from a booking. */
function buildEmailParams(booking) {
  const refreshmentsText =
    booking.refreshments
      .map((r) => `${r.name} (${r.size}) × ${r.qty} · ${r.timing || "beginning"}`)
      .join(", ") || "None";

  const showtimeText = formatShowtimeText(booking);

  return {
    guest_name: booking.guest.name,
    guest_email: booking.guest.email,
    guest_recipients: buildGuestRecipientList(booking).join(", "),
    host_recipients: buildHostRecipientList(booking).join(", "),
    movie_title: booking.movie.title,
    seat_name: booking.seat.name,
    showtime: showtimeText,
    refreshments: refreshmentsText,
    original_total: `₹${booking.pricing.subtotal}`,
    coupon: "HOME CINEMA VIP — 100% OFF",
    final_total: `₹${booking.pricing.finalTotal}`,
    booking_id: booking.bookingId,
    booking_date: booking.createdAt,
    experience_note: "Private home cinema • one personal bed • host-led concierge experience",
    guest_notification_html: buildGuestNotificationHtml(booking),
    host_notification_html: buildHostNotificationHtml(booking),
  };
}

function buildGuestRecipientList(booking) {
  const recipients = [booking.guest.email].filter(Boolean);
  const extras = normalizeEmailList(booking.guest.extraEmails);
  return [...new Set([...recipients, ...extras])];
}

function buildHostRecipientList(booking) {
  const recipients = [];
  if (booking.guest.copyHost !== false) recipients.push(EMAIL_CONFIG.adminEmail);
  return recipients.filter(Boolean);
}

function normalizeEmailList(value) {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Small helper: pill-style label used inside both email bodies. */
function emailPill(text, color) {
  return `<span style="display:inline-block;padding:4px 10px;border-radius:999px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.16);color:${color || "#f7f5ee"};font-size:11px;letter-spacing:0.04em;">${text}</span>`;
}

function formatShowtimeText(bookingOrMovie) {
  const movie = bookingOrMovie?.movie ? bookingOrMovie.movie : bookingOrMovie;
  const base = movie?.showtime
    ? `${movie.showtime.charAt(0).toUpperCase()}${movie.showtime.slice(1)}`.replace(/-/g, " ")
    : "Sunset start";

  if (!movie?.scheduledAt) return base;

  const value = new Date(movie.scheduledAt);
  if (Number.isNaN(value.getTime())) return base;

  const formatted = new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);

  return `${base} • ${formatted}`;
}

function emailRefreshText(booking) {
  return booking.refreshments.length
    ? booking.refreshments.map((r) => `${r.name} · ${r.size} × ${r.qty} · ${r.timing || "beginning"}`).join("<br />")
    : "No snacks selected";
}

/** Shared footer with booking ID + timestamp, used by both emails. */
function emailFooter(booking) {
  return `
    <div style="margin-top:18px;padding-top:14px;border-top:1px dashed rgba(255,255,255,0.14);display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;font-family:monospace;font-size:11px;letter-spacing:0.06em;color:#7d8a99;">
      <span>BOOKING ${booking.bookingId || "PENDING"}</span>
      <span>${booking.createdAt || ""}</span>
    </div>`;
}

function buildGuestNotificationHtml(booking) {
  const showtimeText = formatShowtimeText(booking);
  const refreshText = emailRefreshText(booking);

  return `
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:24px;border-radius:24px;background:#0f1728;color:#f7f5ee;">
      <div style="padding:20px;border-radius:16px;background:linear-gradient(135deg, ${booking.movie?.themeColor || "#42c7c3"} 0%, #8b7cff 100%);">
        <div style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;opacity:0.85;">Private Cinema Guest Notice</div>
        <h2 style="margin:8px 0 4px;font-size:24px;">${booking.guest.name || "Guest"}, your night is set.</h2>
        <p style="margin:0;font-size:14px;line-height:1.6;opacity:0.95;">Your private screening is confirmed. Grab your snacks and settle in — the room is yours.</p>
      </div>

      <div style="margin-top:16px;padding:18px;border:1px solid rgba(255,255,255,0.12);border-radius:18px;background:rgba(255,255,255,0.04);">
        <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#9fb0bf;">Booking summary</p>
        <div style="margin-bottom:10px;">${emailPill(booking.movie.title || "TBD")} ${emailPill(showtimeText)} ${emailPill(booking.seat.name || "Private Bed")}</div>
        <p style="margin:4px 0;font-size:14px;"><strong>Snacks:</strong><br />${refreshText}</p>
      </div>

      <div style="margin-top:12px;padding:18px;border:1px solid rgba(255,255,255,0.12);border-radius:18px;background:rgba(255,255,255,0.04);">
        <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#9fb0bf;">Price</p>
        <p style="margin:4px 0;font-size:14px;text-decoration:line-through;color:#7d8a99;">Original: ${booking.pricing?.subtotal != null ? `₹${booking.pricing.subtotal}` : "—"}</p>
        <p style="margin:4px 0;font-size:14px;color:#7cf0b2;">Coupon applied: HOME CINEMA VIP — 100% OFF</p>
        <p style="margin:8px 0 0;font-size:22px;font-weight:800;">Total: ₹${booking.pricing?.finalTotal ?? 0}</p>
      </div>

      <p style="margin:16px 2px 0;font-size:13px;color:#9fb0bf;">No ads. No strangers. No screaming kids. Enjoy the show 🍿</p>
      ${emailFooter(booking)}
    </div>`;
}

function buildHostNotificationHtml(booking) {
  const showtimeText = formatShowtimeText(booking);
  const refreshText = emailRefreshText(booking);

  return `
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:24px;border-radius:24px;background:#07121d;color:#f7f5ee;">
      <div style="padding:20px;border-radius:16px;background:linear-gradient(135deg, ${booking.movie?.themeColor || "#42c7c3"} 0%, #ff7f6d 100%);">
        <div style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;opacity:0.85;">Host Booking Alert</div>
        <h2 style="margin:8px 0 4px;font-size:24px;">New private cinema request received</h2>
        <p style="margin:0;font-size:14px;line-height:1.6;opacity:0.95;">A guest has locked in a cozy movie night and the hosting team should be ready for the experience.</p>
      </div>
      <div style="margin-top:16px;padding:18px;border:1px solid rgba(255,255,255,0.12);border-radius:18px;background:rgba(255,255,255,0.04);">
        <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#9fb0bf;">Guest details</p>
        <p style="margin:4px 0;font-weight:700;font-size:15px;">${booking.guest.name || "Guest"}</p>
        <p style="margin:4px 0;font-size:14px;color:#c9d3dc;">${booking.guest.email || "—"}</p>
        <p style="margin:4px 0;font-size:14px;color:#c9d3dc;">Additional guests: ${booking.guest.extraEmails || "None"}</p>
      </div>

      <div style="margin-top:12px;padding:18px;border:1px solid rgba(255,255,255,0.12);border-radius:18px;background:rgba(255,255,255,0.04);">
        <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#9fb0bf;">Booking details</p>
        <div style="margin-bottom:10px;">${emailPill(booking.movie.title || "TBD")} ${emailPill(showtimeText)} ${emailPill(booking.seat.name || "Private Bed")}</div>
        <p style="margin:4px 0;font-size:14px;"><strong>Snack plan:</strong><br />${refreshText}</p>
      </div>

      <div style="margin-top:12px;padding:18px;border:1px solid rgba(255,255,255,0.12);border-radius:18px;background:rgba(255,255,255,0.04);">
        <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#9fb0bf;">Price (guest paid ₹0 via coupon)</p>
        <p style="margin:4px 0;font-size:14px;color:#c9d3dc;">Original total: ₹${booking.pricing?.subtotal ?? "—"}</p>
        <p style="margin:4px 0;font-size:14px;color:#c9d3dc;">Coupon: HOME CINEMA VIP — 100% OFF</p>
      </div>
      ${emailFooter(booking)}
    </div>`;
}

/**
 * Sends both the customer confirmation and the admin notification.
 * Never throws — returns a result object so the UI can show a graceful
 * message even if email sending fails (booking still counts as complete).
 */
async function sendBookingEmails(booking) {
  const result = { customerSent: false, adminSent: false, error: null };

  if (!ensureEmailJsInitialized()) {
    result.error = "Email service isn't configured yet.";
    return result;
  }

  const params = buildEmailParams(booking);
  const guestRecipients = buildGuestRecipientList(booking);
  const hostRecipients = buildHostRecipientList(booking);

  if (guestRecipients.length) {
    try {
      await window.emailjs.send(EMAIL_CONFIG.serviceId, EMAIL_CONFIG.customerTemplateId, {
        ...params,
        to_email: guestRecipients.join(","),
      });
      result.customerSent = true;
    } catch (err) {
      console.error("Customer email failed:", err);
      result.error = "Customer email failed to send.";
    }
  }

  if (hostRecipients.length) {
    try {
      await window.emailjs.send(EMAIL_CONFIG.serviceId, EMAIL_CONFIG.adminTemplateId, {
        ...params,
        to_email: hostRecipients.join(","),
      });
      result.adminSent = true;
    } catch (err) {
      console.error("Admin email failed:", err);
      result.error = result.error || "Admin email failed to send.";
    }
  }

  return result;
}

export { EMAIL_CONFIG, sendBookingEmails, buildGuestNotificationHtml, buildHostNotificationHtml, formatShowtimeText };
