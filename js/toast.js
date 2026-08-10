// ============================================================
// toast.js — small, non-blocking notifications.
// Used instead of alert()/confirm() everywhere in the app.
// ============================================================

function ensureStack() {
  let stack = document.querySelector(".toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    document.body.appendChild(stack);
  }
  return stack;
}

/**
 * Show a toast message.
 * @param {string} message
 * @param {"info"|"danger"} type
 * @param {number} duration ms before it auto-dismisses
 */
function showToast(message, type = "info", duration = 3200) {
  const stack = ensureStack();
  const toast = document.createElement("div");
  toast.className = `toast${type === "danger" ? " danger" : ""}`;
  toast.textContent = message;
  stack.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("exit");
    setTimeout(() => toast.remove(), 320);
  }, duration);
}

export { showToast };
