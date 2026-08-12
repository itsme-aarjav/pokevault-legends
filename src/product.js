/**
 * POKÉVAULT LEGENDS — Standalone Product Detail Page Controller
 * Reads ?id= from URL and renders full product details + customer reviews experience.
 */

import { renderNavbar, initNavbarEvents } from './components/navbar.js';
import { renderFooter } from './components/footer.js';
import { renderCartDrawer, initCartDrawerEvents } from './components/cart-drawer.js';
import { renderProductCard, bindProductCardEvents } from './components/product-card.js';
import { getAllProducts, getProductById } from './data/products.js';
import { getReviewsForProduct } from './data/reviews.js';
import { addToCart, toggleWishlist, isInWishlist } from './utils/store.js';
import { injectProductSeo } from './utils/seo.js';

import confettiModule from 'canvas-confetti';
const confetti = confettiModule?.default || confettiModule || ((typeof window !== 'undefined' && window.confetti) ? window.confetti : () => {});

class ProductPage {
  constructor() {
    this.allProducts = getAllProducts();
    const params = new URLSearchParams(window.location.search);
    const cardId = params.get('id');
    this.product = getProductById(cardId) || this.allProducts[0];
    this.reviews = getReviewsForProduct(this.product.id);
    this.selectedQty = 1;

    // Inject Rich Schema.org Product, Offer, AggregateRating, Review & Breadcrumb JSON-LD
    injectProductSeo(this.product, this.reviews);

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

    // Calculate rating counts
    const fiveStarCount = this.reviews.filter(r => r.rating === 5).length;
    const fourStarCount = this.reviews.filter(r => r.rating === 4).length;
    const totalCount = this.reviews.length;
    const fivePercent = Math.round((fiveStarCount / totalCount) * 100);
    const fourPercent = Math.round((fourStarCount / totalCount) * 100);

    // Feature tags block
    const featureTags = (p.features && p.features.length > 0)
      ? p.features
      : [
          "100% Vault Authenticity Guaranteed",
          "Custom EVA Foam Armor Box",
          "Micro-Inspected Sculpt & Foil",
          "Tamper-Proof Serialized Seal",
          "Insured Priority Express Shipping"
        ];

    const initialCoins = Math.floor(p.price * 10);
    const initialRewardsVal = (initialCoins / 100).toFixed(2);

    root.innerHTML = `
      <!-- BREADCRUMBS -->
      <div class="breadcrumb-nav" style="margin-bottom: 1.5rem;">
        <a href="index.html">Home</a> <span>/</span> 
        <a href="shop.html">Shop Marketplace</a> <span>/</span> 
        <a href="category.html?id=${p.category}">${p.categoryName}</a> <span>/</span> 
        <span class="current">${p.name}</span>
      </div>

      <!-- MAIN PRODUCT GRID -->
      <div class="pd-grid">
        <!-- LEFT: GALLERY & IMAGES -->
        <div class="pd-stage-box">
          <div id="pdMainStageCanvas" class="pd-main-stage">
            <img id="mainGalleryImg" src="${p.image}" alt="${p.name}" class="pd-main-img" />
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
          <!-- LIVE FOMO & SOCIAL PROOF BADGE -->
          <div class="pd-badges-row">
            <span class="stock-badge in-stock">${p.availability}</span>
            <span style="font-family:var(--font-mono); font-size:0.8rem; font-weight:700; background:#000; color:#FFF056; padding:2px 8px; border-radius:4px;">${p.categoryName}</span>
            <span style="background:#FEF2F2; color:#DC2626; border:1px solid #FCA5A5; font-family:var(--font-mono); font-weight:800; font-size:0.78rem; padding:3px 10px; border-radius:12px; display:inline-flex; align-items:center; gap:4px;">
              🔥 <strong>14 collectors</strong> viewing right now
            </span>
          </div>

          <h1 class="pd-product-title">${p.name}</h1>

          <div style="font-family:var(--font-mono); font-size:0.9rem; color:#666; margin-bottom:1rem;">
            ${p.subName || p.shortDescription} • SKU: ${p.sku || p.id}
          </div>

          <!-- RATING ROW -->
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:1.25rem; font-family:var(--font-mono); font-size:0.9rem;">
            <span style="color:var(--accent-orange); font-size:1.1rem;">${starsHtml}</span>
            <strong style="color:#000;">${p.rating.toFixed(1)}</strong>
            <a href="#reviewsSection" style="color:#000; text-decoration:underline;">(${totalCount} customer reviews)</a>
          </div>

          <!-- PRICE & BNPL INSTALLMENTS BOX -->
          <div class="pd-price-box">
            <div class="pd-price-row">
              <div class="pd-price-main">$${p.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              ${p.originalPrice ? `<div class="pd-price-original">$${p.originalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>` : ''}
              ${p.discountPercent ? `<span class="pd-discount-badge">SAVE ${p.discountPercent}%</span>` : ''}
            </div>

            <!-- BUY NOW PAY LATER (BNPL) WIDGET -->
            <div class="pd-bnpl-row">
              <span>or 4 interest-free payments of <strong>$${(p.price / 4).toFixed(2)}</strong> with</span>
              <span style="font-weight:900; background:#FFB3C6; color:#000; padding:1px 6px; border-radius:4px; font-size:0.75rem;">Klarna.</span>
              <span style="font-weight:900; background:#B2F5EA; color:#000; padding:1px 6px; border-radius:4px; font-size:0.75rem;">afterpay</span>
            </div>
          </div>

          <!-- GEOLOCATION DELIVERY ESTIMATOR & TRUST BADGES -->
          <div class="pd-delivery-box">
            <div class="pd-delivery-row">
              <span style="font-size:1.2rem;">🚚</span>
              <span>Order within <strong style="color:var(--accent-red);">2 hrs 14 mins</strong> to get it by <strong style="text-decoration:underline;">Friday, Aug 14</strong></span>
            </div>
            <div class="pd-trust-badges">
              <span class="authenticity-trigger" id="vaultAuthBadgeTrigger" style="color:#059669; font-weight:800; display:inline-flex; align-items:center; gap:4px;" title="Click to view our 5-Point Vault Inspection Guarantee">🛡️ 100% Vault Authenticity Guaranteed</span>
              <span style="color:#2563EB; font-weight:800; display:inline-flex; align-items:center; gap:4px;" id="pdPokeCoinsSpan">
                🪙 Earn <span id="pdCoinsCount">${initialCoins.toLocaleString('en-US')}</span> PokéCoins (<span id="pdCoinsValue">$${initialRewardsVal}</span> rewards value)
              </span>
            </div>
          </div>

          <!-- HIGHLIGHTED FEATURES BLOCK -->
          <div class="pd-features-box">
            <div class="pd-features-header">
              <span>✨ HIGHLIGHTED PRODUCT FEATURES</span>
            </div>
            <div class="pd-features-list">
              ${featureTags.map(tag => `
                <span class="pd-feature-tag">
                  <span style="color:var(--accent-red); font-size:0.9rem;">✔</span> ${tag}
                </span>
              `).join('')}
            </div>
          </div>

          <!-- DESCRIPTION -->
          <p class="pd-description">
            ${p.description}
          </p>

          <!-- QUANTITY & ACTIONS -->
          <div class="pd-actions-row">
            <div class="qty-control-box" style="background:#FFF; padding:4px; border-radius:6px;">
              <button class="btn-qty" id="pdQtyDec">-</button>
              <span id="pdQtyVal" style="font-family:var(--font-mono); font-weight:900; font-size:1.1rem; padding:0 12px;">1</span>
              <button class="btn-qty" id="pdQtyInc">+</button>
            </div>

            <button class="btn-pill pd-add-cart-btn" id="pdAddToCartBtn">
              🛒 Add to Cart
            </button>

            <button class="btn-inspect pd-wishlist-btn ${isWishlisted ? 'active' : ''}" id="pdWishlistBtn" title="Save to Wishlist">
              ${isWishlisted ? '❤️ Saved' : '🤍 Wishlist'}
            </button>
          </div>

          <!-- STICKY ADD TO CART BAR ON SCROLL -->
          <div class="sticky-buy-bar" id="stickyBuyBar">
            <div class="sticky-product-info">
              <img src="${p.image}" class="sticky-product-thumb" alt="${p.name}" />
              <div class="sticky-product-text">
                <div class="sticky-product-title">${p.name}</div>
                <div class="sticky-product-price" id="stickyPriceVal">$${(p.price * this.selectedQty).toFixed(2)}</div>
              </div>
            </div>
            <div class="sticky-buy-actions">
              <div class="qty-control-box" style="background:#FFF; padding:2px; border-radius:6px; display:flex; align-items:center;">
                <button class="btn-qty" id="stickyQtyDec">-</button>
                <span id="stickyQtyVal" style="font-family:var(--font-mono); font-weight:900; font-size:1rem; padding:0 8px;">1</span>
                <button class="btn-qty" id="stickyQtyInc">+</button>
              </div>
              <button class="btn-pill" id="stickyAddToCartBtn" style="padding:10px 20px; font-size:1rem; flex-shrink:0;">
                🛒 Add to Cart
              </button>
            </div>
          </div>

          <!-- SPECIFICATIONS ACCORDION / TABLE -->
          <div class="pd-specs-box">
            <h3 class="pd-specs-title">PRODUCT SPECIFICATIONS</h3>
            <div class="pd-specs-table-wrap">
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
      </div>

      <!-- AUTHENTICITY TRUST MODAL OVERLAY -->
      <div class="vault-modal-overlay" id="vaultAuthModalOverlay">
        <div class="vault-modal-card">
          <div class="vault-modal-header">
            <div>
              <div style="font-family:var(--font-mono); font-size:0.8rem; font-weight:800; color:var(--accent-red); letter-spacing:1px;">POKÉVAULT LEGENDS GUARANTEE</div>
              <h3 class="vault-modal-title">🛡️ 5-POINT VAULT INSPECTION PROCESS</h3>
            </div>
            <button class="vault-modal-close" id="closeVaultAuthModal" aria-label="Close modal">&times;</button>
          </div>

          <p style="font-family:var(--font-mono); font-size:0.88rem; color:#475569; margin-bottom:1.5rem; line-height:1.5;">
            Every collectible in our vault undergoes a rigorous 5-step authentication audit by certified master appraisers before entering collector hands.
          </p>

          <div class="inspection-steps-grid">
            <div class="inspection-step-item">
              <div class="inspection-step-num">1</div>
              <div>
                <div class="inspection-step-title">Verification Seal & Serial Tracking</div>
                <div class="inspection-step-desc">Tamper-evident holographic vault seal applied with unique encrypted registry code cross-referenced against official manufacturer databases.</div>
              </div>
            </div>

            <div class="inspection-step-item">
              <div class="inspection-step-num">2</div>
              <div>
                <div class="inspection-step-title">Box & Packaging Integrity Audit</div>
                <div class="inspection-step-desc">Full 360-degree structural inspection checking factory wrap seals, corner sharpness, foil luster, and mint box condition.</div>
              </div>
            </div>

            <div class="inspection-step-item">
              <div class="inspection-step-num">3</div>
              <div>
                <div class="inspection-step-title">Paint & Sculpt Precision Audit</div>
                <div class="inspection-step-desc">Artisan microscopic review verifying color fidelity, paint edge cleanliness, seam alignment, and 100% zero factory defect tolerance.</div>
              </div>
            </div>

            <div class="inspection-step-item">
              <div class="inspection-step-num">4</div>
              <div>
                <div class="inspection-step-title">Protective Vault Packaging</div>
                <div class="inspection-step-desc">Enclosed in custom-molded EVA foam inserts and heavy-duty double-walled armor boxes designed for bulletproof transit.</div>
              </div>
            </div>

            <div class="inspection-step-item">
              <div class="inspection-step-num">5</div>
              <div>
                <div class="inspection-step-title">Guaranteed Replacement & Refund</div>
                <div class="inspection-step-desc">Back-to-back 100% money-back guarantee or immediate vault replacement if your item fails any authenticity standard.</div>
              </div>
            </div>
          </div>
        </div>
      </div>


      <!-- CUSTOMER REVIEWS & RATINGS SECTION -->
      <section id="reviewsSection" style="border-top:3px solid #000; padding-top:3rem; margin-bottom:4rem;">
        <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:2rem; flex-wrap:wrap; gap:1rem;">
          <div>
            <div style="font-family:var(--font-mono); font-weight:700; color:var(--accent-red); font-size:0.9rem; letter-spacing:1px;">VERIFIED BUYER REVIEWS</div>
            <h2 class="title-section" style="margin-top:4px; margin-bottom:0;">CUSTOMER REVIEWS (${totalCount})</h2>
          </div>

          <button class="btn-pill" id="toggleReviewFormBtn" style="font-size:0.95rem; padding:10px 20px;">
            ✍️ Write a Review
          </button>
        </div>

        <!-- REVIEWS SUMMARY & RATING BREAKDOWN GRID -->
        <div class="pd-reviews-summary">
          <!-- Overall Rating Score Box -->
          <div class="pd-rating-score-box">
            <div style="font-family:var(--font-title); font-size:4rem; font-weight:900; line-height:1; color:#000;">${p.rating.toFixed(1)}</div>
            <div style="color:var(--accent-orange); font-size:1.4rem; margin:8px 0;">★★★★★</div>
            <div style="font-family:var(--font-mono); font-size:0.85rem; color:#666;">Based on ${totalCount} verified ratings</div>
            <div style="margin-top:12px; background:#E8F5E9; color:#2E7D32; font-family:var(--font-mono); font-weight:700; font-size:0.8rem; padding:4px 10px; border-radius:20px;">
              ✓ 100% Vault Authenticity Verified
            </div>
          </div>

          <!-- Rating Bar Breakdown -->
          <div style="display:flex; flex-direction:column; justify-content:center; gap:10px;">
            <div style="display:flex; align-items:center; gap:12px; font-family:var(--font-mono); font-size:0.85rem;">
              <span style="width:50px; font-weight:700;">5 Stars</span>
              <div style="flex:1; background:#EEE; height:12px; border-radius:6px; overflow:hidden; border:1px solid #000;">
                <div style="width:${fivePercent}%; background:#FFC107; height:100%;"></div>
              </div>
              <span style="width:40px; text-align:right;">${fivePercent}%</span>
            </div>

            <div style="display:flex; align-items:center; gap:12px; font-family:var(--font-mono); font-size:0.85rem;">
              <span style="width:50px; font-weight:700;">4 Stars</span>
              <div style="flex:1; background:#EEE; height:12px; border-radius:6px; overflow:hidden; border:1px solid #000;">
                <div style="width:${fourPercent}%; background:#FFC107; height:100%;"></div>
              </div>
              <span style="width:40px; text-align:right;">${fourPercent}%</span>
            </div>

            <div style="display:flex; align-items:center; gap:12px; font-family:var(--font-mono); font-size:0.85rem;">
              <span style="width:50px; font-weight:700;">3 Stars</span>
              <div style="flex:1; background:#EEE; height:12px; border-radius:6px; overflow:hidden; border:1px solid #000;">
                <div style="width:0%; background:#FFC107; height:100%;"></div>
              </div>
              <span style="width:40px; text-align:right;">0%</span>
            </div>

            <div style="display:flex; align-items:center; gap:12px; font-family:var(--font-mono); font-size:0.85rem;">
              <span style="width:50px; font-weight:700;">2 Stars</span>
              <div style="flex:1; background:#EEE; height:12px; border-radius:6px; overflow:hidden; border:1px solid #000;">
                <div style="width:0%; background:#FFC107; height:100%;"></div>
              </div>
              <span style="width:40px; text-align:right;">0%</span>
            </div>

            <div style="display:flex; align-items:center; gap:12px; font-family:var(--font-mono); font-size:0.85rem;">
              <span style="width:50px; font-weight:700;">1 Star</span>
              <div style="flex:1; background:#EEE; height:12px; border-radius:6px; overflow:hidden; border:1px solid #000;">
                <div style="width:0%; background:#FFC107; height:100%;"></div>
              </div>
              <span style="width:40px; text-align:right;">0%</span>
            </div>
          </div>
        </div>

        <!-- WRITE A REVIEW FORM (HIDDEN BY DEFAULT, TOGGLED BY BUTTON) -->
        <div id="writeReviewFormContainer" class="pd-review-form-container" style="display:none;">
          <h3 style="font-family:var(--font-title); font-weight:900; font-size:1.3rem; margin-top:0; margin-bottom:1.25rem;">WRITE A CUSTOMER REVIEW</h3>
          <form id="newReviewForm" style="display:flex; flex-direction:column; gap:1rem;">
            <div class="pd-review-form-row">
              <div>
                <label style="display:block; font-family:var(--font-mono); font-weight:700; font-size:0.85rem; margin-bottom:4px;">Your Name / Handle</label>
                <input type="text" id="reviewAuthorInput" required placeholder="e.g. KantoCollector99" style="width:100%; padding:10px; border:2px solid #000; border-radius:6px; font-family:var(--font-mono);" />
              </div>
              <div>
                <label style="display:block; font-family:var(--font-mono); font-weight:700; font-size:0.85rem; margin-bottom:4px;">Rating</label>
                <select id="reviewRatingInput" style="width:100%; padding:10px; border:2px solid #000; border-radius:6px; font-family:var(--font-mono); font-weight:700;">
                  <option value="5">★★★★★ (5 / 5 — Excellent)</option>
                  <option value="4">★★★★☆ (4 / 5 — Very Good)</option>
                  <option value="3">★★★☆☆ (3 / 5 — Average)</option>
                </select>
              </div>
            </div>

            <div>
              <label style="display:block; font-family:var(--font-mono); font-weight:700; font-size:0.85rem; margin-bottom:4px;">Review Headline / Title</label>
              <input type="text" id="reviewTitleInput" required placeholder="e.g. Absolutely Outstanding Quality!" style="width:100%; padding:10px; border:2px solid #000; border-radius:6px; font-family:var(--font-mono);" />
            </div>

            <div>
              <label style="display:block; font-family:var(--font-mono); font-weight:700; font-size:0.85rem; margin-bottom:4px;">Detailed Review Comment</label>
              <textarea id="reviewCommentInput" rows="4" required placeholder="Share details of your experience with this item..." style="width:100%; padding:10px; border:2px solid #000; border-radius:6px; font-family:var(--font-mono);"></textarea>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:1rem;">
              <button type="button" class="btn-inspect" id="cancelReviewBtn">Cancel</button>
              <button type="submit" class="btn-pill">Post Verified Review</button>
            </div>
          </form>
        </div>

        <!-- REVIEWS LIST -->
        <div id="reviewsList" style="display:flex; flex-direction:column; gap:1.25rem;">
          ${this.reviews.map(rev => `
            <div class="review-card">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
                <div style="display:flex; align-items:center; gap:10px;">
                  <div style="width:40px; height:40px; background:#FFF056; border:2px solid #000; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.3rem;">
                    ${rev.avatar || '👤'}
                  </div>
                  <div>
                    <div style="font-family:var(--font-title); font-weight:900; font-size:1.05rem; color:#000;">
                      ${rev.author}
                      ${rev.verified ? `<span style="font-size:0.75rem; font-family:var(--font-mono); font-weight:700; background:#E8F5E9; color:#2E7D32; padding:2px 8px; border-radius:12px; margin-left:6px; border:1px solid #A5D6A7;">✓ Verified Buyer</span>` : ''}
                    </div>
                    <div style="font-family:var(--font-mono); font-size:0.75rem; color:#888;">${rev.date}</div>
                  </div>
                </div>

                <div style="color:var(--accent-orange); font-size:1.1rem;">
                  ${'★'.repeat(rev.rating)}${'☆'.repeat(5 - rev.rating)}
                </div>
              </div>

              <h4 style="font-family:var(--font-title); font-weight:900; font-size:1.1rem; margin:0 0 8px; color:#000;">
                ${rev.title}
              </h4>

              <p style="font-family:var(--font-mono); font-size:0.9rem; line-height:1.5; color:#333; margin:0 0 12px;">
                ${rev.comment}
              </p>

              <div style="display:flex; align-items:center; justify-content:flex-end;">
                <button class="helpful-btn" style="background:none; border:1px solid #DDD; padding:4px 10px; border-radius:4px; font-family:var(--font-mono); font-size:0.75rem; cursor:pointer; display:flex; align-items:center; gap:4px;">
                  👍 Helpful (<span class="helpful-count">0</span>)
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

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

    // Quantity & Price & PokéCoins Synchronized Handlers
    const updateQtyAndPrices = (newQty) => {
      this.selectedQty = Math.max(1, newQty);
      const qtyVal = document.getElementById('pdQtyVal');
      const stickyQtyVal = document.getElementById('stickyQtyVal');
      const stickyPriceVal = document.getElementById('stickyPriceVal');
      const coinsCount = document.getElementById('pdCoinsCount');
      const coinsValue = document.getElementById('pdCoinsValue');

      if (qtyVal) qtyVal.textContent = this.selectedQty;
      if (stickyQtyVal) stickyQtyVal.textContent = this.selectedQty;

      const totalCoins = Math.floor((p.price * this.selectedQty) * 10);
      const rewardsVal = (totalCoins / 100).toFixed(2);

      if (coinsCount) coinsCount.textContent = totalCoins.toLocaleString('en-US');
      if (coinsValue) coinsValue.textContent = `$${rewardsVal}`;
      if (stickyPriceVal) stickyPriceVal.textContent = `$${(p.price * this.selectedQty).toFixed(2)}`;
    };

    document.getElementById('pdQtyDec')?.addEventListener('click', () => updateQtyAndPrices(this.selectedQty - 1));
    document.getElementById('pdQtyInc')?.addEventListener('click', () => updateQtyAndPrices(this.selectedQty + 1));
    document.getElementById('stickyQtyDec')?.addEventListener('click', () => updateQtyAndPrices(this.selectedQty - 1));
    document.getElementById('stickyQtyInc')?.addEventListener('click', () => updateQtyAndPrices(this.selectedQty + 1));

    // Authenticity Trust Modal Handlers
    const modalOverlay = document.getElementById('vaultAuthModalOverlay');
    const closeModalBtn = document.getElementById('closeVaultAuthModal');
    const badgeTrigger = document.getElementById('vaultAuthBadgeTrigger');
    const summaryTrigger = document.getElementById('vaultAuthSummaryTrigger');

    const openAuthModal = () => modalOverlay?.classList.add('open');
    const closeAuthModal = () => modalOverlay?.classList.remove('open');

    badgeTrigger?.addEventListener('click', openAuthModal);
    summaryTrigger?.addEventListener('click', openAuthModal);
    closeModalBtn?.addEventListener('click', closeAuthModal);
    modalOverlay?.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeAuthModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay?.classList.contains('open')) closeAuthModal();
    });

    // Add to Cart Handlers
    const mainAddToCartBtn = document.getElementById('pdAddToCartBtn');
    const stickyAddToCartBtn = document.getElementById('stickyAddToCartBtn');

    const handleAddToCart = (btn) => {
      if (btn) btn.textContent = '✓ Added to Vault!';
      addToCart(p.id, this.selectedQty);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.75 } });
      setTimeout(() => {
        if (btn) btn.textContent = '🛒 Add to Cart';
      }, 1500);
    };

    mainAddToCartBtn?.addEventListener('click', () => handleAddToCart(mainAddToCartBtn));
    stickyAddToCartBtn?.addEventListener('click', () => handleAddToCart(stickyAddToCartBtn));

    // Sticky Buy Bar Scroll Listener (Desktop & Mobile)
    const stickyBar = document.getElementById('stickyBuyBar');
    if (stickyBar && mainAddToCartBtn) {
      const checkStickyScroll = () => {
        const rect = mainAddToCartBtn.getBoundingClientRect();
        if (rect.bottom < 0) {
          stickyBar.classList.add('visible');
        } else {
          stickyBar.classList.remove('visible');
        }
      };
      window.addEventListener('scroll', checkStickyScroll, { passive: true });
      checkStickyScroll();
    }

    // Wishlist Toggle
    const wishlistBtn = document.getElementById('pdWishlistBtn');
    wishlistBtn?.addEventListener('click', () => {
      const added = toggleWishlist(p.id);
      wishlistBtn.textContent = added ? '❤️ Saved' : '🤍 Wishlist';
    });

    // Toggle Review Form
    const toggleFormBtn = document.getElementById('toggleReviewFormBtn');
    const formContainer = document.getElementById('writeReviewFormContainer');
    const cancelFormBtn = document.getElementById('cancelReviewBtn');

    toggleFormBtn?.addEventListener('click', () => {
      if (formContainer) {
        const isHidden = formContainer.style.display === 'none';
        formContainer.style.display = isHidden ? 'block' : 'none';
        if (isHidden) formContainer.scrollIntoView({ behavior: 'smooth' });
      }
    });

    cancelFormBtn?.addEventListener('click', () => {
      if (formContainer) formContainer.style.display = 'none';
    });

    // Review Form Submit Handler
    const reviewForm = document.getElementById('newReviewForm');
    reviewForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const author = document.getElementById('reviewAuthorInput').value.trim();
      const rating = parseInt(document.getElementById('reviewRatingInput').value);
      const title = document.getElementById('reviewTitleInput').value.trim();
      const comment = document.getElementById('reviewCommentInput').value.trim();

      const newReview = {
        id: `rev-user-${Date.now()}`,
        author,
        avatar: '🌟',
        rating,
        date: 'Just now',
        verified: true,
        title,
        comment
      };

      this.reviews.unshift(newReview);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      if (formContainer) formContainer.style.display = 'none';
      this.renderProductDetails();
    });

    // Helpful Buttons Handler
    root.querySelectorAll('.helpful-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const countSpan = btn.querySelector('.helpful-count');
        if (countSpan) {
          let count = parseInt(countSpan.textContent) || 0;
          count++;
          countSpan.textContent = count;
          btn.style.background = '#E8F5E9';
          btn.style.borderColor = '#A5D6A7';
        }
      });
    });

    // Bind Related Product Cards
    const relatedGrid = document.getElementById('relatedProductsGrid');
    if (relatedGrid) bindProductCardEvents(relatedGrid);
  }
}

new ProductPage();
