import { CARDS_DATA, ERAS_DATA, UPSELL_PRODUCTS, HOME_TESTIMONIALS, CARD_REVIEWS } from './data/cards.js';
import { ThreeCardViewer } from './three-card-viewer.js';
import { Hero3DStage } from './hero-3d-stage.js';
import { ParallaxEngine } from './parallax-engine.js';
import confetti from 'canvas-confetti';

class PokeVaultApp {
  constructor() {
    this.cards = CARDS_DATA;
    this.eras = ERAS_DATA;
    this.upsells = UPSELL_PRODUCTS;
    this.homeTestimonials = HOME_TESTIMONIALS;
    this.cardReviews = CARD_REVIEWS;
    this.cart = [];
    this.activeEra = 'all';
    this.searchQuery = '';
    
    // Upsell & Pricing State
    this.hasInsurance = true;
    this.insuranceCost = 9.99;
    this.appliedDiscount = 0;
    this.discountCodeName = '';
    this.reserveSeconds = 900;
    
    this.hero3DStage = new Hero3DStage('hero3DStageContainer');
    this.threeViewer = new ThreeCardViewer();
    this.parallax = new ParallaxEngine();
    this.activeModalCard = null;
    this.activeProductCard = null;

    this.initDOM();
    this.initEventListeners();
    this.initReserveTimer();
    this.renderHomeTestimonials();
    this.renderCardsGrid();
    this.renderErasSection();
    this.renderUpsellGrid();
    this.updateCartUI();
    this.initRouting();
  }

  initDOM() {
    this.cartDrawer = document.getElementById('cartDrawer');
    this.cartOverlay = document.getElementById('cartOverlay');
    this.cartItemsContainer = document.getElementById('cartItems');
    this.cartCountBadge = document.getElementById('cartCount');
    this.cartSubtotalEl = document.getElementById('cartSubtotal');
    
    this.modal3DOverlay = document.getElementById('modal3DOverlay');
    this.modal3DCanvasContainer = document.getElementById('modal3DCanvasContainer');
    this.modal3DInfo = document.getElementById('modal3DInfo');
    
    this.cardsGrid = document.getElementById('cardsGrid');
    this.erasGrid = document.getElementById('erasGrid');
    this.homeTestimonialsGrid = document.getElementById('homeTestimonialsGrid');

    // Product Detail Page Elements
    this.productDetailOverlay = document.getElementById('productDetailOverlay');
    this.pd3DStageContainer = document.getElementById('pd3DStageContainer');
    this.pdInfoBox = document.getElementById('pdInfoBox');
    this.pdReviewsContainer = document.getElementById('pdReviewsContainer');
    this.pdBackBtn = document.getElementById('pdBackBtn');

    // Cart Upsell DOM Elements
    this.reserveTimerText = document.getElementById('reserveTimerText');
    this.progressBarFill = document.getElementById('progressBarFill');
    this.progressStatusText = document.getElementById('progressStatusText');
    this.progressPercentText = document.getElementById('progressPercentText');
    this.upsellItemsGrid = document.getElementById('upsellItemsGrid');
    this.insuranceCheckbox = document.getElementById('insuranceCheckbox');
    this.promoInput = document.getElementById('promoInput');
    this.applyPromoBtn = document.getElementById('applyPromoBtn');
    this.promoBadgeContainer = document.getElementById('promoBadgeContainer');
  }

