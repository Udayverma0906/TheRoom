# 🎬 Private Cinema — Movie Booking Website

A fun, premium-feeling movie booking site for a home projector setup. It walks
guests through a real cinema-style booking flow — pick a movie, pick one of
two seats, order snacks, review a bill full of silly "premium" fees — and
then surprises them with a **100% OFF** coupon that drops the total to ₹0.

It's a **static site**: plain HTML/CSS/JS, no backend, no database, no login.

---

## 1. What it does

- Landing page with a countdown and "now showing" strip
- A short guest-info form (name + email, stored in `localStorage` only)
- Movie selection from a simple JS array
- A funny 2-seat "seat map" (this is a private cinema, not a real one)
- A snack bar with quantity + size selectors and a sticky cart
- A bill full of fake "premium" fees
- A surprise coupon reveal (confetti, ticket flip, price count-down to ₹0)
- A final digital movie-ticket confirmation page
- Optional email confirmation via [EmailJS](https://www.emailjs.com) (free,
  no backend required)

---

## 2. Folder structure

```
/movie-booking
│
├── index.html            Landing page
├── personal.html         Step 1 — name & email
├── movies.html            Step 2 — pick a movie
├── seats.html             Step 3 — pick a seat
├── refreshments.html      Step 4 — snacks & drinks
├── bill.html               Step 5 — bill + surprise coupon
├── confirmation.html      Final digital ticket
│
├── css/
│   └── style.css          All styling, design tokens, animations
│
├── js/
│   ├── main.js             Router — reads <body data-page="..."> and boots the right page
│   ├── state.js            Booking state helpers (localStorage)
│   ├── nav.js               Progress bar + step guards (can't skip ahead)
│   ├── toast.js             Small non-blocking notifications
│   ├── pricing.js           All money math in one place
│   ├── movies-data.js       ← Edit movies here
│   ├── refreshments-data.js ← Edit snacks/drinks here
│   ├── email.js             ← Edit EmailJS config here
│   ├── landing.js           Page script for index.html
│   ├── personal.js          Page script for personal.html
│   ├── movies.js            Page script for movies.html
│   ├── seats.js             Page script for seats.html
│   ├── refreshments.js      Page script for refreshments.html
│   ├── bill.js               Page script for bill.html
│   └── confirmation.js      Page script for confirmation.html
│
├── assets/
│   ├── movies/   (optional local poster images)
│   ├── icons/
│   └── images/
│
└── README.md
```

Each page loads only `js/main.js` as a module — `main.js` looks at
`document.body.dataset.page` and calls the matching `init...Page()`
function. That means you can open any single page file and its matching
`.js` file to debug it in isolation.

---

## 3. Running it locally

Because the pages use ES modules (`<script type="module">`), you can't just
double-click `index.html` — browsers block module imports over the `file://`
protocol. Instead, serve the folder locally:

```bash
cd movie-booking
python3 -m http.server 8000
# then open http://localhost:8000
```

Or with Node:

```bash
npx serve .
```

Or just drag the folder into a static host like Netlify, Vercel, or GitHub
Pages — no build step needed.

---

## 4. Adding / changing movies

Open **`js/movies-data.js`**. It's a single array — add, remove, or edit
objects:

```js
{
  id: "interstellar",       // unique, used internally — keep it URL-safe
  title: "Interstellar",
  genre: "Sci-Fi",
  duration: "2h 49m",
  rating: "8.7",
  poster: "https://...",    // or "./assets/movies/interstellar.jpg"
  description: "A crew of explorers travels through a wormhole...",
  tagline: "A journey beyond the limits of time.",       // shown in the detail modal
  trailer: "https://www.youtube.com/embed/...?autoplay=1&mute=1", // YouTube embed URL
  highlight: "Cosmic scale, emotional depth...",          // callout line in the modal
  gif: "https://media.giphy.com/media/<ID>/giphy.gif",    // motion preview in the modal
  themeColor: "#4bd6c8",     // accent used for this movie's modal + page tint
  themeSoft: "rgba(75,214,200,0.16)",
}
```

That's it — the movie selection page and its detail modal render straight
from this array.

