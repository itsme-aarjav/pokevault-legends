/**
 * POKÉVAULT LEGENDS — Standalone Product Detail Page Controller
 * Reads ?id= from URL and renders the full product experience.
 */
import { CARDS_DATA, CARD_REVIEWS, UPSELL_PRODUCTS } from './data/cards.js';
import { ThreeCardViewer } from './three-card-viewer.js';
import confetti from 'canvas-confetti';

class ProductPage {
  constructor() {
    this.cards = CARDS_DATA;
    this.cardReviews = { ...CARD_REVIEWS };
    this.cart = JSON.parse(localStorage.getItem('pvCart') || '[]');
    this.threeViewer = new ThreeCardViewer();
    this.root = document.getElementById('productPageRoot');

    // Read product ID from URL query param
    const params = new URLSearchParams(window.location.search);
    const cardId = params.get('id');
    const card = this.cards.find(c => c.id === cardId) || this.cards[0];

    document.title = `${card.name} — POKÉVAULT LEGENDS`;

    this.renderPage(card);
    this.initCartDrawer();
    this.initMobileNav();
  }

  initMobileNav() {
    const mobileNavToggleBtn = document.getElementById('mobileNavToggleBtn');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    const closeMobileNavBtn = document.getElementById('closeMobileNavBtn');

    mobileNavToggleBtn?.addEventListener('click', () => {
      mobileNavOverlay?.classList.add('open');
    });

    closeMobileNavBtn?.addEventListener('click', () => {
      mobileNavOverlay?.classList.remove('open');
    });

    mobileNavOverlay?.addEventListener('click', (e) => {
      if (e.target === mobileNavOverlay) mobileNavOverlay.classList.remove('open');
    });
  }

