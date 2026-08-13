# ⚡ POKÉVAULT LEGENDS — 3D Pokémon Merchandise Marketplace

[![Next.js](https://img.shields.io/badge/Next.js-14.2.15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0.12-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.160.0-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Express.js](https://img.shields.io/badge/Express-Backend-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)

An ultra-modern, high-performance **3D E-Commerce Marketplace** for authentic, authenticated Pokémon collectibles, PSA/BGS graded slabs, plush companions, resin statues, streetwear apparel, and room decor. 

Built with a bold **Retro-Neubrutalist design system**, WebGL 3D interactive slab tilt viewers, intelligent multi-faceted search & filtering, gamified cart experiences, and a full Admin Vault management suite.

---

## 🌟 Key Highlights & Features

### 🎮 Interactive 3D WebGL Experiences
- **3D Card Viewer (`Three.js`)**: Interactive 3D rendering of PSA & BGS graded Pokémon slabs with real-time mouse tilt physics, dynamic specular highlights, ambient illumination, and holographic reflections.
- **Hero 3D Stage**: WebGL landing stage featuring interactive floating collectibles and smooth viewport parallax scrolling effects (`src/hero-3d-stage.js`).

### 🛒 Full E-Commerce Marketplace & Catalog
- **Multi-Faceted Marketplace Filtering**:
  - Filter by **18+ Categories** (Graded Slabs, Plush Toys, Figures, Clothing, Accessories, Room Decor, etc.).
  - Filter by **Pokémon Character** (Pikachu, Charizard, Gengar, Eevee, Mewtwo, Rayquaza, Snorlax, Starters).
  - Dynamic **Max Price Range Slider** ($10 – $15,000+).
  - **Minimum Rating Selector** (4.5★+, 4.8★+, 5.0★ Perfect).
  - **In-Stock Availability Toggle**.
- **Instant Search with Autocomplete**: Real-time matching against product titles, categories, tags, and character attributes with instant image dropdown previews.
- **Responsive Mobile Layout**: Fully optimized 2x2 grid card view on mobile viewports with sticky mobile filter drawer toggles.

### 🛍️ Smart Shopping Cart & Wishlist
- **Gamified Free Shipping Bar**: Live progress indicator calculating remaining amount needed to qualify for free vault shipping ($150 threshold).
- **In-Cart Smart Upsells**: Dynamically recommended accessories and protective sleeves based on cart contents.
- **Persistent Wishlist System**: One-tap bookmarking for favorite collectibles across sessions.
- **Promo Code Engine**: Discount validation (e.g. `POKEVAULT10` for 10% off).

### 🔒 Admin Vault Management Suite (`/admin.html` / `/admin`)
- Real-time KPI summary cards (Total Revenue, Orders Count, Average Order Value, Total Items In Stock).
- Dynamic product management: Add new items, update pricing, edit stock quantities, and remove listings.
- Customer order tracking and fulfillment status management.

### 🔍 Automated SEO & Performance Engine
- Structured **Schema.org JSON-LD Microdata** for rich Google search snippets (Product pricing, aggregate rating, in-stock availability).
- Automated XML Sitemap Generator (`scripts/generate_seo_sitemap.js`).
- OpenGraph & Twitter Card meta tag integration across all pages.

---

## 🏗️ Architecture & Tech Stack

### Technology Stack
- **Framework**: Dual setup supporting Next.js 14 App Router (`src/app`) & Vite 5 Client SPA (`index.html`, `shop.html`, etc.).
- **UI Library**: React 18 & HTML5/ES Modules.
- **Styling**: Vanilla CSS3 (`styles.css`) using a custom **Neubrutalist Design System** (bold black borders, hard offset shadows `#000`, vibrant yellow `#FFF056`, red `#E94057`, and clean typography).
- **3D Graphics Engine**: Three.js (`0.160.0`) for real-time 3D canvas rendering.
- **Backend API**: Node.js & Express.js (`server/index.js`, `server/local_dev_server.js`).
- **Database**: Supabase PostgreSQL backend integration (`supabase_schema.sql`).
- **Animations**: Canvas Confetti (`canvas-confetti`) for checkout celebration triggers.

---

## 📁 Repository Structure

```text
pokevault-legends/
├── public/
│   └── assets/                  # Product imagery, 3D textures, and logos
├── server/
│   ├── index.js                 # Express server & API endpoints
│   ├── local_dev_server.js      # Local development server setup
│   └── ssr_renderer.js          # SSR rendering utility
├── src/
│   ├── app/                     # Next.js 14 App Router pages
│   │   ├── layout.js            # Global layout wrapper
│   │   ├── page.js              # Home landing page
│   │   └── shop/                # Shop marketplace page
│   ├── components/              # React & Vanilla JS UI Components
│   │   ├── Navbar.jsx / navbar.js
│   │   ├── Footer.jsx / footer.js
│   │   ├── CartDrawer.jsx / cart-drawer.js
│   │   ├── ProductCard.jsx / product-card.js
│   │   └── Hero3DStage.jsx / hero-3d-stage.js
│   ├── context/                 # React Context State (StoreContext.jsx)
│   ├── data/                    # Product catalog & category data (products.js, categories.js)
│   ├── three-card-viewer.js     # Three.js 3D Slab Tilt Physics Engine
│   └── shop.js                  # Marketplace catalog controller
├── scripts/                     # Automated SEO, review, and asset generation utilities
├── index.html                   # Home page template
├── shop.html                    # Marketplace shop template
├── product.html                 # Product detail page template
├── cart.html                    # Shopping cart page template
├── checkout.html                # Single-page checkout template
├── admin.html                   # Admin Vault dashboard template
├── styles.css                   # Core Neubrutalist Design System Stylesheet
├── supabase_schema.sql          # PostgreSQL Database Schema
├── vite.config.js               # Vite bundler configuration
└── package.json                 # Project dependencies & scripts
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/itsme-aarjav/pokevault-legends.git
   cd pokevault-legends
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory (or copy from `.env.example`):
   ```env
   PORT=8080
   NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Run Development Server**:
   ```bash
   # Start Vite dev server
   npm run dev

   # Or start local Node server
   npm run server
   ```

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🗄️ Database Schema (`supabase_schema.sql`)

The backend database utilizes PostgreSQL via Supabase with the following schema structure:

- **`products`**: Product catalog items with `title`, `price`, `category`, `pokemon`, `rating`, `reviews_count`, `image_url`, `stock`, `badge_text`.
- **`orders`**: Customer checkout records with `customer_name`, `email`, `total_amount`, `shipping_address`, `status`, `payment_method`.
- **`order_items`**: Individual line items associated with each completed order.
- **`categories`**: Taxonomy directory for product grouping.

---

## 📄 License & Credits

Designed & Developed for Pokémon Collectors & Enthusiasts worldwide.  
© 2026 **POKÉVAULT LEGENDS**. All rights reserved.
