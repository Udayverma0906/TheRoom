# 📧 EmailJS Template Setup — read this before touching the dashboard

## Why your email showed `${booking.guest.name}` instead of the real value

That text is **JavaScript template-literal syntax** (backtick strings with
`${...}`) — it only means something inside a `.js` file, where the browser
evaluates it. EmailJS doesn't run JavaScript inside your template; it has
its **own** placeholder syntax: `{{variable}}` (or `{{{variable}}}` for raw
HTML — more on that below).

What happened: the raw HTML string from `buildHostNotificationHtml()` /
`buildGuestNotificationHtml()` in `js/email.js` — the literal source code,
`${...}` and all — got pasted directly into the EmailJS template body as
static content, instead of being referenced as a variable. EmailJS just
printed exactly what you pasted, placeholders and all.

**The fix doesn't require touching `js/email.js` at all.** The app already
builds two complete, styled HTML emails in JavaScript (`guest_notification_html`
and `host_notification_html`) and sends them as parameters. Your EmailJS
template's only job is to drop that one variable into the email body.

---

## The one rule that matters: `{{var}}` vs `{{{var}}}`

- `{{variable}}` — **escaped**. Good for plain text (a name, a price). If the
  value contains HTML tags, they'll show up as literal text (`&lt;div&gt;`
  etc.) — this is *not* what you want for our HTML email body.
- `{{{variable}}}` (**triple** braces) — **unescaped / raw HTML**. This
  renders the HTML properly. This is what you need for
  `guest_notification_html` and `host_notification_html`.

---

## Setup: Customer template (`customerTemplateId`)

In the EmailJS dashboard → Email Templates → your customer template:

| Field | Value |
|---|---|
| To Email | `{{to_email}}` |
| From Name | `Private Cinema` |
| Reply To | `{{guest_email}}` |
| Subject | `🎬 Your Private Cinema Booking is Confirmed!` |
| Content (switch to the **Code Editor** view, not the visual/plain one) | `{{{guest_notification_html}}}` |

That's the entire body — one line, triple braces. The styling, layout, and
all the booking details are already baked into the HTML string the app
sends; the template just needs to place it.

---

## Setup: Admin/host template (`adminTemplateId`)

| Field | Value |
|---|---|
| To Email | `{{to_email}}` |
| From Name | `Private Cinema Bookings` |
| Reply To | `{{guest_email}}` |
| Subject | `🎟️ New Private Cinema Booking — {{guest_name}}` |
| Content (Code Editor view) | `{{{host_notification_html}}}` |

---

## Testing it

1. Save both templates in the EmailJS dashboard.
2. Make a full test booking on the site (all the way to the confirmation
   page — that's the only page that actually sends email).
3. Open your browser console on the confirmation page — `js/confirmation.js`
   logs any send errors there, and the on-page status line will tell you if
   something failed (`"couldn't send the email"`).
4. Check the EmailJS dashboard → **Email History** — it shows the exact
   payload sent for each attempt, which is the fastest way to see if a
   variable came through empty.

---

## If you'd rather not deal with raw HTML at all

You can skip `{{{...}}}` entirely and build a simpler plain-field template
instead, using the individual variables the app already sends:
`guest_name`, `guest_email`, `movie_title`, `seat_name`, `showtime`,
`refreshments`, `original_total`, `coupon`, `final_total`, `booking_id`,
`booking_date`. Just drop `{{guest_name}}`, `{{movie_title}}` etc. straight
into EmailJS's visual template editor like normal text — no code editor
needed. It won't look as styled as the card in your screenshot, but it's
harder to get wrong.