**Getting a `gif` link:** open any GIF on [giphy.com](https://giphy.com),
right-click the image → "Copy Image Address" (or use the Embed panel) — you
want a URL that ends in `giphy.gif`, e.g.
`https://media.giphy.com/media/<ID>/giphy.gif`. If you leave `gif` blank
or drop the field, the modal just skips that preview — it won't show a
broken image.

---

## 5. Adding / changing refreshments

Open **`js/refreshments-data.js`**. Each item can have one or more sizes,
each with its own price:

```js
{
  id: "popcorn",
  name: "Classic Popcorn",
  icon: "🍿",
  description: "Perfect movie companion",
  sizes: [
    { id: "regular", label: "Regular", price: 120 },
    { id: "large", label: "Large", price: 180 },
  ],
}
```

An item with only one size (see "Brownie Sundae") just skips the size
toggle on the page automatically.

---

## 6. How pricing works

All money math lives in **`js/pricing.js`**:

- Four fixed "premium" fees: Private Cinema Fee, Premium Comfort Fee,
  Entertainment Fee, Convenience Fee — these are the joke, they're what
  make the bill look real before the coupon wipes them out.
- Refreshments total is calculated from whatever's in the cart.
- `computePricing(booking, applyCoupon)` returns the full breakdown.
  Call it with `applyCoupon: true` to get the post-coupon ₹0 total (this
  happens automatically when "Complete Booking" is pressed on the bill page).

To change the fixed fees, edit the `FIXED_FEES` object at the top of that
file — nothing else needs to change.

---

## 7. Configuring EmailJS

The site can send two emails per booking (customer confirmation + admin
notification) using [EmailJS](https://www.emailjs.com), which is free for
low volume and needs no backend.

1. Create a free EmailJS account.
2. Add an **Email Service** (e.g. Gmail) → copy its **Service ID**.
3. Create **two templates**:
   - a customer-facing confirmation template
   - an admin notification template

   `js/email.js` builds a complete, styled HTML email for each in JS
   (`buildGuestNotificationHtml` / `buildHostNotificationHtml`) and sends it
   as `guest_notification_html` / `host_notification_html`. Each template's
   **entire body** should just be that one variable in **triple** braces —
   switch the template editor to Code View and paste:
   - Customer template: `{{{guest_notification_html}}}`
   - Admin template: `{{{host_notification_html}}}`

   Triple braces (`{{{ }}}`) tell EmailJS to render the value as raw HTML
   instead of escaping it — double braces (`{{ }}`) would print the HTML
   tags as visible text. **See `EMAILJS_TEMPLATE_GUIDE.md` for the full
   walkthrough** (To/Subject/Reply-To fields, testing, troubleshooting).
4. Copy each template's **Template ID**.
5. Copy your **Public Key** from Account → General.
6. Open **`js/email.js`** and fill in the config block at the top:

```js
const EMAIL_CONFIG = {
  serviceId: "YOUR_SERVICE_ID",
  customerTemplateId: "YOUR_CUSTOMER_TEMPLATE_ID",
  adminTemplateId: "YOUR_ADMIN_TEMPLATE_ID",
  publicKey: "YOUR_PUBLIC_KEY",
  adminEmail: "YOUR_ADMIN_EMAIL@example.com",
};
```

That's the only file that needs editing. The EmailJS SDK is loaded via
`<script>` only on `confirmation.html`, since that's the only page that
sends anything.

**Never put a private/secret API key here** — EmailJS's public key is
designed to be used from frontend code; it only allows sending through
templates you've already configured, not arbitrary access to your account.

If emails aren't configured (or fail to send), the booking still completes
normally — the confirmation page just shows a message saying the email
couldn't be sent, instead of throwing an error.

---

## 8. Changing the admin email

Just update `adminEmail` in `js/email.js` (see above).

---

## 9. How the booking state works

`js/state.js` keeps one JSON object in `localStorage` under the key
`privateCinema.booking`, shaped like:

```js
{
  guest: { name, email },
  movie: { id, title, genre, duration, rating, poster },
  seat: { id, name },
  refreshments: [{ id, name, sizeId, size, qty, unitPrice }],
  pricing: { movieFee, comfortFee, entertainmentFee, refreshments,
             convenienceFee, subtotal, discount, finalTotal },
  bookingId,
  createdAt,
  completed,
}
```

Helper functions (import from `./state.js`):

- `getBooking()` — read the current booking (never throws)
- `saveBooking(booking)` — overwrite the whole object
- `updateBooking(patch)` — shallow-merge a patch and save
- `clearBooking()` — wipe it (used on landing page load and "Back to Home")
- `isStorageAvailable()` — quick check used to warn the user if their
  browser blocks localStorage (e.g. private mode in some browsers)

`js/nav.js` also guards each page — for example, `seats.html` redirects
back to `movies.html` with a toast if no movie has been picked yet, so
users can't jump straight to a later step via the URL bar.

---

## 10. Customizing the design

Everything visual is driven by CSS custom properties at the top of
**`css/style.css`**:

```css
:root{
  --bg-void:#0b0d10;
  --accent-amber:#e8a33d;
  --accent-red:#c4443b;
  --text-cream:#f2ede4;
  ...
}
```

Fonts: **Bebas Neue** for marquee-style headings, **Manrope** for body
text, **JetBrains Mono** for prices, tickets, and data — all loaded from
Google Fonts in the first line of the stylesheet. Swap the `@import` and
the `--font-*` variables to change the whole typographic feel.

The signature moment — the digital ticket on the confirmation page — is
its own block (`.ticket`, `.ticket-top`, `.ticket-body`, `.barcode`,
`.ticket-sprockets`) if you want to restyle just that.

---

Enjoy the show. 🍿
