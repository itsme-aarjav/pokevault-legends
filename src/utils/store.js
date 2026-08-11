/**
 * POKÉVAULT LEGENDS — Centralized State Store
 * Manages Cart & Wishlist persistence with custom event listeners
 */

import { getProductById } from '../data/products.js';

// Initial state getters
export const getCart = () => {
  try {
    return JSON.parse(localStorage.getItem('pvCart') || '[]');
  } catch (e) {
    return [];
  }
};

export const getWishlist = () => {
  try {
    return JSON.parse(localStorage.getItem('pvWishlist') || '[]');
  } catch (e) {
    return [];
  }
};

// Dispatch Custom Events
const dispatchCartUpdate = () => {
  window.dispatchEvent(new CustomEvent('pv-cart-updated', { detail: getCart() }));
};

const dispatchWishlistUpdate = () => {
  window.dispatchEvent(new CustomEvent('pv-wishlist-updated', { detail: getWishlist() }));
};

// Cart Actions
export const addToCart = (productId, qty = 1) => {
  const cart = getCart();
  const product = getProductById(productId);
  if (!product) return;

  const existingIndex = cart.findIndex(item => item.id === productId || item.product?.id === productId);
  if (existingIndex !== -1) {
    cart[existingIndex].quantity = Math.max(1, cart[existingIndex].quantity + qty);
  } else {
    cart.push({
      id: productId,
      product: product,
      quantity: Math.max(1, qty),
      addedAt: new Date().toISOString()
    });
  }

  localStorage.setItem('pvCart', JSON.stringify(cart));
  dispatchCartUpdate();
};

export const removeFromCart = (productId) => {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId && item.product?.id !== productId);
  localStorage.setItem('pvCart', JSON.stringify(cart));
  dispatchCartUpdate();
};

export const updateCartQty = (productId, qty) => {
  const cart = getCart();
  const index = cart.findIndex(item => item.id === productId || item.product?.id === productId);
  if (index !== -1) {
    if (qty <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].quantity = Math.max(1, Math.floor(qty));
    }
    localStorage.setItem('pvCart', JSON.stringify(cart));
    dispatchCartUpdate();
  }
};

export const clearCart = () => {
  localStorage.setItem('pvCart', JSON.stringify([]));
  dispatchCartUpdate();
};

export const getCartSubtotal = () => {
  const cart = getCart();
  return cart.reduce((sum, item) => {
    const product = item.product || getProductById(item.id);
    const price = product ? product.price : 0;
    return sum + (price * item.quantity);
  }, 0);
};

// Promo code & insurance state
let appliedPromo = { code: '', discountPercent: 0 };
let insuranceEnabled = true;

export const applyPromoCode = (code) => {
  const cleanCode = (code || '').toUpperCase().trim();
  if (cleanCode === 'POKEVAULT10') {
    appliedPromo = { code: 'POKEVAULT10', discountPercent: 10 };
    return { success: true, message: '★ 10% Vault Collector Discount Applied!' };
  } else if (cleanCode === 'LEGENDS20') {
    appliedPromo = { code: 'LEGENDS20', discountPercent: 20 };
    return { success: true, message: '★ 20% Legend Special Discount Applied!' };
  }
  return { success: false, message: 'Invalid promo code. Try POKEVAULT10 or LEGENDS20' };
};

export const getPromoState = () => appliedPromo;

export const setInsurance = (enabled) => {
  insuranceEnabled = !!enabled;
  dispatchCartUpdate();
};

export const getInsuranceState = () => insuranceEnabled;

// Wishlist Actions
export const isInWishlist = (productId) => {
  const wishlist = getWishlist();
  return wishlist.includes(productId);
};

export const toggleWishlist = (productId) => {
  let wishlist = getWishlist();
  let added = false;
  if (wishlist.includes(productId)) {
    wishlist = wishlist.filter(id => id !== productId);
  } else {
    wishlist.push(productId);
    added = true;
  }
  localStorage.setItem('pvWishlist', JSON.stringify(wishlist));
  dispatchWishlistUpdate();
  return added;
};
