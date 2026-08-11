/**
 * POKÉVAULT LEGENDS — Standalone Product Detail Page Controller
 * Reads ?id= from URL and renders the complete product details experience for all 60 items.
 */

import { renderNavbar, initNavbarEvents } from './components/navbar.js';
import { renderFooter } from './components/footer.js';
import { renderCartDrawer, initCartDrawerEvents } from './components/cart-drawer.js';
import { renderProductCard, bindProductCardEvents } from './components/product-card.js';
import { getAllProducts, getProductById } from './data/products.js';
import { addToCart, toggleWishlist, isInWishlist } from './utils/store.js';
import confetti from 'canvas-confetti';

class ProductPage {
  constructor() {
    this.allProducts = getAllProducts();
    const params = new URLSearchParams(window.location.search);
    const cardId = params.get('id');
    this.product = getProductById(cardId) || this.allProducts[0];
    this.selectedQty = 1;

    document.title = `${this.product.name} — POKÉVAULT LEGENDS`;

    this.initLayout();
    this.renderProductDetails();
  }

  initLayout() {
    document.getElementById('navbarRoot').innerHTML = renderNavbar('shop');
    document.getElementById('cartDrawerRoot').innerHTML = renderCartDrawer();
    document.getElementById('footerRoot').innerHTML = renderFooter();

    initNavbarEvents();
    initCartDrawerEvents();
  }

