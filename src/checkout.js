/**
 * POKÉVAULT LEGENDS — Standalone Checkout Controller
 * Manages order summary, shipping form, PayPal SDK integration, and Order creation API.
 */

import { renderNavbar, initNavbarEvents } from './components/navbar.js';
import { renderFooter } from './components/footer.js';
import { renderCartDrawer, initCartDrawerEvents } from './components/cart-drawer.js';
import { getCart, getCartSubtotal, getPromoState, getInsuranceState, clearCart } from './utils/store.js';

class CheckoutPage {
  constructor() {
    this.cart = getCart();

    if (this.cart.length === 0) {
      alert('Your cart is empty! Redirecting to shop.');
      window.location.href = 'shop.html';
      return;
    }

    this.initLayout();
    this.renderSummary();
    this.initPayPalSDK();
    this.bindFormEvents();
  }

  initLayout() {
    document.getElementById('navbarRoot').innerHTML = renderNavbar('cart');
    document.getElementById('cartDrawerRoot').innerHTML = renderCartDrawer();
    document.getElementById('footerRoot').innerHTML = renderFooter();

    initNavbarEvents();
    initCartDrawerEvents();
  }

  getCalculatedTotals() {
    const subtotal = getCartSubtotal();
    const promo = getPromoState();
    const insuranceIncluded = getInsuranceState();
    const dispatchSpeedEl = document.querySelector('input[name="dispatchSpeed"]:checked');
    const isExpress = dispatchSpeedEl ? dispatchSpeedEl.value === 'express' : true;
    const shipping = isExpress ? 9.99 : 0;

    let discount = 0;
    if (promo.discountPercent > 0) {
      discount = (subtotal * promo.discountPercent) / 100;
    }

    const total = Math.max(0.01, subtotal - discount + shipping);
    return { subtotal, discount, shipping, total, promoCode: promo.code };
  }

  renderSummary() {
    const itemsList = document.getElementById('checkoutItemsList');
    const subtotalEl = document.getElementById('coSubtotal');
    const discountRow = document.getElementById('coDiscountRow');
    const discountEl = document.getElementById('coDiscount');
    const shippingEl = document.getElementById('coShipping');
    const totalEl = document.getElementById('coTotal');

    if (!itemsList) return;

    itemsList.innerHTML = this.cart.map(item => {
      const p = item.product;
      if (!p) return '';
      return `
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px; padding-bottom:10px; border-bottom:1px dashed #DDD;">
          <img src="${p.image}" style="width:40px; height:40px; object-fit:contain; background:#111; border-radius:4px;" alt="${p.name}" />
          <div style="flex:1;">
            <div style="font-family:var(--font-mono); font-weight:700; font-size:0.8rem; line-height:1.2;">${p.name}</div>
            <div style="font-size:0.75rem; color:#666;">Qty: ${item.quantity} × $${p.price.toFixed(2)}</div>
          </div>
          <div style="font-family:var(--font-mono); font-weight:900; font-size:0.85rem; color:var(--accent-red);">$${(p.price * item.quantity).toFixed(2)}</div>
        </div>
      `;
    }).join('');

    const totals = this.getCalculatedTotals();

    if (subtotalEl) subtotalEl.textContent = `$${totals.subtotal.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = totals.shipping > 0 ? `$${totals.shipping.toFixed(2)}` : 'FREE';

    if (discountRow) {
      if (totals.discount > 0) {
        discountRow.style.display = 'flex';
        if (discountEl) discountEl.textContent = `-$${totals.discount.toFixed(2)}`;
      } else {
        discountRow.style.display = 'none';
      }
    }

    if (totalEl) totalEl.textContent = `$${totals.total.toFixed(2)}`;
  }

  bindFormEvents() {
    const form = document.getElementById('checkoutMasterForm');
    document.querySelectorAll('input[name="dispatchSpeed"]').forEach(radio => {
      radio.addEventListener('change', () => this.renderSummary());
    });

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.processOrderPlacement('Credit Card / Vault Pay');
    });
  }

  async processOrderPlacement(paymentMethod = 'PayPal') {
    const name = document.getElementById('custName')?.value || 'Vault Collector';
    const email = document.getElementById('custEmail')?.value || 'collector@pokevault.com';
    const street = document.getElementById('custStreet')?.value || '102 Pallet Town Way';
    const city = document.getElementById('custCity')?.value || 'Celadon City';
    const state = document.getElementById('custState')?.value || 'Kanto';
    const zip = document.getElementById('custZip')?.value || '90210';
    const totals = this.getCalculatedTotals();

    const orderPayload = {
      customerName: name,
      customerEmail: email,
      shippingAddress: `${street}, ${city}, ${state} ${zip}`,
      items: this.cart.map(i => ({ id: i.product?.id || i.id, name: i.product?.name || i.name, price: i.product?.price, qty: i.quantity })),
      promoCode: totals.promoCode || '',
      discountAmount: totals.discount,
      insuranceIncluded: totals.shipping > 0,
      insuranceCost: totals.shipping,
      paymentMethod
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();

      const orderId = data.orderId || `ORD-${Date.now()}`;
      clearCart();
      window.location.href = `order-confirmation.html?id=${orderId}`;
    } catch (err) {
      console.warn('Backend order placement offline, creating local order receipt:', err);
      const localId = `ORD-${Date.now()}`;
      localStorage.setItem(`pvOrder_${localId}`, JSON.stringify({ ...orderPayload, orderId: localId, totalAmount: totals.total, createdAt: new Date().toISOString() }));
      clearCart();
      window.location.href = `order-confirmation.html?id=${localId}`;
    }
  }

  initPayPalSDK() {
    const container = document.getElementById('paypalCheckoutContainer');
    if (!container || !window.paypal) return;

    try {
      window.paypal.Buttons({
        style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' },
        createOrder: async () => {
          const totals = this.getCalculatedTotals();
          try {
            const res = await fetch('/api/paypal/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                items: this.cart.map(i => ({ id: i.product?.id || i.id, qty: i.quantity })),
                discountAmount: totals.discount,
                insuranceIncluded: totals.shipping > 0,
                insuranceCost: totals.shipping
              })
            });
            const data = await res.json();
            return data.orderID || `DEMO-PAYPAL-${Date.now()}`;
          } catch (e) {
            return `DEMO-PAYPAL-${Date.now()}`;
          }
        },
        onApprove: async (data, actions) => {
          await this.processOrderPlacement('PayPal Express');
        }
      }).render('#paypalCheckoutContainer');
    } catch (err) {
      console.warn('PayPal button render warning:', err);
    }
  }
}

new CheckoutPage();
