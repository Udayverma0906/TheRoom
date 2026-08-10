// ============================================================
// refreshments.js — step 4: snacks & drinks, with a sticky cart.
// ============================================================

import { refreshments as catalog } from "./refreshments-data.js";
import { getBooking, updateBooking } from "./state.js";
import { renderProgress, guardStep } from "./nav.js";
import { refreshmentsTotal } from "./pricing.js";

// Local working cart: { [itemId]: { sizeId, qty, timing } }
let cart = {};

function initRefreshmentsPage() {
  if (!guardStep(["guest", "movie", "seat"])) return;
  renderProgress("refreshments");

  const booking = getBooking();
  cart = hydrateCartFromBooking(booking.refreshments);

  renderGrid();
  updateCartBar();

  const viewOrderBtn = document.querySelector("[data-view-order-btn]");
  if (viewOrderBtn) {
    viewOrderBtn.addEventListener("click", () => {
      persistCart();
      window.location.href = "bill.html";
    });
  }
}

function hydrateCartFromBooking(savedItems) {
  const next = {};
  (savedItems || []).forEach((item) => {
    next[item.id] = { sizeId: item.sizeId, qty: item.qty, timing: item.timing || "beginning" };
  });
  return next;
}

function renderGrid() {
  const grid = document.querySelector("[data-refresh-grid]");
  if (!grid) return;

  grid.innerHTML = catalog
    .map((item) => {
      const entry = cart[item.id] || { sizeId: item.sizes[0].id, qty: 0, timing: "beginning" };
      const activeSize = item.sizes.find((s) => s.id === entry.sizeId) || item.sizes[0];
      const showSizeToggle = item.sizes.length > 1;

      return `
      <div class="refresh-item${entry.qty > 0 ? " active" : ""}" data-item-id="${item.id}">
        <div class="refresh-item-top">
          <div class="refresh-icon">${item.icon}</div>
          <div class="refresh-info">
            <div class="name">${item.name}</div>
            <div class="desc">${item.description}</div>
            <div class="price" data-price>₹${activeSize.price}</div>
          </div>
        </div>
        <div class="refresh-item-footer">
          <div class="refresh-item-options">
            ${
              showSizeToggle
                ? `<div class="size-toggle" data-size-toggle>
                    ${item.sizes
                      .map(
                        (s) => `<span class="size-opt${s.id === entry.sizeId ? " active" : ""}" data-size-id="${s.id}">${s.label}</span>`
                      )
                      .join("")}
                  </div>`
                : ""
            }
            <div class="timing-toggle" data-timing-toggle>
              <span class="timing-opt${entry.timing === "beginning" ? " active" : ""}" data-timing="beginning">Beginning</span>
              <span class="timing-opt${entry.timing === "middle" ? " active" : ""}" data-timing="middle">Middle</span>
              <span class="timing-opt${entry.timing === "end" ? " active" : ""}" data-timing="end">End</span>
            </div>
          </div>
          <div class="qty-control">
            <button class="qty-btn" data-qty-minus type="button">−</button>
            <span class="qty-val" data-qty-val>${entry.qty}</span>
            <button class="qty-btn" data-qty-plus type="button">+</button>
          </div>
        </div>
      </div>`;
    })
    .join("");

  grid.querySelectorAll(".refresh-item").forEach((row) => wireRow(row));
}

function wireRow(row) {
  const itemId = row.dataset.itemId;
  const item = catalog.find((i) => i.id === itemId);
  if (!item) return;

  const qtyValEl = row.querySelector("[data-qty-val]");
  const priceEl = row.querySelector("[data-price]");
  const sizeToggle = row.querySelector("[data-size-toggle]");
  const timingToggle = row.querySelector("[data-timing-toggle]");

  function currentEntry() {
    return cart[itemId] || { sizeId: item.sizes[0].id, qty: 0, timing: "beginning" };
  }

  function refreshRowUI() {
    const entry = currentEntry();
    const size = item.sizes.find((s) => s.id === entry.sizeId) || item.sizes[0];
    qtyValEl.textContent = entry.qty;
    priceEl.textContent = `₹${size.price}`;
    row.classList.toggle("active", entry.qty > 0);
    if (sizeToggle) {
      sizeToggle.querySelectorAll(".size-opt").forEach((opt) => {
        opt.classList.toggle("active", opt.dataset.sizeId === entry.sizeId);
      });
    }
    if (timingToggle) {
      timingToggle.querySelectorAll(".timing-opt").forEach((opt) => {
        opt.classList.toggle("active", opt.dataset.timing === entry.timing);
      });
    }
  }

  row.querySelector("[data-qty-plus]").addEventListener("click", () => {
    const entry = currentEntry();
    entry.qty += 1;
    cart[itemId] = entry;
    refreshRowUI();
    updateCartBar();
  });

  row.querySelector("[data-qty-minus]").addEventListener("click", () => {
    const entry = currentEntry();
    entry.qty = Math.max(0, entry.qty - 1);
    cart[itemId] = entry;
    refreshRowUI();
    updateCartBar();
  });

  if (sizeToggle) {
    sizeToggle.querySelectorAll(".size-opt").forEach((opt) => {
      opt.addEventListener("click", () => {
        const entry = currentEntry();
        entry.sizeId = opt.dataset.sizeId;
        cart[itemId] = entry;
        refreshRowUI();
        updateCartBar();
      });
    });
  }

  if (timingToggle) {
    timingToggle.querySelectorAll(".timing-opt").forEach((opt) => {
      opt.addEventListener("click", () => {
        const entry = currentEntry();
        entry.timing = opt.dataset.timing;
        cart[itemId] = entry;
        refreshRowUI();
        updateCartBar();
      });
    });
  }
}

function cartAsLineItems() {
  return Object.entries(cart)
    .filter(([, entry]) => entry.qty > 0)
    .map(([itemId, entry]) => {
      const item = catalog.find((i) => i.id === itemId);
      const size = item.sizes.find((s) => s.id === entry.sizeId) || item.sizes[0];
      return {
        id: itemId,
        name: item.name,
        sizeId: size.id,
        size: size.label,
        qty: entry.qty,
        unitPrice: size.price,
        timing: entry.timing || "beginning",
      };
    });
}

function updateCartBar() {
  const lineItems = cartAsLineItems();
  const count = lineItems.reduce((sum, i) => sum + i.qty, 0);
  const total = refreshmentsTotal(lineItems);

  const countEl = document.querySelector("[data-cart-count]");
  const amountEl = document.querySelector("[data-cart-amount]");
  const btn = document.querySelector("[data-view-order-btn]");

  if (countEl) countEl.textContent = `${count} item${count === 1 ? "" : "s"}`;
  if (amountEl) amountEl.textContent = `₹${total}`;
  if (btn) btn.textContent = count > 0 ? "View order →" : "Skip snacks →";
}

function persistCart() {
  updateBooking({ refreshments: cartAsLineItems() });
}

export { initRefreshmentsPage };
