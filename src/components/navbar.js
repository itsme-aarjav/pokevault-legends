/**
 * POKÉVAULT LEGENDS — Shared Navbar Component
 * Renders consistent header, search auto-complete, wishlist badge, cart badge, and mobile drawer.
 */

import { getCart, getWishlist } from '../utils/store.js';
import { searchProducts } from '../data/products.js';

export function renderNavbar(activePage = 'home') {
  const cart = getCart();
  const wishlist = getWishlist();
  const totalCartUnits = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalWishlistCount = wishlist.length;

  return `
    <!-- TOP TICKER MARQUEE -->
    <div class="ticker-wrap">
      <div class="ticker-move">
        <span class="ticker-item">⚡ NATIONWIDE FLAT-RATE VAULT SHIPPING ON ALL MERCHANDISE &amp; SLABS</span>
        <span class="ticker-item">★ 100% OFFICIAL POKÉMON CENTER &amp; PSA / BGS AUTHENTICATED</span>
        <span class="ticker-item">⚡ USE CODE "POKEVAULT10" FOR 10% OFF YOUR ENTIRE ORDER</span>
        <span class="ticker-item">★ OVER 60+ EXCLUSIVE POKÉMON COLLECTIBLES IN STOCK</span>
        <span class="ticker-item">⚡ NATIONWIDE FLAT-RATE VAULT SHIPPING ON ALL MERCHANDISE &amp; SLABS</span>
      </div>
    </div>

    <!-- MAIN NAVBAR -->
    <header class="navbar">
      <div class="nav-left">
        <button class="icon-btn" id="cartBtn" aria-label="View Shopping Cart">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <span class="cart-count" id="cartCount">${totalCartUnits}</span>
        </button>

        <a href="wishlist.html" class="icon-btn" aria-label="Wishlist">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <span class="cart-count" id="wishlistCount" style="background:var(--accent-red);">${totalWishlistCount}</span>
        </a>
      </div>

      <a href="index.html" class="logo-stamp">
        <div class="logo-badge">POKÉVAULT</div>
        <div style="font-family: var(--font-display); font-size: 1.5rem; color: var(--accent-red); margin-top: 2px;">LEGENDS</div>
      </a>

      <!-- SEARCH BAR -->
      <div class="nav-search-wrap">
        <form action="search.html" method="GET" class="nav-search-form">
          <input type="text" name="q" id="navSearchInput" class="nav-search-input" placeholder="Search Pikachu, Plush, Cards, Apparel..." autocomplete="off" />
          <button type="submit" class="nav-search-btn" aria-label="Search">🔍</button>
        </form>
        <div class="search-results-dropdown" id="searchDropdown"></div>
      </div>

      <nav class="nav-right">
        <ul class="nav-links">
          <li><a href="index.html" class="nav-link ${activePage === 'home' ? 'active' : ''}">Home</a></li>
          <li><a href="shop.html" class="nav-link ${activePage === 'shop' ? 'active' : ''}">Shop All</a></li>
          <li><a href="categories.html" class="nav-link ${activePage === 'categories' ? 'active' : ''}">Categories</a></li>
          <li><a href="wishlist.html" class="nav-link ${activePage === 'wishlist' ? 'active' : ''}">Wishlist</a></li>
          <li><a href="about.html" class="nav-link ${activePage === 'about' ? 'active' : ''}">About</a></li>
          <li><a href="contact.html" class="nav-link ${activePage === 'contact' ? 'active' : ''}">Contact</a></li>
          <li><a href="admin.html" class="nav-link" style="color:var(--accent-red); font-weight:700;">Admin Vault</a></li>
        </ul>

        <button class="mobile-nav-toggle" id="mobileNavToggleBtn" aria-label="Open Mobile Menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <button class="icon-btn" id="accountBtn" aria-label="Account / Admin Login">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </button>
      </nav>
    </header>

    <!-- MOBILE NAVIGATION DRAWER OVERLAY -->
    <div class="mobile-nav-overlay" id="mobileNavOverlay">
      <div class="mobile-nav-menu">
        <div class="mobile-nav-header">
          <div class="logo-stamp">
            <div class="logo-badge">POKÉVAULT</div>
          </div>
          <button class="mobile-nav-close" id="closeMobileNavBtn">&times;</button>
        </div>
        <ul class="mobile-nav-links">
          <li><a href="index.html" class="mobile-nav-link ${activePage === 'home' ? 'active' : ''}">⚡ Home</a></li>
          <li><a href="shop.html" class="mobile-nav-link ${activePage === 'shop' ? 'active' : ''}">🛒 Shop All Merchandise</a></li>
          <li><a href="categories.html" class="mobile-nav-link ${activePage === 'categories' ? 'active' : ''}">🏷️ Categories Directory</a></li>
          <li><a href="wishlist.html" class="mobile-nav-link ${activePage === 'wishlist' ? 'active' : ''}">❤️ My Saved Wishlist</a></li>
          <li><a href="cart.html" class="mobile-nav-link ${activePage === 'cart' ? 'active' : ''}">📦 Shopping Cart</a></li>
          <li><a href="about.html" class="mobile-nav-link ${activePage === 'about' ? 'active' : ''}">📜 About PokéVault</a></li>
          <li><a href="contact.html" class="mobile-nav-link ${activePage === 'contact' ? 'active' : ''}">📞 Contact Support</a></li>
          <li><a href="admin.html" class="mobile-nav-link" style="color:var(--accent-red);">🔒 Admin Vault</a></li>
        </ul>
      </div>
    </div>
  `;
}