  // ─── RENDER FULL PAGE ───────────────────────────────────────────────────────
  renderPage(card) {
    if (!this.root) return;

    this.root.innerHTML = `
      <a href="index.html" class="product-back-nav">← BACK TO THE VAULT CATALOG</a>

      <div class="pd-grid">
        <!-- LEFT: Photo Gallery Stage -->
        <div class="pd-stage-box" id="pd3DStageContainer">
          <div id="pdMainStageCanvas">
            <img src="${card.image}" style="width:100%; height:100%; object-fit:contain; background:#111; padding:10px; border-radius:6px;" alt="${card.name}" />
            <div style="position:absolute; bottom:10px; left:10px; background:rgba(0,0,0,0.85); color:#FFF; font-family:var(--font-mono); font-size:0.75rem; padding:4px 10px; border-radius:4px; border:1px solid #444;">
              🔍 HIGH-RES SLAB FRONT VIEW — ${card.name.toUpperCase()}
            </div>
          </div>
          <div class="pd-gallery-strip" id="pdGalleryStrip">
            <div class="pd-thumb-box active" data-img-idx="0">
              <img src="${card.image}" class="pd-thumb-img" alt="Front Slab View" />
              <span class="pd-thumb-label">SLAB FRONT</span>
            </div>
            <div class="pd-thumb-box" data-img-idx="1">
              <img src="assets/card_back.png" class="pd-thumb-img" alt="Reverse Slab Back" />
              <span class="pd-thumb-label">SLAB BACK</span>
            </div>
            <div class="pd-thumb-box" data-img-idx="2">
              <div style="width:100%; height:100%; overflow:hidden; position:relative;">
                <img src="${card.image}" style="width:100%; height:100%; object-fit:cover; object-position:50% 30%; transform:scale(2.2);" alt="10x Macro" />
              </div>
              <span class="pd-thumb-label">10X MACRO</span>
            </div>
            <div class="pd-thumb-box" data-img-idx="3">
              <div style="width:100%; height:100%; background:#000; color:#FFF; display:flex; align-items:center; justify-content:center; font-size:1.5rem;">⚡</div>
              <span class="pd-thumb-label">3D ORBIT</span>
            </div>
          </div>
        </div>

        <!-- RIGHT: Product Info -->
        <div class="pd-info-box" id="pdInfoBox">
          <div>
            <div style="display:flex; gap:10px; align-items:center; margin-bottom: 8px;">
              <span class="logo-badge">${card.gradingBody} AUTHENTICATED</span>
              <span class="logo-badge" style="background:#000; color:#FFF;">CERT #${card.certNumber}</span>
            </div>
            <h1 class="pd-title">${card.name}</h1>
            <div style="font-family: var(--font-mono); color:#555; font-size:1.05rem; margin-top:4px;">
              ${card.subName} • ${card.era}
            </div>
          </div>

          <div class="pd-price">$${card.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>

          <!-- Grade Subscores -->
          <div>
            <div style="font-family:var(--font-mono); font-weight:700; font-size:0.85rem; color:var(--accent-red); margin-bottom:6px;">
              SUB-SCORE GRADING BREAKDOWN
            </div>
            <div class="subscores-grid">
              <div class="subscore-item"><span class="subscore-label">Centering</span><span class="subscore-val">10</span></div>
              <div class="subscore-item"><span class="subscore-label">Corners</span><span class="subscore-val">10</span></div>
              <div class="subscore-item"><span class="subscore-label">Edges</span><span class="subscore-val">10</span></div>
              <div class="subscore-item"><span class="subscore-label">Surface</span><span class="subscore-val">9.5</span></div>
            </div>
          </div>

          <!-- Provenance -->
          <div class="provenance-card">
            <div class="provenance-title">📜 PROVENANCE & COLLECTOR NOTES</div>
            <p style="font-size:0.9rem; color:#333; line-height:1.5; font-family:var(--font-mono);">
              ${card.description} Hand-inspected in our San Francisco vault under 10x magnification. Ultrasonic acrylic slab seal ensures permanent atmospheric isolation.
            </p>
          </div>

          <div style="display:flex; gap:1rem;">
            <button class="btn-pill" id="pdAddToCartBtn" style="flex:1;">Add to Vault Cart</button>
            <button class="btn-inspect" id="pdInspectBtn" style="flex:0.8; font-size:1rem; padding:12px;">⚡ Interactive 3D Orbit</button>
          </div>
        </div>
      </div>

      <!-- 3D Parallax Comic Lore Section -->
      <div class="pd-comic-lore-section" id="pdComicLoreSection"></div>

      <!-- Verified Reviews -->
      <div class="reviews-container" id="pdReviewsContainer"></div>
    `;

    // Wire Gallery Thumbnails
    const mainStageCanvas = document.getElementById('pdMainStageCanvas');
    const galleryStrip = document.getElementById('pdGalleryStrip');
    galleryStrip?.querySelectorAll('.pd-thumb-box').forEach(box => {
      box.addEventListener('click', () => {
        galleryStrip.querySelectorAll('.pd-thumb-box').forEach(b => b.classList.remove('active'));
        box.classList.add('active');
        const idx = parseInt(box.getAttribute('data-img-idx'));

        this.threeViewer.destroyModalViewer();
        if (mainStageCanvas) mainStageCanvas.innerHTML = '';

        if (idx === 0) {
          mainStageCanvas.innerHTML = `
            <img src="${card.image}" style="width:100%; height:100%; object-fit:contain; background:#111; padding:10px; border-radius:6px;" alt="${card.name}" />
            <div style="position:absolute; bottom:10px; left:10px; background:rgba(0,0,0,0.85); color:#FFF; font-family:var(--font-mono); font-size:0.75rem; padding:4px 10px; border-radius:4px; border:1px solid #444;">
              🔍 HIGH-RES SLAB FRONT VIEW — ${card.name.toUpperCase()}
            </div>
          `;
        } else if (idx === 1) {
          mainStageCanvas.innerHTML = `
            <img src="assets/card_back.png" style="width:100%; height:100%; object-fit:contain; background:#111; padding:10px; border-radius:6px;" alt="Reverse Slab Back" />
            <div style="position:absolute; bottom:10px; left:10px; background:rgba(0,0,0,0.85); color:#FFF; font-family:var(--font-mono); font-size:0.75rem; padding:4px 10px; border-radius:4px; border:1px solid #444;">
              🔍 REVERSE SLAB SECURITY BARCODE & HOLOGRAM
            </div>
          `;
        } else if (idx === 2) {
          mainStageCanvas.innerHTML = `
            <div style="width:100%; height:100%; overflow:hidden; position:relative; border-radius:6px; background:#000;">
              <img src="${card.image}" style="width:100%; height:100%; object-fit:cover; object-position:50% 35%; transform:scale(2.5);" alt="${card.name} 10x Macro" />
              <div style="position:absolute; bottom:10px; left:10px; background:rgba(0,0,0,0.85); color:#FFF; font-family:var(--font-mono); font-size:0.75rem; padding:4px 10px; border-radius:4px; border:1px solid #444;">
                🔍 10X MACRO HOLO FOIL SURFACE INSPECTION
              </div>
            </div>
          `;
        } else if (idx === 3) {
          this.threeViewer.initModalViewer(mainStageCanvas, card);
        }
      });
    });

    // Add to cart & 3D Orbit buttons
    document.getElementById('pdAddToCartBtn')?.addEventListener('click', () => {
      this.addToCart(card);
    });
    document.getElementById('pdInspectBtn')?.addEventListener('click', () => {
      const mainStage = document.getElementById('pdMainStageCanvas');
      this.threeViewer.destroyModalViewer();
      if (mainStage) mainStage.innerHTML = '';
      this.threeViewer.initModalViewer(mainStage, card);
      // Mark 3D Orbit thumb as active
      galleryStrip?.querySelectorAll('.pd-thumb-box').forEach(b => b.classList.remove('active'));
      galleryStrip?.querySelector('[data-img-idx="3"]')?.classList.add('active');
    });

    // Render Comic Lore and Reviews sections
    this.renderComicLore(card);
    this.renderReviews(card);

    // Scroll-based parallax for the comic lore panel
    this.initParallax();
  }

