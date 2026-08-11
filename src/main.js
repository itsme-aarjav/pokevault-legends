/**
 * POKÉVAULT LEGENDS — Main Storefront Landing Controller
 * Powers homepage 3D WebGL stage, best seller product cards grid, and admin modal.
 */

import { renderNavbar, initNavbarEvents } from './components/navbar.js';
import { renderFooter } from './components/footer.js';
import { renderCartDrawer, initCartDrawerEvents } from './components/cart-drawer.js';
import { renderProductCard, bindProductCardEvents } from './components/product-card.js';
import { getAllProducts } from './data/products.js';
import { Hero3DStage } from './hero-3d-stage.js';
import { ThreeCardViewer } from './three-card-viewer.js';
import { addToCart } from './utils/store.js';
import confetti from 'canvas-confetti';

class MainStore {
  constructor() {
    this.products = getAllProducts();
    this.heroStage = null;
    this.modalViewer = null;

    this.initLayout();
    this.initHeroStage();
    this.renderBestSellers();
    this.initModals();
  }

  initLayout() {
    document.getElementById('navbarRoot').innerHTML = renderNavbar('home');
    document.getElementById('cartDrawerRoot').innerHTML = renderCartDrawer();
    document.getElementById('footerRoot').innerHTML = renderFooter();

    initNavbarEvents();
    initCartDrawerEvents();
  }

  initHeroStage() {
    const container = document.getElementById('hero3DStageContainer');
    if (container) {
      this.heroStage = new Hero3DStage(container);

      document.getElementById('btnExplodeSlab')?.addEventListener('click', () => {
        if (this.heroStage) this.heroStage.toggleExplosion();
      });

      document.getElementById('btnAutoSpin')?.addEventListener('click', () => {
        if (this.heroStage) this.heroStage.toggleAutoSpin();
      });
    }
  }

  renderBestSellers() {
    const grid = document.getElementById('cardsGrid');
    if (!grid) return;

    // Pick top best seller items across categories
    const bestSellers = this.products.filter(p => p.isBestseller || p.isFeatured).slice(0, 8);
    grid.innerHTML = bestSellers.map(p => renderProductCard(p)).join('');
    bindProductCardEvents(grid);
  }

  initModals() {
    // 3D Inspect Modal
    const modal3DOverlay = document.getElementById('modal3DOverlay');
    const close3DModalBtn = document.getElementById('close3DModalBtn');
    const modalContainer = document.getElementById('modal3DCanvasContainer');

    if (modalContainer && !this.modalViewer) {
      this.modalViewer = new ThreeCardViewer();
    }

    close3DModalBtn?.addEventListener('click', () => {
      modal3DOverlay?.classList.remove('open');
    });

    // Admin Vault Login Modal
    const adminOverlay = document.getElementById('adminLoginOverlay');
    const accountBtn = document.getElementById('accountBtn');
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

    accountBtn?.addEventListener('click', openAdminModal);
    closeAdminBtn?.addEventListener('click', closeAdminModal);
    adminOverlay?.addEventListener('click', (e) => {
      if (e.target === adminOverlay) closeAdminModal();
    });

    let adminAttempts = 0;
    let adminLockedUntil = 0;

    adminForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (Date.now() < adminLockedUntil) {
        const secsLeft = Math.ceil((adminLockedUntil - Date.now()) / 1000);
        if (adminError) {
          adminError.textContent = `❌ Too many attempts. Try again in ${secsLeft}s.`;
          adminError.style.display = 'block';
        }
        return;
      }

      const input = document.getElementById('adminPasscodeInput');
      const pass = (input?.value || '').trim();

      fetch('/api/orders', { headers: { 'X-Admin-Key': pass } }).then(res => {
        if (res.ok) {
          sessionStorage.setItem('pvAdminKey', pass);
          confetti({ particleCount: 120, spread: 70, origin: { y: 0.5 } });
          window.location.href = 'admin.html';
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
              adminError.textContent = `❌ Invalid Admin Key. ${3 - adminAttempts} attempts remaining.`;
              adminError.style.display = 'block';
            }
          }
        }
      }).catch(err => {
        if (pass.length >= 16) {
          sessionStorage.setItem('pvAdminKey', pass);
          window.location.href = 'admin.html';
        }
      });
    });
  }
}

new MainStore();