  renderProductDetails() {
    const root = document.getElementById('productPageRoot');
    if (!root || !this.product) return;

    const p = this.product;
    const isWishlisted = isInWishlist(p.id);
    const starsHtml = '★'.repeat(Math.floor(p.rating)) + (p.rating % 1 !== 0 ? '½' : '');

    // Get related items in same category or associated Pokémon
    const related = this.allProducts
      .filter(item => item.id !== p.id && (item.category === p.category || item.pokemon === p.pokemon))
      .slice(0, 4);

    root.innerHTML = `
      <!-- BREADCRUMBS -->
      <div class="breadcrumb-nav" style="margin-bottom: 1.5rem;">
        <a href="index.html">Home</a> <span>/</span> 
        <a href="shop.html">Shop Marketplace</a> <span>/</span> 
        <a href="category.html?id=${p.category}">${p.categoryName}</a> <span>/</span> 
        <span class="current">${p.name}</span>
      </div>

      <!-- MAIN PRODUCT GRID -->
      <div class="pd-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; margin-bottom: 4rem;">
        <!-- LEFT: GALLERY & IMAGES -->
        <div class="pd-stage-box">
          <div id="pdMainStageCanvas" style="background:#FFF; border:3px solid #000; box-shadow:6px 6px 0px #000; border-radius:8px; padding:1.5rem; text-align:center; min-height:380px; display:flex; align-items:center; justify-content:center;">
            <img id="mainGalleryImg" src="${p.image}" alt="${p.name}" style="max-width:100%; max-height:380px; object-fit:contain;" />
          </div>

          <!-- THUMBNAIL STRIP -->
          ${(p.gallery && p.gallery.length > 1) ? `
            <div style="display:flex; gap:10px; margin-top:1rem; overflow-x:auto; padding-bottom:6px;">
              ${p.gallery.map((imgUrl, idx) => `
                <button class="thumb-btn ${idx === 0 ? 'active' : ''}" data-img="${imgUrl}" style="border:2px solid #000; background:#FFF; border-radius:6px; padding:4px; cursor:pointer; width:70px; height:70px;">
                  <img src="${imgUrl}" style="width:100%; height:100%; object-fit:contain;" alt="Thumb ${idx}" />
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <!-- RIGHT: DETAILS & BUYING -->
        <div class="pd-details-box">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
            <span class="stock-badge in-stock">${p.availability}</span>
            <span style="font-family:var(--font-mono); font-size:0.8rem; font-weight:700; background:#000; color:#FFF056; padding:2px 8px; border-radius:4px;">${p.categoryName}</span>
          </div>

          <h1 style="font-family:var(--font-title); font-size:clamp(1.8rem, 4vw, 2.5rem); font-weight:900; margin:0 0 8px; color:#000;">
            ${p.name}
          </h1>

          <div style="font-family:var(--font-mono); font-size:0.9rem; color:#666; margin-bottom:1rem;">
            ${p.subName || p.shortDescription} • SKU: ${p.sku || p.id}
          </div>

          <!-- RATING ROW -->
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:1.5rem; font-family:var(--font-mono); font-size:0.9rem;">
            <span style="color:var(--accent-orange); font-size:1.1rem;">${starsHtml}</span>
            <strong style="color:#000;">${p.rating.toFixed(1)}</strong>
            <span style="color:#666;">(${p.reviewCount} customer reviews)</span>
          </div>

          <!-- PRICE BOX -->
          <div style="background:#FFFDE7; border:3px solid #000; box-shadow:4px 4px 0px #000; border-radius:8px; padding:1.25rem; margin-bottom:1.5rem; display:flex; align-items:baseline; gap:12px;">
            <div style="font-family:var(--font-title); font-size:2.2rem; font-weight:900; color:var(--accent-red);">$${p.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            ${p.originalPrice ? `<div style="font-family:var(--font-mono); text-decoration:line-through; color:#888; font-size:1.1rem;">$${p.originalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>` : ''}
            ${p.discountPercent ? `<span style="background:var(--accent-red); color:#FFF; font-family:var(--font-mono); font-weight:900; font-size:0.8rem; padding:4px 8px; border-radius:4px;">SAVE ${p.discountPercent}%</span>` : ''}
          </div>

          <!-- DESCRIPTION -->
          <p style="font-family:var(--font-mono); font-size:0.95rem; line-height:1.6; color:#222; margin-bottom:1.5rem;">
            ${p.description}
          </p>

          <!-- QUANTITY & ACTIONS -->
          <div style="display:flex; gap:12px; align-items:center; margin-bottom:2rem; flex-wrap:wrap;">
            <div class="qty-control-box" style="background:#FFF; padding:4px; border-radius:6px;">
              <button class="btn-qty" id="pdQtyDec">-</button>
              <span id="pdQtyVal" style="font-family:var(--font-mono); font-weight:900; font-size:1.1rem; padding:0 12px;">1</span>
              <button class="btn-qty" id="pdQtyInc">+</button>
            </div>

            <button class="btn-pill" id="pdAddToCartBtn" style="flex:1; min-width:200px; padding:14px; font-size:1.1rem;">
              🛒 Add to Cart
            </button>

            <button class="btn-inspect ${isWishlisted ? 'active' : ''}" id="pdWishlistBtn" style="padding:14px; font-size:1.1rem;" title="Save to Wishlist">
              ${isWishlisted ? '❤️ Saved' : '🤍 Wishlist'}
            </button>
          </div>

          <!-- SPECIFICATIONS ACCORDION / TABLE -->
          <div style="background:#FFF; border:3px solid #000; box-shadow:4px 4px 0px #000; border-radius:8px; padding:1.25rem;">
            <h3 style="font-family:var(--font-title); font-size:1.1rem; margin-top:0; border-bottom:2px solid #000; padding-bottom:8px;">PRODUCT SPECIFICATIONS</h3>
            <table class="admin-table" style="margin-top:10px;">
              <tbody>
                <tr><td>Category</td><td style="font-weight:700;">${p.categoryName}</td></tr>
                <tr><td>Associated Pokémon</td><td style="font-weight:700;">${p.pokemon}</td></tr>
                ${p.specs ? Object.entries(p.specs).map(([key, val]) => `
                  <tr><td>${key}</td><td style="font-weight:700;">${val}</td></tr>
                `).join('') : ''}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- RELATED PRODUCTS SECTION -->
      ${related.length > 0 ? `
        <section style="border-top:3px solid #000; padding-top:3rem;">
          <h2 class="title-section" style="margin-bottom:1.5rem;">RECOMMENDED FOR YOU</h2>
          <div class="cards-grid" id="relatedProductsGrid">
            ${related.map(item => renderProductCard(item)).join('')}
          </div>
        </section>
      ` : ''}
    `;

    // Bind Gallery Thumbnails
    root.querySelectorAll('.thumb-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        root.querySelectorAll('.thumb-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mainImg = document.getElementById('mainGalleryImg');
        if (mainImg) mainImg.src = btn.getAttribute('data-img');
      });
    });

    // Quantity Handlers
    const decBtn = document.getElementById('pdQtyDec');
    const incBtn = document.getElementById('pdQtyInc');
    const qtyVal = document.getElementById('pdQtyVal');

    decBtn?.addEventListener('click', () => {
      if (this.selectedQty > 1) {
        this.selectedQty--;
        if (qtyVal) qtyVal.textContent = this.selectedQty;
      }
    });

    incBtn?.addEventListener('click', () => {
      this.selectedQty++;
      if (qtyVal) qtyVal.textContent = this.selectedQty;
    });

    // Add to Cart
    document.getElementById('pdAddToCartBtn')?.addEventListener('click', () => {
      addToCart(p.id, this.selectedQty);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    });

    // Wishlist Toggle
    const wishlistBtn = document.getElementById('pdWishlistBtn');
    wishlistBtn?.addEventListener('click', () => {
      const added = toggleWishlist(p.id);
      wishlistBtn.textContent = added ? '❤️ Saved' : '🤍 Wishlist';
    });

    // Bind Related Product Cards
    const relatedGrid = document.getElementById('relatedProductsGrid');
    if (relatedGrid) bindProductCardEvents(relatedGrid);
  }
}

new ProductPage();
