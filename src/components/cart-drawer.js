/**
 * POKÉVAULT LEGENDS — Shared Cart Drawer Helper
 * Renders slide-out cart drawer across all pages.
 */

import { getCart, updateCartQty, removeFromCart, getCartSubtotal, applyPromoCode, getPromoState, getInsuranceState, setInsurance } from '../utils/store.js';

export function renderCartDrawer() {
  return `
    <div class="cart-overlay" id="cartOverlay"></div>
    <div class="cart-drawer" id="cartDrawer">
      <div class="cart-header">
        <div class="cart-title">YOUR VAULT CART</div>
        <button class="cart-close-btn" id="closeCartBtn">&times;</button>
      </div>

      <div class="cart-items" id="cartItemsContainer">
        <!-- Rendered dynamically -->
      </div>

      <!-- PROMO CODE SECTION -->
      <div class="cart-promo-box" style="padding: 0.75rem 1rem; border-top: 2px dashed #000; background: #FFFDE7;">
        <div style="font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; margin-bottom: 6px;">PROMO CODE</div>
        <form id="cartDrawerPromoForm" style="display:flex; gap:6px;">
          <input type="text" id="cartPromoInput" placeholder="e.g. POKEVAULT10" style="flex:1; padding:6px 10px; font-family:var(--font-mono); font-size:0.8rem; border:2px solid #000; text-transform:uppercase;" />
          <button type="submit" class="btn-inspect" style="padding:6px 12px; font-size:0.75rem;">Apply</button>
        </form>
        <div id="cartPromoMsg" style="font-family:var(--font-mono); font-size:0.75rem; margin-top:4px; font-weight:700;"></div>
      </div>

      <div class="cart-footer">
        <div class="cart-subtotal-row" style="margin-top: 0.5rem;">
          <span>SUBTOTAL:</span>
          <span id="drawerCartSubtotal">$0.00</span>
        </div>
        <div id="drawerCartDiscountRow" style="display:none; justify-content:space-between; font-family:var(--font-mono); font-size:0.85rem; color:var(--accent-red); margin-bottom:0.5rem; font-weight:700;">
          <span>DISCOUNT:</span>
          <span id="drawerCartDiscount">-$0.00</span>
        </div>
        <a href="checkout.html" class="btn-pill" id="drawerCheckoutBtn" style="width: 100%; text-align:center; display:block; text-decoration:none; box-sizing:border-box;">
          Proceed to Checkout &amp; Dispatch →
        </a>
        <a href="cart.html" style="display:block; text-align:center; margin-top:8px; font-family:var(--font-mono); font-size:0.8rem; color:#000; font-weight:700;">
          View Full Shopping Cart Page
        </a>
      </div>
    </div>
  `;
}

export function updateCartDrawerUI() {
  const container = document.getElementById('cartItemsContainer');
  const subtotalEl = document.getElementById('drawerCartSubtotal');
  const discountRow = document.getElementById('drawerCartDiscountRow');
  const discountEl = document.getElementById('drawerCartDiscount');
  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `<div class="cart-empty-msg">YOUR VAULT IS EMPTY. ADD SOME LEGENDS!</div>`;
    if (subtotalEl) subtotalEl.textContent = '$0.00';
    if (discountRow) discountRow.style.display = 'none';
    return;
  }

  const subtotal = getCartSubtotal();
  const promo = getPromoState();
  let discountAmount = 0;
  if (promo.discountPercent > 0) {
    discountAmount = (subtotal * promo.discountPercent) / 100;
  }

  container.innerHTML = cart.map(item => {
    const p = item.product;
    if (!p) return '';
    return `
      <div class="cart-item-row" data-id="${p.id}">
        <img src="${p.image}" class="cart-item-thumb" alt="${p.name}" />
        <div class="cart-item-details">
          <div class="cart-item-title">${p.name}</div>
          <div class="cart-item-meta">${p.categoryName}</div>
          <div class="cart-item-price">$${(p.price * item.quantity).toFixed(2)}</div>
          <div class="cart-qty-row" style="margin-top:6px; display:flex; align-items:center; gap:6px;">
            <button class="btn-qty drawer-qty-dec" data-id="${p.id}">-</button>
            <span style="font-family:var(--font-mono); font-weight:700; font-size:0.85rem;">${item.quantity}</span>
            <button class="btn-qty drawer-qty-inc" data-id="${p.id}">+</button>
            <button class="cart-item-remove drawer-remove-item" data-id="${p.id}" style="margin-left:auto; background:none; border:none; color:var(--accent-red); cursor:pointer; font-size:0.8rem; font-weight:700;">Remove</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (subtotalEl) subtotalEl.textContent = `$${(subtotal - discountAmount).toFixed(2)}`;
  if (discountRow) {
    if (discountAmount > 0) {
      discountRow.style.display = 'flex';
      if (discountEl) discountEl.textContent = `-$${discountAmount.toFixed(2)}`;
    } else {
      discountRow.style.display = 'none';
    }
  }

  // Bind item controls
  container.querySelectorAll('.drawer-qty-dec').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const item = cart.find(i => i.id === id);
      if (item) updateCartQty(id, item.quantity - 1);
    });
  });

  container.querySelectorAll('.drawer-qty-inc').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const item = cart.find(i => i.id === id);
      if (item) updateCartQty(id, item.quantity + 1);
    });
  });

  container.querySelectorAll('.drawer-remove-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      removeFromCart(id);
    });
  });
}

export function initCartDrawerEvents() {
  const cartBtn = document.getElementById('cartBtn');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartDrawer = document.getElementById('cartDrawer');
  const promoForm = document.getElementById('cartDrawerPromoForm');

  const openDrawer = () => {
    cartOverlay?.classList.add('open');
    cartDrawer?.classList.add('open');
    updateCartDrawerUI();
  };

  const closeDrawer = () => {
    cartOverlay?.classList.remove('open');
    cartDrawer?.classList.remove('open');
  };

  cartBtn?.addEventListener('click', openDrawer);
  closeCartBtn?.addEventListener('click', closeDrawer);
  cartOverlay?.addEventListener('click', closeDrawer);

  promoForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('cartPromoInput');
    const msg = document.getElementById('cartPromoMsg');
    const res = applyPromoCode(input?.value);
    if (msg) {
      msg.textContent = res.message;
      msg.style.color = res.success ? '#166534' : 'var(--accent-red)';
    }
    updateCartDrawerUI();
  });

  window.addEventListener('pv-cart-updated', updateCartDrawerUI);
}
