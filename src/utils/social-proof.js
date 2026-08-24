/**
 * POKÉVAULT LEGENDS — Conversion Rate Optimization (CRO) & Social Proof Engine
 * Manages live customer activity, scarcity indicators, dispatch countdowns, and trust notifications.
 */

const RECENT_PURCHASES = [
  { buyer: "Kento T.", location: "Tokyo, Japan", item: "1st Edition Shadowless Charizard PSA 10", time: "2 minutes ago", badge: "PSA 10 Grail" },
  { buyer: "Marcus B.", location: "London, UK", item: "CoroCoro Pikachu Illustrator Promo PSA 9", time: "6 minutes ago", badge: "Trophy Promo" },
  { buyer: "Devin R.", location: "New York, USA", item: "Charizard Fire Blast Heat-Morphing Mug", time: "9 minutes ago", badge: "Magic Heat" },
  { buyer: "Aarav S.", location: "Mumbai, India", item: "Red Pokédex Collector Hardcover Journal", time: "14 minutes ago", badge: "Desk Essential" },
  { buyer: "Elena V.", location: "Berlin, Germany", item: "Gengar Shadow Realm XXL Gaming Desk Mat", time: "18 minutes ago", badge: "XXL Gaming" },
  { buyer: "Lucas M.", location: "Sydney, Australia", item: "Rayquaza Celestial Stardust Foil Art Print", time: "23 minutes ago", badge: "Cosmic Foil" },
  { buyer: "Chloe N.", location: "Toronto, Canada", item: "Poké Ball Vacuum Insulated Stainless Tumbler", time: "27 minutes ago", badge: "24H Cold" },
  { buyer: "Kenji S.", location: "Osaka, Japan", item: "Masaki Vending Mail Gengar Holo PSA 9", time: "34 minutes ago", badge: "Grail Promo" }
];

/**
 * Initializes live social proof purchase toast notifications
 */
export function initSocialProofToast() {
  if (typeof document === 'undefined') return;

  let toastContainer = document.getElementById('croSocialToastRoot');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'croSocialToastRoot';
    toastContainer.className = 'cro-toast-container';
    document.body.appendChild(toastContainer);
  }

  let purchaseIndex = 0;

  const showNextToast = () => {
    const data = RECENT_PURCHASES[purchaseIndex % RECENT_PURCHASES.length];
    purchaseIndex++;

    const toast = document.createElement('div');
    toast.className = 'cro-toast-item animate-pop-in';
    toast.innerHTML = `
      <div class="cro-toast-icon">⚡</div>
      <div class="cro-toast-content">
        <div class="cro-toast-header">
          <span class="cro-toast-buyer">${data.buyer}</span>
          <span class="cro-toast-loc">${data.location}</span>
          <span class="cro-toast-verified">✓ Verified</span>
        </div>
        <div class="cro-toast-item-title">Purchased <strong>${data.item}</strong></div>
        <div class="cro-toast-footer">
          <span class="cro-toast-time">${data.time}</span>
          <span class="cro-toast-badge">${data.badge}</span>
        </div>
      </div>
      <button class="cro-toast-close" aria-label="Close Notification">&times;</button>
    `;

    toast.querySelector('.cro-toast-close').addEventListener('click', () => {
      toast.classList.add('animate-fade-out');
      setTimeout(() => toast.remove(), 400);
    });

    toastContainer.appendChild(toast);

    // Auto-remove after 6.5s
    setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.add('animate-fade-out');
        setTimeout(() => toast.remove(), 400);
      }
    }, 6500);
  };

  // First toast after 3.5 seconds, then recurring every 18 seconds
  setTimeout(showNextToast, 3500);
  setInterval(showNextToast, 18000);
}

/**
 * Starts a realistic live viewer counter for high urgency on product details
 */
export function initLiveViewerCounter(elementId, baseCount = 12) {
  const el = document.getElementById(elementId);
  if (!el) return;

  let currentViewers = Math.floor(baseCount + Math.random() * 8);

  const updateDisplay = () => {
    el.innerHTML = `
      <span class="live-pulse-dot"></span>
      <span class="live-view-count"><strong>${currentViewers} collectors</strong> are viewing this vault item right now</span>
    `;
  };

  updateDisplay();

  // Subtle fluctuation every 4-8 seconds
  setInterval(() => {
    const delta = Math.random() > 0.5 ? 1 : -1;
    currentViewers = Math.max(5, currentViewers + delta);
    updateDisplay();
  }, 5000);
}

/**
 * Calculates remaining time until today's dispatch cutoff (e.g. 5:00 PM)
 */
export function getDispatchCutoffTime() {
  const now = new Date();
  const cutoff = new Date();
  cutoff.setHours(17, 0, 0, 0); // 5 PM Cutoff

  if (now > cutoff) {
    cutoff.setDate(cutoff.getDate() + 1);
  }

  const diffMs = cutoff - now;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${diffHours}h ${diffMins}m`;
}

/**
 * Promo code copy helper
 */
export function copyPromoCode(code = 'POKEVAULT10') {
  navigator.clipboard.writeText(code).then(() => {
    const toast = document.createElement('div');
    toast.className = 'promo-copy-toast';
    toast.textContent = `Promo Code "${code}" copied to clipboard!`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  });
}
