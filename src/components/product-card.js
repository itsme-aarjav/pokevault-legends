/**
 * POKÉVAULT LEGENDS — Product Card Component Renderer
 * Renders consistent e-commerce product cards across all pages.
 */

import { isInWishlist, toggleWishlist, addToCart } from '../utils/store.js';
import confetti from 'canvas-confetti';

export function renderProductCard(product) {
  const isWishlisted = isInWishlist(product.id);
  const starsHtml = '★'.repeat(Math.floor(product.rating)) + (product.rating % 1 !== 0 ? '½' : '');

  return `
    <div class="card-item-box" data-product-id="${product.id}">
      <div class="card-image-wrap">
        ${product.discountPercent ? `<div class="card-discount-tag">-${product.discountPercent}%</div>` : ''}
        ${product.badge ? `<div class="card-badge">${product.badge}</div>` : ''}
        <button class="card-wishlist-btn ${isWishlisted ? 'active' : ''}" data-wishlist-id="${product.id}" aria-label="Toggle Wishlist">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="${isWishlisted ? '#E94057' : 'none'}" stroke="${isWishlisted ? '#E94057' : '#000'}" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
        <a href="product.html?id=${product.id}" style="display:block; width:100%; height:100%;">
          <img src="${product.image}" alt="${product.name}" class="card-main-img" loading="lazy" />
        </a>
      </div>

      <div class="card-info-box">
        <div class="card-category-label">${product.categoryName}</div>
        <a href="product.html?id=${product.id}" class="card-title-link">
          <h3 class="card-title-text">${product.name}</h3>
        </a>
        <div class="card-sub-text">${product.subName || product.shortDescription}</div>

        <div class="card-rating-row">
          <span class="card-stars">${starsHtml}</span>
          <span class="card-rating-num">${product.rating.toFixed(1)}</span>
          <span class="card-reviews-count">(${product.reviewCount})</span>
        </div>

        <div class="card-price-row">
          <div class="card-price-current">$${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          ${product.originalPrice ? `<div class="card-price-original">$${product.originalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>` : ''}
        </div>

        <div class="card-actions-row">
          <button class="btn-pill btn-add-cart-fast" data-cart-id="${product.id}">
            🛒 Add to Cart
          </button>
          <a href="product.html?id=${product.id}" class="btn-inspect">
            Details →
          </a>
        </div>
      </div>
    </div>
  `;
}

export function bindProductCardEvents(container) {
  if (!container) return;

  // Wishlist Toggle Buttons
  container.querySelectorAll('[data-wishlist-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = btn.getAttribute('data-wishlist-id');
      const added = toggleWishlist(id);
      btn.classList.toggle('active', added);
      const svgPath = btn.querySelector('path');
      if (svgPath) {
        svgPath.setAttribute('fill', added ? '#E94057' : 'none');
        svgPath.setAttribute('stroke', added ? '#E94057' : '#000');
      }
    });
  });

  // Fast Add to Cart Buttons
  container.querySelectorAll('[data-cart-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = btn.getAttribute('data-cart-id');
      addToCart(id, 1);
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
    });
  });
}
