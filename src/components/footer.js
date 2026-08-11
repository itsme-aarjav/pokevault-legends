/**
 * POKÉVAULT LEGENDS — Shared Footer Component
 * Renders brand story, category shortcuts, newsletter signup, and copyright info.
 */

export function renderFooter() {
  return `
    <footer class="footer-wrap">
      <div class="footer-top-strip">
        <div class="footer-feature-item">
          <div class="footer-feature-icon">🛡️</div>
          <div class="footer-feature-title">100% AUTHENTIC GUARANTEE</div>
          <div class="footer-feature-desc">All slabs PSA/BGS graded & official Pokémon Center licensed merchandise.</div>
        </div>
        <div class="footer-feature-item">
          <div class="footer-feature-icon">🚀</div>
          <div class="footer-feature-title">VAULT EXPRESS DISPATCH</div>
          <div class="footer-feature-desc">Flat-rate tracked shipping with armored bubble wrapping & insurance.</div>
        </div>
        <div class="footer-feature-item">
          <div class="footer-feature-icon">💳</div>
          <div class="footer-feature-title">SECURE VAULT PAY</div>
          <div class="footer-feature-desc">PayPal Smart Checkout, Apple Pay, Visa & Mastercard support.</div>
        </div>
      </div>

      <div class="footer-main-grid">
        <div class="footer-col brand-col">
          <div class="logo-stamp" style="margin-bottom: 1rem;">
            <div class="logo-badge">POKÉVAULT</div>
            <div style="font-family: var(--font-display); font-size: 1.6rem; color: var(--accent-red); margin-top: 2px;">LEGENDS</div>
          </div>
          <p class="footer-bio">
            The world's premier Pokémon merchandise marketplace and graded slab vault. Collecting legends, plush, figures, apparel, and rare artifacts from Gen 1 to Gen 9.
          </p>
          <div class="footer-socials">
            <a href="#" class="social-btn">📱</a>
            <a href="#" class="social-btn">📸</a>
            <a href="#" class="social-btn">💬</a>
            <a href="#" class="social-btn">🎥</a>
          </div>
        </div>

        <div class="footer-col">
          <h4 class="footer-heading">MARKETPLACE</h4>
          <ul class="footer-links">
            <li><a href="shop.html">Shop All Products</a></li>
            <li><a href="categories.html">All 18 Categories</a></li>
            <li><a href="category.html?id=trading-cards">Trading Cards &amp; Slabs</a></li>
            <li><a href="category.html?id=plush-toys">Plush Toys &amp; Companions</a></li>
            <li><a href="category.html?id=figures-statues">Scale Figures &amp; Statues</a></li>
            <li><a href="category.html?id=clothing-apparel">Apparel &amp; Streetwear</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4 class="footer-heading">CUSTOMER VAULT</h4>
          <ul class="footer-links">
            <li><a href="cart.html">View Shopping Cart</a></li>
            <li><a href="wishlist.html">My Saved Wishlist</a></li>
            <li><a href="checkout.html">Checkout &amp; Dispatch</a></li>
            <li><a href="about.html">About PokéVault</a></li>
            <li><a href="contact.html">Contact Support &amp; FAQ</a></li>
            <li><a href="admin.html">Admin Curator Vault</a></li>
          </ul>
        </div>

        <div class="footer-col newsletter-col">
          <h4 class="footer-heading">VIP VAULT DISPATCH</h4>
          <p class="footer-sub-text">Subscribe to get instant alerts on limited plush drops, PSA slab restocks & 20% off promo codes.</p>
          <form class="footer-news-form" id="footerNewsForm" onsubmit="event.preventDefault(); alert('★ Thank you for joining PokéVault VIP Dispatch!');">
            <input type="email" placeholder="Enter trainer email..." class="footer-news-input" required />
            <button type="submit" class="btn-pill" style="padding: 10px 16px;">JOIN VIP</button>
          </form>
        </div>
      </div>

      <div class="footer-bottom-bar">
        <div>© 2026 POKÉVAULT LEGENDS INC. ALL RIGHTS RESERVED. POKÉMON IS A TRADEMARK OF NINTENDO / CREATURES INC. / GAME FREAK.</div>
        <div style="display:flex; gap:1rem; flex-wrap:wrap;">
          <a href="about.html" style="color:#FFF;">Privacy Policy</a>
          <span>•</span>
          <a href="about.html" style="color:#FFF;">Terms of Vault Dispatch</a>
          <span>•</span>
          <a href="contact.html" style="color:#FFF;">Authenticity Guarantee</a>
        </div>
      </div>
    </footer>
  `;
}
