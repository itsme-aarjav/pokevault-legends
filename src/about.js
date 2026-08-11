/**
 * POKÉVAULT LEGENDS — About Page Controller
 */

import { renderNavbar, initNavbarEvents } from './components/navbar.js';
import { renderFooter } from './components/footer.js';
import { renderCartDrawer, initCartDrawerEvents } from './components/cart-drawer.js';

class AboutPage {
  constructor() {
    this.initLayout();
  }

  initLayout() {
    document.getElementById('navbarRoot').innerHTML = renderNavbar('about');
    document.getElementById('cartDrawerRoot').innerHTML = renderCartDrawer();
    document.getElementById('footerRoot').innerHTML = renderFooter();

    initNavbarEvents();
    initCartDrawerEvents();
  }
}

new AboutPage();