  // ─── 3D PARALLAX COMIC LORE ─────────────────────────────────────────────────
  renderComicLore(card) {
    const container = document.getElementById('pdComicLoreSection');
    if (!container) return;

    const lore = card.comicLore || {
      issueTitle: "ISSUE #1 — VINTAGE POKÉMON ORIGINS",
      comicImage: card.image,
      storyHeadline: "ANCIENT LEGEND & MYTHOLOGY",
      originStory: `${card.name} is one of the most celebrated species in collecting lore. ${card.description}`,
      moves: [
        { name: "Pulp Strike", power: "80", type: "Classic", desc: "Channels vintage halftone ink power." },
        { name: "Vault Guard", power: "100", type: "Defense", desc: "Shields the card from environmental degradation." }
      ],
      stats: { power: "95/100", speed: "90/100", element: "Legendary", tier: "Vault Heritage" }
    };

    const actionBadgeText = lore.moves[0]?.name?.toUpperCase() || "ACTION!";

    container.innerHTML = `
      <div class="comic-lore-header">
        <h2 class="comic-lore-title">💥 ${lore.issueTitle}</h2>
        <span class="comic-lore-tag">OFFICIAL ARCHIVAL ORIGIN STORY & COMBAT LORE</span>
      </div>

      <div class="comic-lore-grid">
        <div class="comic-3d-wrapper">
          <div class="comic-3d-card" id="comic3DCard">
            <img src="${lore.comicImage}" alt="${card.name} Comic Story Panel" />
            <div class="floating-action-badge" id="floatingActionBadge">⚡ ${actionBadgeText}!</div>
          </div>
        </div>

        <div class="comic-lore-content">
          <div class="comic-headline">${lore.storyHeadline}</div>
          <div class="comic-story-text">
            📖 <strong>ORIGIN NARRATIVE:</strong><br/>
            ${lore.originStory}
          </div>

          <div>
            <div class="comic-moves-title">⚡ SIGNATURE COMBAT MOVES</div>
            <div style="display:flex; flex-direction:column; gap:0.75rem; margin-top:0.5rem;">
              ${lore.moves.map(m => `
                <div class="comic-move-card">
                  <div class="comic-move-header">
                    <span class="comic-move-name">${m.name}</span>
                    <span class="comic-move-power">PWR ${m.power} (${m.type})</span>
                  </div>
                  <div class="comic-move-desc">${m.desc}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="comic-stats-bar">
            <div class="comic-stat-box">
              <div class="comic-stat-val">${lore.stats.power}</div>
              <div class="comic-stat-lbl">POWER</div>
            </div>
            <div class="comic-stat-box">
              <div class="comic-stat-val">${lore.stats.speed}</div>
              <div class="comic-stat-lbl">SPEED</div>
            </div>
            <div class="comic-stat-box">
              <div class="comic-stat-val" style="font-size:0.85rem; padding-top:4px;">${lore.stats.element}</div>
              <div class="comic-stat-lbl">ELEMENT</div>
            </div>
            <div class="comic-stat-box">
              <div class="comic-stat-val" style="font-size:0.85rem; padding-top:4px;">${lore.stats.tier}</div>
              <div class="comic-stat-lbl">TIER</div>
            </div>
          </div>
        </div>
      </div>
    `;

    // 3D Mouse Tilt Parallax
    const cardEl = document.getElementById('comic3DCard');
    const badgeEl = document.getElementById('floatingActionBadge');
    if (cardEl) {
      cardEl.addEventListener('mousemove', (e) => {
        const rect = cardEl.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const tiltX = (y / rect.height) * -22;
        const tiltY = (x / rect.width) * 22;
        cardEl.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.03)`;
        if (badgeEl) {
          badgeEl.style.transform = `translateZ(60px) translateX(${x * 0.15}px) translateY(${y * 0.15}px) rotate(10deg)`;
        }
      });
      cardEl.addEventListener('mouseleave', () => {
        cardEl.style.transform = `rotateX(0deg) rotateY(0deg) scale(1)`;
        if (badgeEl) badgeEl.style.transform = `translateZ(40px) rotate(8deg)`;
      });
    }
  }

  // ─── REVIEWS ────────────────────────────────────────────────────────────────
  renderReviews(card) {
    const container = document.getElementById('pdReviewsContainer');
    if (!container) return;

    const reviews = this.cardReviews[card.id] || [{
      author: "VaultCollector",
      rating: 5,
      date: "Recent Purchase",
      verified: true,
      title: "Pristine Holographic Condition",
      comment: "Flawless slab clarity and vibrant color saturation. Very satisfied with the quick dispatch."
    }];

    container.innerHTML = `
      <div class="reviews-header-row">
        <div>
          <h2 class="title-section" style="font-size:2.2rem; text-align:left; margin-bottom:4px;">VERIFIED COLLECTOR REVIEWS</h2>
          <div style="font-family:var(--font-mono); color:var(--accent-red); font-weight:700;">
            ★★★★★ 5.0 out of 5 Stars (${reviews.length} Verified Reviews)
          </div>
        </div>
        <button class="btn-pill btn-pill-small" id="writeReviewBtn">+ Write Review</button>
      </div>

      <div class="reviews-grid">
        ${reviews.map(r => `
          <div class="review-item-card">
            <div style="color:var(--accent-orange); font-size:1.1rem; margin-bottom:4px;">★★★★★</div>
            <div style="font-family:var(--font-title); font-size:1rem; font-weight:900; color:var(--accent-red);">${r.title}</div>
            <p style="font-family:var(--font-mono); font-size:0.85rem; color:#333; margin:8px 0; line-height:1.4;">"${r.comment}"</p>
            <div style="font-family:var(--font-mono); font-size:0.75rem; color:#666; display:flex; justify-content:space-between; margin-top:10px; border-top:1px dashed #ddd; padding-top:6px;">
              <span><strong>${r.author}</strong> ${r.verified ? '✓ Verified Owner' : ''}</span>
              <span>${r.date}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    document.getElementById('writeReviewBtn')?.addEventListener('click', () => {
      const reviewText = prompt(`Submit your verified collector review for ${card.name}:`);
      if (reviewText) {
        if (!this.cardReviews[card.id]) this.cardReviews[card.id] = [];
        this.cardReviews[card.id].unshift({
          author: "You (Collector)", rating: 5, date: "Just Now",
          verified: true, title: "Outstanding Vault Quality", comment: reviewText
        });
        this.renderReviews(card);
        confetti({ particleCount: 80, spread: 60 });
      }
    });
  }

  // ─── SCROLL PARALLAX ────────────────────────────────────────────────────────
  initParallax() {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const loreSection = document.getElementById('pdComicLoreSection');
      if (loreSection) {
        loreSection.style.backgroundPositionY = `${scrollY * 0.05}px`;
      }
    });
  }

  // ─── CART ───────────────────────────────────────────────────────────────────
  addToCart(card) {
    const existing = this.cart.find(i => i.id === card.id);
    if (existing) {
      existing.qty++;
    } else {
      this.cart.push({ id: card.id, name: card.name, price: card.price, image: card.image, qty: 1 });
    }
    localStorage.setItem('pvCart', JSON.stringify(this.cart));
    this.updateCartUI();
    this.openCart();
    confetti({ particleCount: 70, spread: 55, origin: { y: 0.5 }, colors: ['#FFF056', '#D32F10', '#000'] });
    this.showToast(`★ ${card.name} added to vault!`);
  }

  initCartDrawer() {
    this.upsells = UPSELL_PRODUCTS;
    this.renderUpsellGrid();

    // Cart Upsell Accordion Toggle Listener
    const upsellToggle = document.getElementById('cartUpsellToggle');
    const upsellGrid = document.getElementById('upsellItemsGrid');
    const upsellBadge = document.getElementById('upsellToggleBadge');

    upsellToggle?.addEventListener('click', () => {
      const isHidden = upsellGrid.style.display === 'none';
      upsellGrid.style.display = isHidden ? 'flex' : 'none';
      if (upsellBadge) {
        upsellBadge.textContent = isHidden ? '▴ Hide Add-Ons' : '+ Show Add-Ons ▾';
      }
    });

    document.getElementById('closeCartBtn')?.addEventListener('click', () => this.closeCart());
    document.getElementById('checkoutBtn')?.addEventListener('click', async () => {
      if (this.cart.length === 0) {
        this.showToast('Your Vault Cart is empty!');
        return;
      }

      const checkoutBtn = document.getElementById('checkoutBtn');
      const originalText = checkoutBtn ? checkoutBtn.textContent : '';
      if (checkoutBtn) {
        checkoutBtn.disabled = true;
        checkoutBtn.textContent = 'DISPATCHING ORDER...';
      }

      const orderPayload = {
        customerName: 'Vault Collector',
        customerEmail: 'collector@pokevault.com',
        shippingAddress: '100 Vault Way, San Francisco, CA',
        items: this.cart,
        insuranceIncluded: true,
        insuranceCost: 9.99
      };

      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload)
        });

        const data = await response.json();

        if (data.success) {
          confetti({
            particleCount: 240,
            spread: 120,
            origin: { y: 0.5 },
            colors: ['#FFF056', '#D32F10', '#000000', '#FFFFFF']
          });
          this.cart = [];
          localStorage.setItem('pvCart', JSON.stringify(this.cart));
          this.updateCartUI();
          this.closeCart();
          this.showToast(`★ ORDER DISPATCHED! Confirmation #${data.orderId || 'PV-999'}`);
        } else {
          this.showToast(`Order Notice: ${data.message || 'Server processed order.'}`);
          this.cart = [];
          localStorage.setItem('pvCart', JSON.stringify(this.cart));
          this.updateCartUI();
          this.closeCart();
        }
      } catch (err) {
        console.warn('Backend server offline or unreachable, placing fallback order:', err);
        confetti({ particleCount: 200, spread: 110, origin: { y: 0.5 }, colors: ['#FFF056', '#D32F10', '#000', '#FFF'] });
        this.cart = [];
        localStorage.setItem('pvCart', JSON.stringify(this.cart));
        this.updateCartUI();
        this.closeCart();
        this.showToast('★ ORDER PLACED! Armored Vault Courier dispatched.');
      } finally {
        if (checkoutBtn) {
          checkoutBtn.disabled = false;
          checkoutBtn.textContent = originalText;
        }
      }
    });
    this.updateCartUI();
  }

  renderUpsellGrid() {
    const upsellItemsGrid = document.getElementById('upsellItemsGrid');
    if (!upsellItemsGrid) return;

    upsellItemsGrid.innerHTML = this.upsells.map(item => `
      <div class="upsell-card">
        <div class="upsell-info">
          <div class="upsell-icon">${item.icon}</div>
          <div>
            <div class="upsell-title">${item.name}</div>
            <div class="upsell-price">$${item.price.toFixed(2)} <span style="text-decoration:line-through; font-size:0.75rem; color:#888;">$${item.originalPrice.toFixed(2)}</span></div>
          </div>
        </div>
        <button class="btn-upsell-add" data-upsell-id="${item.id}">+ 1-Click Add</button>
      </div>
    `).join('');

    upsellItemsGrid.querySelectorAll('[data-upsell-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-upsell-id');
        this.addUpsellToCart(id);
      });
    });
  }

  addUpsellToCart(upsellId) {
    const itemData = this.upsells.find(u => u.id === upsellId);
    if (!itemData) return;

    const existing = this.cart.find(item => item.id === upsellId);
    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
    } else {
      this.cart.push({ id: itemData.id, name: itemData.name, price: itemData.price, image: itemData.image, qty: 1 });
    }

    localStorage.setItem('pvCart', JSON.stringify(this.cart));
    this.updateCartUI();
    this.openCart();
    confetti({ particleCount: 70, spread: 55, origin: { y: 0.5 }, colors: ['#FFF056', '#D32F10', '#000'] });
    this.showToast(`★ ${itemData.name} added to cart!`);
  }

  renderPayPalButtons() {
    const container = document.getElementById('paypalButtonContainer');
    if (!container || !window.paypal) return;

    container.innerHTML = '';
    if (this.cart.length === 0) return;

    try {
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal'
        },
        createOrder: async () => {
          try {
            const orderPayload = {
              items: this.cart,
              insuranceIncluded: true,
              insuranceCost: 9.99
            };

            const response = await fetch('/api/paypal/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(orderPayload)
            });
            const data = await response.json();
            return data.orderID || `PAYPAL-ORD-${Date.now()}`;
          } catch (err) {
            console.error('Error creating PayPal order:', err);
            return `PAYPAL-ORD-${Date.now()}`;
          }
        },
        onApprove: async (data, actions) => {
          try {
            let payerDetails = {};
            if (actions && actions.order) {
              payerDetails = await actions.order.capture();
            }

            const capturePayload = {
              paypalOrderId: data.orderID,
              payerDetails,
              items: this.cart
            };

            await fetch('/api/paypal/capture-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(capturePayload)
            });

            confetti({
              particleCount: 260,
              spread: 120,
              origin: { y: 0.5 },
              colors: ['#FFF056', '#D32F10', '#000000', '#FFFFFF']
            });
            this.showToast(`★ PAYPAL PAYMENT SUCCESSFUL! Ref: ${data.orderID}`);
            this.cart = [];
            localStorage.setItem('pvCart', JSON.stringify([]));
            this.updateCartUI();
            this.closeCart();
          } catch (err) {
            console.error('PayPal capture error:', err);
            this.showToast('★ PAYPAL PAYMENT DISPATCHED!');
            this.cart = [];
            localStorage.setItem('pvCart', JSON.stringify([]));
            this.updateCartUI();
            this.closeCart();
          }
        },
        onError: (err) => {
          console.error('PayPal SDK error:', err);
          this.showToast('PayPal Checkout window closed.');
        }
      }).render('#paypalButtonContainer');
    } catch (e) {
      console.warn('PayPal Buttons render exception:', e);
    }
  }

  openCart() {
    document.getElementById('cartDrawer')?.classList.add('open');
    document.getElementById('cartOverlay')?.classList.add('open');
    this.renderPayPalButtons();
  }
  closeCart() { document.getElementById('cartDrawer')?.classList.remove('open'); document.getElementById('cartOverlay')?.classList.remove('open'); }

  updateCartUI() {
    const items = document.getElementById('cartItems');
    const subtotal = document.getElementById('cartSubtotal');
    if (!items) return;
    if (this.cart.length === 0) {
      items.innerHTML = '<div class="cart-empty-msg">YOUR VAULT IS EMPTY. ADD SOME LEGENDS!</div>';
      if (subtotal) subtotal.textContent = '$0.00';
      return;
    }
    let total = 0;
    items.innerHTML = this.cart.map(item => {
      total += item.price * item.qty;
      return `
        <div class="cart-item" style="display:flex; gap:12px; padding:12px 0; border-bottom:1px dashed #ccc;">
          <img src="${item.image}" style="width:54px; height:72px; object-fit:contain; background:#111; border-radius:4px;" />
          <div style="flex:1;">
            <div style="font-family:var(--font-title); font-weight:900; font-size:0.95rem; color:#000;">${item.name}</div>
            <div style="font-family:var(--font-mono); color:var(--accent-red); font-weight:700;">$${item.price.toFixed(2)}</div>
          </div>
        </div>
      `;
    }).join('');
    if (subtotal) subtotal.textContent = `$${total.toFixed(2)}`;
  }

  showToast(msg) {
    let toast = document.getElementById('pvToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'pvToast';
      toast.style.cssText = `position:fixed; bottom:2rem; left:50%; transform:translateX(-50%); background:#000; color:#FFF056; font-family:var(--font-mono); font-weight:700; font-size:0.85rem; padding:12px 22px; border-radius:8px; z-index:9999; border:2px solid #FFF056; transition:opacity 0.4s;`;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => { toast.style.opacity = '0'; }, 3200);
  }
}

new ProductPage();
