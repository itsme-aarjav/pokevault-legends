/**
 * POKÉVAULT LEGENDS — Categories Directory Page Controller
 * Displays all 18 categories with cover art, item counts, descriptions, and direct links.
 */

import { renderNavbar, initNavbarEvents } from './components/navbar.js';
import { renderFooter } from './components/footer.js';
import { renderCartDrawer, initCartDrawerEvents } from './components/cart-drawer.js';
import { CATEGORIES_DATA } from './data/categories.js';

class CategoriesPage {
  constructor() {
    this.initLayout();
    this.renderDirectory();
  }

  initLayout() {
    document.getElementById('navbarRoot').innerHTML = renderNavbar('categories');
    document.getElementById('cartDrawerRoot').innerHTML = renderCartDrawer();
    document.getElementById('footerRoot').innerHTML = renderFooter();

    initNavbarEvents();
    initCartDrawerEvents();
  }

  renderDirectory() {
    const grid = document.getElementById('categoriesDirectoryGrid');
    if (!grid) return;

    grid.innerHTML = CATEGORIES_DATA.map(cat => `
      <div class="category-directory-card" style="background: #FFF; border: 3px solid #000; box-shadow: 6px 6px 0px #000; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.15s ease;">
        <div style="height: 180px; background: ${cat.bannerColor}; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
          <img src="${cat.image}" alt="${cat.name}" style="height: 140px; object-fit: contain; filter: drop-shadow(4px 4px 0px rgba(0,0,0,0.3));" />
          <span style="position: absolute; top: 12px; right: 12px; background: #000; color: #FFF056; font-family: var(--font-mono); font-weight: 700; font-size: 0.8rem; padding: 4px 10px; border-radius: 4px;">
            ${cat.count} Items
          </span>
          <span style="position: absolute; bottom: 12px; left: 12px; font-size: 2rem;">
            ${cat.icon}
          </span>
        </div>

        <div style="padding: 1.5rem; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <h3 style="font-family: var(--font-title); font-size: 1.25rem; font-weight: 900; margin-bottom: 6px; color: #000;">
              ${cat.name}
            </h3>
            <p style="font-family: var(--font-mono); font-size: 0.85rem; color: #555; margin-bottom: 1.5rem; line-height: 1.4;">
              ${cat.description}
            </p>
          </div>

          <div style="display: flex; gap: 8px;">
            <a href="category.html?id=${cat.slug}" class="btn-pill" style="flex: 1; text-align: center; text-decoration: none; padding: 10px;">
              Explore Category →
            </a>
            <a href="shop.html?category=${cat.slug}" class="btn-inspect" style="text-decoration: none; padding: 10px 14px;">
              Filter Shop
            </a>
          </div>
        </div>
      </div>
    `).join('');
  }
}

new CategoriesPage();
