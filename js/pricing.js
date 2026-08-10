// ============================================================
// pricing.js — all money math lives here. Fixed "premium" fees are
// intentionally a little silly (see README) — they're wiped out by
// the surprise coupon at checkout.
// ============================================================

const FIXED_FEES = {
  movieFee: 499, // "Private Cinema Fee"
  comfortFee: 299, // "Premium Comfort Fee"
  entertainmentFee: 199, // "Entertainment Fee"
  convenienceFee: 49, // "Convenience Fee"
};

/** Sum of a booking's refreshments (unitPrice × qty for every line). */
function refreshmentsTotal(refreshments) {
  return refreshments.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
}

/**
 * Recomputes the full pricing block for a booking.
 * `applyCoupon` = true wipes the subtotal down to ₹0 (the surprise moment).
 */
function computePricing(booking, applyCoupon = false) {
  const refreshments = refreshmentsTotal(booking.refreshments || []);
  const subtotal =
    FIXED_FEES.movieFee +
    FIXED_FEES.comfortFee +
    FIXED_FEES.entertainmentFee +
    FIXED_FEES.convenienceFee +
    refreshments;

  const discount = applyCoupon ? subtotal : 0;
  const finalTotal = subtotal - discount;

  return {
    ...FIXED_FEES,
    refreshments,
    subtotal,
    discount,
    finalTotal,
  };
}

export { FIXED_FEES, refreshmentsTotal, computePricing };