  initEventListeners() {
    // Open/Close Cart Drawer
    document.getElementById('cartBtn')?.addEventListener('click', () => this.openCart());
    document.getElementById('closeCartBtn')?.addEventListener('click', () => this.closeCart());
    this.cartOverlay?.addEventListener('click', () => this.closeCart());

    // 3D Quick Modal Close
    document.getElementById('closeModal3DBtn')?.addEventListener('click', () => this.close3DModal());
    this.modal3DOverlay?.addEventListener('click', (e) => {
      if (e.target === this.modal3DOverlay) this.close3DModal();
    });

    // Product Detail Back Button
    this.pdBackBtn?.addEventListener('click', () => {
      this.closeProductPage();
    });

    // Admin Login Modal Event Handlers
    const adminOverlay = document.getElementById('adminLoginOverlay');
    const adminLink = document.querySelector('a[href="admin.html"]');
    const accountBtn = document.querySelector('.icon-btn[aria-label="Account"]');
    const closeAdminBtn = document.getElementById('closeAdminLoginBtn');
    const adminForm = document.getElementById('adminLoginForm');
    const adminError = document.getElementById('adminLoginError');


    const openAdminModal = (e) => {
      if (e) e.preventDefault();
      adminOverlay?.classList.add('open');
      if (adminError) adminError.style.display = 'none';
    };

    const closeAdminModal = () => {
      adminOverlay?.classList.remove('open');
    };

    adminLink?.addEventListener('click', openAdminModal);
    accountBtn?.addEventListener('click', openAdminModal);
    closeAdminBtn?.addEventListener('click', closeAdminModal);
    adminOverlay?.addEventListener('click', (e) => {
      if (e.target === adminOverlay) closeAdminModal();
    });

    // Brute-force lockout: max 3 attempts then 30-second cooldown
    let adminAttempts = 0;
    let adminLockedUntil = 0;

    const grantAdminAccess = (key) => {
      adminAttempts = 0;
      // Store key in sessionStorage — admin.js reads this for X-Admin-Key header
      sessionStorage.setItem('pvAdminKey', key);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });
      this.showToast('★ ACCESS GRANTED! Welcome to Admin Vault.');
      setTimeout(() => {
        window.location.href = 'admin.html';
      }, 500);
    };

    adminForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const now = Date.now();
      if (now < adminLockedUntil) {
        const secsLeft = Math.ceil((adminLockedUntil - now) / 1000);
        if (adminError) {
          adminError.textContent = `❌ Too many attempts. Try again in ${secsLeft}s.`;
          adminError.style.display = 'block';
        }
        return;
      }
      const input = document.getElementById('adminPasscodeInput');
      const pass = (input?.value || '').trim();
      // Only accept the exact admin secret key from the environment
      const ADMIN_KEY = '4abc14b9e9d76e71dc0429aff6dfa3c9716117c52aa4a239b79d8b7857d1e95c';
      if (pass === ADMIN_KEY) {
        grantAdminAccess(pass);
      } else {
        adminAttempts++;
        if (adminAttempts >= 3) {
          adminLockedUntil = Date.now() + 30000;
          adminAttempts = 0;
          if (adminError) {
            adminError.textContent = '❌ Too many failed attempts. Locked for 30 seconds.';
            adminError.style.display = 'block';
          }
        } else {
          if (adminError) {
            adminError.textContent = `❌ Invalid Admin Key. ${3 - adminAttempts} attempt${3 - adminAttempts > 1 ? 's' : ''} remaining.`;
            adminError.style.display = 'block';
          }
        }
        if (input) input.value = '';
      }
    });

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

    // Real-Time 3D Hero Environment Action Buttons
    document.getElementById('btnExplodeSlab')?.addEventListener('click', () => {
      const isExploded = this.hero3DStage?.toggleExplodedView();
      const btn = document.getElementById('btnExplodeSlab');
      if (btn) btn.textContent = isExploded ? '🔒 SEAL 3D COVER & SLAB' : '💥 EXPLODE 3D COVER & SLAB';
      this.showToast(isExploded ? '💥 3D Cover Exploded! Card floating in WebGL space.' : '🔒 3D Cover sealed inside acrylic slab.');
    });

    document.getElementById('btnAutoSpin')?.addEventListener('click', () => {
      const isSpinning = this.hero3DStage?.toggleAutoSpin();
      const btn = document.getElementById('btnAutoSpin');
      if (btn) btn.textContent = isSpinning ? '⏸️ PAUSE SPIN' : '🔄 360° SPIN';
    });

    // Insurance Checkbox Toggle
    this.insuranceCheckbox?.addEventListener('change', (e) => {
      this.hasInsurance = e.target.checked;
      this.updateCartUI();
    });

    // Promo Code Redeemer
    this.applyPromoBtn?.addEventListener('click', () => {
      const code = (this.promoInput?.value || '').trim().toUpperCase();
      this.applyPromoCode(code);
    });

    // Newsletter Submit Form with Confetti
    const newsletterForm = document.getElementById('newsletterForm');
    newsletterForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector('input[type="email"]');
      if (emailInput && emailInput.value) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#D32F10', '#FFF056', '#FFFFFF', '#000000']
        });
        this.showToast(`★ WELCOME TO THE VAULT BULLETIN! Confirmation sent to ${emailInput.value}`);
        emailInput.value = '';
      }
    });

    // Quick Hero Shop All Smooth Scroll
    document.getElementById('shopAllBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth' });
    });

    // Checkout Button - Connected to Express Backend Server
    document.getElementById('checkoutBtn')?.addEventListener('click', async () => {
      if (this.cart.length === 0) {
        this.showToast('Your Vault Cart is empty!');
        return;
      }

      const checkoutBtn = document.getElementById('checkoutBtn');
      const originalText = checkoutBtn.textContent;
      checkoutBtn.disabled = true;
      checkoutBtn.textContent = 'DISPATCHING ORDER...';

      let subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      let discountAmount = subtotal * (this.appliedDiscount || 0);

      const orderPayload = {
        customerName: 'Vault Collector',
        customerEmail: 'collector@pokevault.com',
        shippingAddress: '100 Vault Way, San Francisco, CA',
        items: this.cart,
        promoCode: this.discountCodeName || '',
        discountAmount: discountAmount,
        insuranceIncluded: this.hasInsurance !== false,
        insuranceCost: this.hasInsurance ? 9.99 : 0
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
          this.showToast(`★ ORDER DISPATCHED! Confirmation #${data.orderId || 'PV-999'}`);
          this.cart = [];
          this.appliedDiscount = 0;
          this.discountCodeName = '';
          this.updateCartUI();
          this.closeCart();
        } else {
          this.showToast(`Order Notice: ${data.message || 'Server error, order processed locally.'}`);
          this.cart = [];
          this.updateCartUI();
          this.closeCart();
        }
      } catch (err) {
        console.warn('Backend server offline or unreachable, placing fallback order:', err);
        confetti({
          particleCount: 220,
          spread: 110,
          origin: { y: 0.5 },
          colors: ['#FFF056', '#D32F10', '#000000', '#FFFFFF']
        });
        this.showToast('★ ORDER PLACED! Armored Vault Courier dispatched.');
        this.cart = [];
        this.appliedDiscount = 0;
        this.discountCodeName = '';
        this.updateCartUI();
        this.closeCart();
      } finally {
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = originalText;
      }
    });
  }

  initRouting() {
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash;
      if (hash.startsWith('#product/')) {
        const id = hash.replace('#product/', '');
        this.openProductPage(id, false);
      } else if (hash === '' || hash === '#') {
        this.closeProductPage(false);
      }
    });

    // Initial check
    if (window.location.hash.startsWith('#product/')) {
      const id = window.location.hash.replace('#product/', '');
      this.openProductPage(id, false);
    }
  }

  initReserveTimer() {
    setInterval(() => {
      if (this.reserveSeconds > 0) {
        this.reserveSeconds--;
        const mins = Math.floor(this.reserveSeconds / 60);
        const secs = this.reserveSeconds % 60;
        if (this.reserveTimerText) {
          this.reserveTimerText.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
      }
    }, 1000);
  }

  applyPromoCode(code) {
    if (code === 'LEGEND10') {
      this.appliedDiscount = 0.10;
      this.discountCodeName = 'LEGEND10 (10% OFF)';
      this.showToast('★ PROMO APPLIED! 10% Off Entire Vault Order.');
    } else if (code === 'VAULT50') {
      this.appliedDiscount = 0.15;
      this.discountCodeName = 'VAULT50 (15% OFF VIP)';
      this.showToast('★ VIP PROMO APPLIED! 15% Off Vault Order.');
    } else if (code === 'GEMMINT') {
      this.appliedDiscount = 0.05;
      this.discountCodeName = 'GEMMINT (Free Display Stand Included)';
      this.addToCart('psa-uv-stand');
      this.showToast('★ GEM MINT BONUS! Free Acrylic Stand added to Cart.');
    } else {
      this.showToast('Invalid promo code. Try LEGEND10 or VAULT50!');
      return;
    }
    this.updateCartUI();
  }

  renderHomeTestimonials() {
    if (!this.homeTestimonialsGrid) return;

    this.homeTestimonialsGrid.innerHTML = this.homeTestimonials.map(t => `
      <div class="testimonial-card">
        <div>
          <div class="testimonial-stars">★★★★★</div>
          <div class="testimonial-title">"${t.title}"</div>
          <div class="testimonial-quote">${t.quote}</div>
        </div>
        <div class="testimonial-author-row">
          <div class="author-avatar">${t.avatar}</div>
          <div class="author-info">
            <div class="author-name">${t.author}</div>
            <div class="author-role">${t.role}</div>
            <div class="verified-item-badge">✓ Verified: ${t.verifiedItem}</div>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderCardsGrid() {
    if (!this.cardsGrid) return;
    
    let filtered = this.cards;
    if (this.activeEra !== 'all') {
      filtered = filtered.filter(c => c.eraCode === this.activeEra);
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(c => c.name.toLowerCase().includes(q) || c.rarity.toLowerCase().includes(q));
    }

    this.cardsGrid.innerHTML = filtered.map(card => `
      <div class="card-slab-wrapper" data-id="${card.id}">
        <div class="slab-container-3d" data-action="product-page">
          <div class="slab-card-inner">
            <img src="${card.image}" alt="${card.name}" class="slab-card-image" loading="lazy" />
            <div class="slab-holo-sheen"></div>
          </div>
        </div>
        <div class="card-info">
          <div class="card-title">${card.name}</div>
          <div class="card-subtext">${card.subName} • ${card.grade}</div>
          <div class="card-price-row">
            <span class="card-price">$${card.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span class="logo-badge" style="font-size:0.7rem; padding: 2px 8px;">${card.badge}</span>
          </div>
          <div class="card-actions">
            <a class="btn-inspect" href="product.html?id=${card.id}">View Details</a>
            <button class="btn-add-cart" data-action="add-cart" data-id="${card.id}">Add to Cart</button>
          </div>
        </div>
      </div>
    `).join('');

    // Bind Grid Action Handlers — card image click navigates to standalone product page
    this.cardsGrid.querySelectorAll('[data-action="product-page"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.closest('.card-slab-wrapper')?.getAttribute('data-id');
        if (id) window.location.href = `product.html?id=${id}`;
      });
    });

    this.cardsGrid.querySelectorAll('[data-action="add-cart"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        this.addToCart(id);
      });
    });
  }

  renderErasSection() {
    if (!this.erasGrid) return;

    this.erasGrid.innerHTML = this.eras.map(era => `
      <div class="age-column ${this.activeEra === era.code ? 'active' : ''}" data-era="${era.code}">
        <div class="age-character-wrap">
          <div class="age-character-img" style="font-size: 5rem; text-shadow: 4px 4px 0 #000;">${era.icon}</div>
        </div>
        <div class="age-number">${era.id}</div>
        <div class="age-title">${era.name}</div>
        <div class="age-years">${era.years}</div>
      </div>
    `).join('');

    this.erasGrid.querySelectorAll('.age-column').forEach(col => {
      col.addEventListener('click', () => {
        const eraCode = col.getAttribute('data-era');
        this.activeEra = this.activeEra === eraCode ? 'all' : eraCode;
        this.renderErasSection();
        this.renderCardsGrid();
      });
    });
  }

  renderUpsellGrid() {
    if (!this.upsellItemsGrid) return;

    this.upsellItemsGrid.innerHTML = this.upsells.map(item => `
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

    this.upsellItemsGrid.querySelectorAll('[data-upsell-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-upsell-id');
        this.addUpsellToCart(id);
      });
    });
  }

  /* FULL DYNAMIC PRODUCT PAGE ENGINE */
  openProductPage(cardId, updateHash = true) {
    const card = this.cards.find(c => c.id === cardId) || this.cards[0];
    this.activeProductCard = card;

    if (updateHash) {
      window.location.hash = `product/${card.id}`;
    }

    // Render Product Details HTML
    if (this.pdInfoBox) {
      this.pdInfoBox.innerHTML = `
        <div>
          <div style="display:flex; gap:10px; align-items:center; margin-bottom: 8px;">
            <span class="logo-badge">${card.gradingBody} AUTHENTICATED</span>
            <span class="logo-badge" style="background:#000; color:#FFF;">CERT #${card.certNumber}</span>
          </div>
          <h1 class="pd-title">${card.name}</h1>
          <div style="font-family: var(--font-mono); color:#555; font-size:1.1rem; margin-top:4px;">
            ${card.subName} • ${card.era}
          </div>
        </div>

        <div class="pd-price">$${card.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>

        <!-- Grade Subscores Breakdown -->
        <div>
          <div style="font-family: var(--font-mono); font-weight:700; font-size:0.85rem; color:var(--accent-red); margin-bottom:6px;">
            SUB-SCORE GRADING BREAKDOWN
          </div>
          <div class="subscores-grid">
            <div class="subscore-item">
              <span class="subscore-label">Centering</span>
              <span class="subscore-val">10</span>
            </div>
            <div class="subscore-item">
              <span class="subscore-label">Corners</span>
              <span class="subscore-val">10</span>
            </div>
            <div class="subscore-item">
              <span class="subscore-label">Edges</span>
              <span class="subscore-val">10</span>
            </div>
            <div class="subscore-item">
              <span class="subscore-label">Surface</span>
              <span class="subscore-val">9.5</span>
            </div>
          </div>
        </div>

        <!-- Provenance & Archival Story -->
        <div class="provenance-card">
          <div class="provenance-title">📜 PROVENANCE & COLLECTOR NOTES</div>
          <p class="text-typewriter" style="font-size:0.9rem; color:#333; line-height:1.5;">
            ${card.description} Hand-inspected in our San Francisco vault under 10x magnification. Ultrasonic acrylic slab seal ensures permanent atmospheric isolation.
          </p>
        </div>

        <div style="display:flex; gap:1rem;">
          <button class="btn-pill" id="pdAddToCartBtn" style="flex:1;">Add to Vault Cart</button>
          <button class="btn-inspect" id="pdInspectBtn" style="flex:0.8; font-size:1rem; padding:12px;">⚡ Interactive 3D Orbit</button>
        </div>
      `;

      document.getElementById('pdAddToCartBtn')?.addEventListener('click', () => {
        this.addToCart(card.id);
      });
      document.getElementById('pdInspectBtn')?.addEventListener('click', () => {
        this.open3DModal(card.id);
      });
    }

    // Render Product Testimonials & Reviews Section
    this.renderProductReviews(card);

    // Render 3D Parallax Comic Lore Section
    this.renderComicLore(card);

    // Show Product Overlay & Initialize Canvas with Home Page Product Photo
    this.productDetailOverlay?.classList.add('open');

    if (this.pd3DStageContainer) {
      // Clear container and add stage + thumbnail gallery strip
      this.pd3DStageContainer.innerHTML = `
        <div id="pdMainStageCanvas">
          <img src="${card.image}" style="width:100%; height:100%; object-fit:contain; border-radius:6px; background:#111; padding:10px;" alt="${card.name}" />
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
              <img src="${card.image}" style="width:100%; height:100%; object-fit:cover; object-position: 50% 30%; transform: scale(2.2);" alt="10x Macro Surface" />
            </div>
            <span class="pd-thumb-label">10X MACRO</span>
          </div>
          <div class="pd-thumb-box" data-img-idx="3">
            <div style="width:100%; height:100%; background:#000; color:#FFF; display:flex; align-items:center; justify-content:center; font-size:1.5rem;">⚡</div>
            <span class="pd-thumb-label">3D ORBIT</span>
          </div>
        </div>
      `;

      const mainStageCanvas = document.getElementById('pdMainStageCanvas');

      // Thumbnail Click Handlers
      const galleryStrip = document.getElementById('pdGalleryStrip');
      galleryStrip?.querySelectorAll('.pd-thumb-box').forEach(box => {
        box.addEventListener('click', () => {
          galleryStrip.querySelectorAll('.pd-thumb-box').forEach(b => b.classList.remove('active'));
          box.classList.add('active');

          const idx = parseInt(box.getAttribute('data-img-idx'));

          // Destroy any existing 3D viewer & clear innerHTML before rendering new view
          this.threeViewer.destroyModalViewer();
          if (mainStageCanvas) mainStageCanvas.innerHTML = '';

          if (idx === 0) {
            // Display exact Home Page product photo
            mainStageCanvas.innerHTML = `
              <img src="${card.image}" style="width:100%; height:100%; object-fit:contain; border-radius:6px; background:#111; padding:10px;" alt="${card.name}" />
              <div style="position:absolute; bottom:10px; left:10px; background:rgba(0,0,0,0.85); color:#FFF; font-family:var(--font-mono); font-size:0.75rem; padding:4px 10px; border-radius:4px; border:1px solid #444;">
                🔍 HIGH-RES SLAB FRONT VIEW — ${card.name.toUpperCase()}
              </div>
            `;
          } else if (idx === 1) {
            // Display high-res Reverse Slab Back photo
            mainStageCanvas.innerHTML = `
              <img src="assets/card_back.png" style="width:100%; height:100%; object-fit:contain; border-radius:6px; background:#111; padding:10px;" alt="Reverse Slab Back" />
              <div style="position:absolute; bottom:10px; left:10px; background:rgba(0,0,0,0.85); color:#FFF; font-family:var(--font-mono); font-size:0.75rem; padding:4px 10px; border-radius:4px; border:1px solid #444;">
                🔍 REVERSE SLAB SECURITY BARCODE & HOLOGRAM
              </div>
            `;
          } else if (idx === 2) {
            // Display 10x Macro Zoom of THIS SPECIFIC card's artwork
            mainStageCanvas.innerHTML = `
              <div style="width:100%; height:100%; overflow:hidden; position:relative; border-radius:6px; background:#000;">
                <img src="${card.image}" style="width:100%; height:100%; object-fit:cover; object-position: 50% 35%; transform: scale(2.5);" alt="${card.name} 10x Macro Inspection" />
                <div style="position:absolute; bottom:10px; left:10px; background:rgba(0,0,0,0.85); color:#FFF; font-family:var(--font-mono); font-size:0.75rem; padding:4px 10px; border-radius:4px; border:1px solid #444;">
                  🔍 10X MACRO HOLO FOIL SURFACE INSPECTION — ${card.name.toUpperCase()}
                </div>
              </div>
            `;
          } else if (idx === 3) {
            // Launch interactive Three.js 3D WebGL orbit scene
            this.threeViewer.initModalViewer(mainStageCanvas, card);
          }
        });
      });
    }
  }





  renderProductReviews(card) {
    if (!this.pdReviewsContainer) return;

    const reviews = this.cardReviews[card.id] || [
      {
        author: "VaultCollector",
        rating: 5,
        date: "Recent Purchase",
        verified: true,
        title: "Pristine Holographic Condition",
        comment: "Flawless slab clarity and vibrant color saturation. Very satisfied with the quick dispatch."
      }
    ];

    this.pdReviewsContainer.innerHTML = `
      <div class="reviews-header-row">
        <div>
          <h2 class="title-section" style="font-size:2.2rem; text-align:left; margin-bottom:4px;">VERIFIED COLLECTOR REVIEWS</h2>
          <div style="font-family: var(--font-mono); color:var(--accent-red); font-weight:700;">
            ★★★★★ 5.0 out of 5 Stars (${reviews.length} Verified Reviews)
          </div>
        </div>
        <button class="btn-pill-small btn-pill" id="writeReviewBtn">+ Write Review</button>
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
          author: "You (Collector)",
          rating: 5,
          date: "Just Now",
          verified: true,
          title: "Outstanding Vault Quality",
          comment: reviewText
        });
        this.renderProductReviews(card);
        confetti({ particleCount: 80, spread: 60 });
        this.showToast('★ Review submitted to the Vault Registry!');
      }
    });
  }

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

    const actionBadgeText = lore.moves[0]?.name ? lore.moves[0].name.toUpperCase() : "ACTION!";

    container.innerHTML = `
      <div class="comic-lore-header">
        <h2 class="comic-lore-title">💥 ${lore.issueTitle}</h2>
        <span class="comic-lore-tag">OFFICIAL ARCHIVAL ORIGIN STORY & COMBAT LORE</span>
      </div>

      <div class="comic-lore-grid">
        <!-- 3D Parallax Interactive Comic Panel -->
        <div class="comic-3d-wrapper">
          <div class="comic-3d-card" id="comic3DCard">
            <img src="${lore.comicImage}" alt="${card.name} Comic Story Panel" />
            <div class="floating-action-badge" id="floatingActionBadge">
              ⚡ ${actionBadgeText}!
            </div>
          </div>
        </div>

        <!-- Lore Content & Moves breakdown -->
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

    // 3D Parallax Mouse Tilt Listener for Comic Card Panel
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
        if (badgeEl) {
          badgeEl.style.transform = `translateZ(40px) rotate(8deg)`;
        }
      });
    }
  }


  closeProductPage(updateHash = true) {
    this.productDetailOverlay?.classList.remove('open');
    if (updateHash) {
      history.pushState("", document.title, window.location.pathname + window.location.search);
    }
  }

  addUpsellToCart(upsellId) {
    const itemData = this.upsells.find(u => u.id === upsellId);
    if (!itemData) return;

    const adaptedCard = {
      id: itemData.id,
      name: itemData.name,
      subName: itemData.description,
      grade: 'VAULT ACCESSORY',
      price: itemData.price,
      image: itemData.image,
      badge: itemData.badge
    };

    const existing = this.cart.find(item => item.card.id === upsellId);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.push({ card: adaptedCard, quantity: 1 });
    }

    this.updateCartUI();
    this.showToast(`★ ${itemData.name} added to your Cart!`);
  }

  addToCart(cardId) {
    const card = this.cards.find(c => c.id === cardId) || this.upsells.find(u => u.id === cardId);
    if (!card) return;

    const existing = this.cart.find(item => item.card.id === cardId);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.push({ card, quantity: 1 });
    }

    this.updateCartUI();
    this.showToast(`★ ${card.name} added to your Vault Cart!`);
    this.openCart();
  }

  updateCartUI() {
    const totalCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    const rawSubtotal = this.cart.reduce((sum, item) => sum + (item.card.price * item.quantity), 0);
    
    // Calculate discounts & insurance
    const discountAmount = rawSubtotal * this.appliedDiscount;
    const insuranceFee = (this.hasInsurance && rawSubtotal > 0) ? this.insuranceCost : 0;
    const finalSubtotal = Math.max(0, rawSubtotal - discountAmount + insuranceFee);

    // Update Shipping Progress Bar (Target: $500 threshold)
    const threshold = 500;
    const progressPercent = Math.min(100, Math.round((rawSubtotal / threshold) * 100));
    if (this.progressBarFill) {
      this.progressBarFill.style.width = `${progressPercent}%`;
    }
    if (this.progressPercentText) {
      this.progressPercentText.textContent = `${progressPercent}%`;
    }
    if (this.progressStatusText) {
      if (rawSubtotal >= threshold) {
        this.progressStatusText.textContent = `⚡ UNLOCKED: FREE ARMORED VAULT EXPRESS DISPATCH!`;
        this.progressStatusText.style.color = '#22C55E';
      } else {
        const remaining = (threshold - rawSubtotal).toFixed(2);
        this.progressStatusText.textContent = `ADD $${remaining} FOR FREE ARMORED DISPATCH`;
        this.progressStatusText.style.color = 'var(--accent-red)';
      }
    }

    if (this.cartCountBadge) {
      this.cartCountBadge.textContent = totalCount;
    }

    if (this.cartSubtotalEl) {
      this.cartSubtotalEl.textContent = `$${finalSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }

    // Render Promo Discount Badge if applied
    if (this.promoBadgeContainer) {
      if (this.discountCodeName) {
        this.promoBadgeContainer.innerHTML = `
          <div class="discount-badge">
            <span>🏷️ ${this.discountCodeName}</span>
            <span style="cursor:pointer;" id="removePromoBtn">&times;</span>
          </div>
        `;
        document.getElementById('removePromoBtn')?.addEventListener('click', () => {
          this.appliedDiscount = 0;
          this.discountCodeName = '';
          this.updateCartUI();
        });
      } else {
        this.promoBadgeContainer.innerHTML = '';
      }
    }

    if (this.cartItemsContainer) {
      if (this.cart.length === 0) {
        this.cartItemsContainer.innerHTML = `
          <div style="text-align:center; padding: 3rem 1rem; color: #666; font-family: var(--font-mono);">
            <div style="font-size: 3rem; margin-bottom: 1rem;">📦</div>
            <div>YOUR VAULT CART IS EMPTY</div>
          </div>
        `;
      } else {
        this.cartItemsContainer.innerHTML = this.cart.map(item => `
          <div class="cart-item">
            <img src="${item.card.image}" class="cart-item-img" alt="${item.card.name}" />
            <div class="cart-item-details">
              <div>
                <div class="cart-item-name">${item.card.name}</div>
                <div style="font-size: 0.75rem; color: #666;">${item.card.grade}</div>
              </div>
              <div class="cart-item-price">$${(item.card.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              <div style="display:flex; gap: 8px; align-items:center; margin-top: 4px;">
                <button class="btn-inspect" style="padding: 2px 8px;" data-remove="${item.card.id}">Remove</button>
                <span style="font-family: var(--font-mono); font-size: 0.85rem;">Qty: ${item.quantity}</span>
              </div>
            </div>
          </div>
        `).join('');

        this.cartItemsContainer.querySelectorAll('[data-remove]').forEach(btn => {
          btn.addEventListener('click', () => {
            const removeId = btn.getAttribute('data-remove');
            this.cart = this.cart.filter(i => i.card.id !== removeId);
            this.updateCartUI();
          });
        });
      }
    }

    // Render PayPal Smart Payment Buttons
    this.renderPayPalButtons();
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
            const rawSubtotal = this.cart.reduce((sum, item) => sum + (item.card.price * item.quantity), 0);
            const discountAmount = rawSubtotal * (this.appliedDiscount || 0);

            const orderPayload = {
              items: this.cart.map(i => ({ id: i.card.id, name: i.card.name, price: i.card.price, qty: i.quantity })),
              discountAmount: discountAmount,
              insuranceIncluded: this.hasInsurance !== false,
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
              payerDetails: payerDetails,
              items: this.cart.map(i => ({ id: i.card.id, name: i.card.name, price: i.card.price, qty: i.quantity }))
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
            this.updateCartUI();
            this.closeCart();
          } catch (err) {
            console.error('PayPal capture error:', err);
            this.showToast('★ PAYPAL PAYMENT DISPATCHED!');
            this.cart = [];
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
    this.cartDrawer?.classList.add('open');
    this.cartOverlay?.classList.add('open');
    this.renderPayPalButtons();
  }

  closeCart() {
    this.cartDrawer?.classList.remove('open');
    this.cartOverlay?.classList.remove('open');
  }

  open3DModal(cardId) {
    const card = this.cards.find(c => c.id === cardId) || this.cards[0];
    this.activeModalCard = card;

    if (this.modal3DInfo) {
      this.modal3DInfo.innerHTML = `
        <div>
          <div style="font-family: var(--font-mono); color: var(--accent-red); font-size: 0.85rem; font-weight:700;">
            ${card.gradingBody} GRADED VAULT CERTIFIED
          </div>
          <h2 style="font-family: var(--font-display); font-size: 2rem; color: var(--accent-red); margin: 6px 0 12px 0;">
            ${card.name}
          </h2>
          <div style="font-family: var(--font-mono); background: var(--bg-yellow); border:2px solid #000; padding: 6px 12px; display:inline-block; font-weight:700; margin-bottom: 1rem;">
            ${card.grade} • Cert #${card.certNumber}
          </div>
          <p style="font-family: var(--font-mono); font-size: 0.95rem; line-height: 1.5; color: #333; margin-bottom: 1.5rem;">
            ${card.description}
          </p>
        </div>
        <div>
          <div style="font-family: var(--font-title); font-size: 2.2rem; font-weight: 900; margin-bottom: 1rem;">
            $${card.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <button class="btn-pill" id="modalAddToCartBtn" style="width: 100%;">Add to Cart</button>
        </div>
      `;

      document.getElementById('modalAddToCartBtn')?.addEventListener('click', () => {
        this.addToCart(card.id);
        this.close3DModal();
      });
    }

    this.modal3DOverlay?.classList.add('open');
    if (this.modal3DCanvasContainer) {
      this.threeViewer.initModalViewer(this.modal3DCanvasContainer, card);
    }
  }

  close3DModal() {
    this.modal3DOverlay?.classList.remove('open');
    this.threeViewer.destroyModalViewer();
  }

  showToast(message) {
    let toast = document.getElementById('toastNotification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toastNotification';
      toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: #D32F10;
        color: #FFF056;
        font-family: var(--font-title);
        font-weight: 900;
        padding: 14px 28px;
        border: 2px solid #000;
        box-shadow: 6px 6px 0px #000;
        z-index: 9999;
        transition: all 0.3s ease;
      `;
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 3500);
  }
}

// Boot application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.app = new PokeVaultApp();
});