export function initNavbarEvents() {
  // Mobile Nav Handlers
  const mobileNavToggleBtn = document.getElementById('mobileNavToggleBtn');
  const mobileNavOverlay = document.getElementById('mobileNavOverlay');
  const closeMobileNavBtn = document.getElementById('closeMobileNavBtn');

  mobileNavToggleBtn?.addEventListener('click', () => mobileNavOverlay?.classList.add('open'));
  closeMobileNavBtn?.addEventListener('click', () => mobileNavOverlay?.classList.remove('open'));
  mobileNavOverlay?.addEventListener('click', (e) => {
    if (e.target === mobileNavOverlay) mobileNavOverlay.classList.remove('open');
  });

  // Live Instant Search Dropdown
  const searchInput = document.getElementById('navSearchInput');
  const searchDropdown = document.getElementById('searchDropdown');

  if (searchInput && searchDropdown) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim();
      if (q.length < 2) {
        searchDropdown.style.display = 'none';
        return;
      }

      const matches = searchProducts(q).slice(0, 5);
      if (matches.length === 0) {
        searchDropdown.innerHTML = `<div class="search-no-result">No Pokémon merchandise found matching "${q}"</div>`;
      } else {
        searchDropdown.innerHTML = matches.map(item => `
          <a href="product.html?id=${item.id}" class="search-dropdown-item">
            <img src="${item.image}" alt="${item.name}" />
            <div>
              <div class="search-item-title">${item.name}</div>
              <div class="search-item-meta">${item.categoryName} • $${item.price.toFixed(2)}</div>
            </div>
          </a>
        `).join('') + `<a href="search.html?q=${encodeURIComponent(q)}" class="search-view-all">View all results for "${q}" →</a>`;
      }
      searchDropdown.style.display = 'block';
    });

    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
        searchDropdown.style.display = 'none';
      }
    });
  }

  // Update Dynamic Badges on Custom Events
  window.addEventListener('pv-cart-updated', (e) => {
    const cart = e.detail || getCart();
    const countEl = document.getElementById('cartCount');
    if (countEl) countEl.textContent = cart.reduce((sum, i) => sum + i.quantity, 0);
  });

  window.addEventListener('pv-wishlist-updated', (e) => {
    const wishlist = e.detail || getWishlist();
    const countEl = document.getElementById('wishlistCount');
    if (countEl) countEl.textContent = wishlist.length;
  });
}
