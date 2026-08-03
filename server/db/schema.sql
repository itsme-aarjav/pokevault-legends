-- ============================================================================
-- POKÉVAULT LEGENDS - Supabase PostgreSQL Schema Script
-- Run this script in your Supabase SQL Editor (https://app.supabase.com)
-- ============================================================================

-- 1. DROP EXISTING TABLES IF RE-CREATING (CASCADE)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS cards CASCADE;

-- 2. CREATE CARDS TABLE
CREATE TABLE cards (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sub_name VARCHAR(255),
    era VARCHAR(100),
    era_code VARCHAR(50),
    card_no VARCHAR(50),
    release_year VARCHAR(10),
    grade VARCHAR(50),
    grade_score VARCHAR(20),
    grading_body VARCHAR(20),
    cert_number VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    image VARCHAR(550) NOT NULL,
    gallery JSONB DEFAULT '[]'::jsonb,
    rarity VARCHAR(100),
    badge VARCHAR(100),
    hp VARCHAR(20),
    type VARCHAR(50),
    artist VARCHAR(255),
    description TEXT,
    is_trending BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    holo_type VARCHAR(50),
    comic_lore JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. CREATE INVENTORY TABLE
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id VARCHAR(100) UNIQUE NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    stock_quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT NOT NULL DEFAULT 0,
    low_stock_threshold INT NOT NULL DEFAULT 1,
    is_in_stock BOOLEAN GENERATED ALWAYS AS (stock_quantity > 0) STORED,
    last_restocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. CREATE CUSTOMER ORDERS TABLE
CREATE TABLE orders (
    id VARCHAR(100) PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    shipping_address TEXT NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    promo_code VARCHAR(50),
    insurance_included BOOLEAN DEFAULT true,
    insurance_cost DECIMAL(10, 2) DEFAULT 9.99,
    total_amount DECIMAL(10, 2) NOT NULL,
    order_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, dispatched, delivered, cancelled
    payment_status VARCHAR(50) DEFAULT 'completed',
    tracking_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. CREATE ORDER ITEMS LINE-ITEM TABLE
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(100) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    card_id VARCHAR(100) NOT NULL REFERENCES cards(id) ON DELETE RESTRICT,
    card_name VARCHAR(255) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. INDEXES FOR FAST QUERYING
CREATE INDEX idx_cards_era ON cards(era_code);
CREATE INDEX idx_cards_trending ON cards(is_trending);
CREATE INDEX idx_cards_featured ON cards(is_featured);
CREATE INDEX idx_inventory_card_id ON inventory(card_id);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- 7. SEED DATA FOR CARDS
INSERT INTO cards (
    id, name, sub_name, era, era_code, card_no, release_year,
    grade, grade_score, grading_body, cert_number, price, original_price,
    image, gallery, rarity, badge, hp, type, artist, description,
    is_trending, is_featured, holo_type, comic_lore
) VALUES
(
    'charizard-base-1st',
    '1st Edition Shadowless Charizard',
    'Rare Collector''s Holo Edition',
    '01 Golden Era (1996-1999)',
    'golden',
    '#4/102',
    '1999',
    'PSA 10 GEM MT',
    '10',
    'PSA',
    '47318042',
    4850.00,
    5500.00,
    'assets/charizard.png',
    '["assets/charizard.png", "assets/card_back.png", "assets/card_detail.png"]'::jsonb,
    'Secret Holo Rare',
    'Vault Holy Grail',
    '120 HP',
    'Fire',
    'Ken Sugimori / Pulp Master',
    'The crown jewel of Pokémon collecting. Features iconic 1st edition black stamp, shadowless yellow border framing, and high-intensity pulp halftone fire flare graphics.',
    true,
    true,
    'fire-rainbow',
    '{
        "issueTitle": "ISSUE #4 — MOUNT MOLTEN RAGES!",
        "comicImage": "assets/charizard_comic.png",
        "storyHeadline": "THE UNSTOPPABLE FIERY DESCENDANT",
        "originStory": "Deep within the volcanic chambers of Cinnabar Island, Charizard''s tail flame burns with the fury of molten magma. Legends tell that when Charizard flies through the night skies, its fire blast illuminates entire mountain ranges for miles.",
        "moves": [
            {"name": "Energy Burn", "power": "100+", "type": "Fire", "desc": "Converts all attached energy into superheated plasma fire."},
            {"name": "Fire Blast", "power": "140", "type": "Magma", "desc": "Discards 2 Energy cards to unleash a catastrophic volcanic wave."}
        ],
        "stats": {"power": "99/100", "speed": "88/100", "element": "Fire / Flying", "tier": "Holy Grail"}
    }'::jsonb
),
(
    'pikachu-illustrator-98',
    'CoroCoro Pikachu Illustrator Promo',
    'Rare First Print - Pen & Ink Edition',
    '01 Golden Era (1996-1999)',
    'golden',
    'PROMO #025',
    '1998',
    'PSA 9 MINT',
    '9',
    'PSA',
    '28741359',
    12500.00,
    14000.00,
    'assets/pikachu.png',
    '["assets/pikachu.png", "assets/card_back.png", "assets/card_detail.png"]'::jsonb,
    'Unique Trophy Promo',
    '1 of 39 Worldwide',
    '60 HP',
    'Electric',
    'Ken Sugimori',
    'Awarded exclusively to winners of the 1998 CoroCoro Comic Illustration Contest. Hand-drawn vintage ink styling with classic Japanese pulp dialog clouds.',
    true,
    false,
    'gold-foil',
    '{
        "issueTitle": "ISSUE #1 — THE ART OF ELECTRIC POWER!",
        "comicImage": "assets/pikachu_comic.png",
        "storyHeadline": "100,000 VOLTS OF CREATIVE ADVENTURE",
        "originStory": "Commissioned as the supreme trophy for the 1998 CoroCoro Comic contest, Illustrator Pikachu channels 100,000 Volts of electric creativity directly onto artist easels. Only 39 verified physical copies exist across the globe.",
        "moves": [
            {"name": "Thunderbolt Sketch", "power": "60", "type": "Electric", "desc": "Draws electrified ink lines that paralyze opposing Pokémon."},
            {"name": "Trophy Spark", "power": "100", "type": "Promo", "desc": "Grants immunity from all status conditions for 3 turns."}
        ],
        "stats": {"power": "95/100", "speed": "96/100", "element": "Electric / Pen", "tier": "Trophy Secret"}
    }'::jsonb
),
(
    'shining-rayquaza-star',
    'Shining Rayquaza Star',
    'Limited Collector''s Cosmic Edition',
    '02 Silver Classics (2000-2006)',
    'silver',
    '#107/107',
    '2004',
    'BGS 9.5 GEM MT',
    '9.5',
    'BGS',
    '81234567',
    3200.00,
    3600.00,
    'assets/rayquaza.png',
    '["assets/rayquaza.png", "assets/card_back.png", "assets/card_detail.png"]'::jsonb,
    'Gold Star Shiny',
    'Pulp Sci-Fi Exclusive',
    '90 HP',
    'Dragon / Fire',
    'Masakazu Fukuda',
    'Striking black shiny Rayquaza unleashing a cosmic stardust beam across galaxy stars. Styled with authentic 1970s pulp sci-fi typography and retro starbursts.',
    true,
    false,
    'cosmic-galaxy',
    '{
        "issueTitle": "SPACE ADVENTURES — THE OZONE GUARDIAN",
        "comicImage": "assets/rayquaza_comic.png",
        "storyHeadline": "ASTRONOMICAL THREAT OBLITERATED",
        "originStory": "Soaring endlessly through the high atmospheric ozone layer, the shiny black dragon Rayquaza feeds on atmospheric water vapor and meteors. When cosmic threats descend upon Earth, Rayquaza obliterates them with stardust laser bursts.",
        "moves": [
            {"name": "Cosmic Burst", "power": "70+", "type": "Dragon", "desc": "Flips a coin to trigger stardust rain meteor explosions."},
            {"name": "Ozone Blast", "power": "150", "type": "Atmospheric", "desc": "Obliterates incoming space threats with high-intensity laser blasts."}
        ],
        "stats": {"power": "98/100", "speed": "94/100", "element": "Dragon / Flight", "tier": "Gold Star"}
    }'::jsonb
),
(
    'dark-gengar-neo',
    'Dark Gengar Neo Destiny',
    'Shadow Pulp Library Variant',
    '02 Silver Classics (2000-2006)',
    'silver',
    '#6/105',
    '2002',
    'PSA 9 MINT',
    '9',
    'PSA',
    '91028374',
    1850.00,
    2100.00,
    'assets/gengar.png',
    '["assets/gengar.png", "assets/card_back.png", "assets/card_detail.png"]'::jsonb,
    'Holo Secret Rare',
    'Vault Fan Favorite',
    '90 HP',
    'Psychic / Ghost',
    'Atsuko Nishida',
    'Dark Gengar lurking inside a vintage pulp library surrounded by glowing spellbooks and crystal orbs. High-contrast deep purple halftone line art.',
    true,
    false,
    'shadow-purple',
    '{
        "issueTitle": "THE MYSTERY OF THE SHADOW CURSE",
        "comicImage": "assets/gengar_comic.png",
        "storyHeadline": "SINISTER ARCHIVAL ILLUSIONS",
        "originStory": "Lurking in forgotten ancient archives and shadowed libraries, Dark Gengar manipulates dark shadow matter. It absorbs heat from its surroundings, dropping the room temperature by 10 degrees whenever it prepares to strike.",
        "moves": [
            {"name": "Night Terrors", "power": "40+", "type": "Ghost", "desc": "Paralyzes defending Pokémon with sinister shadow illusions."},
            {"name": "Shadow Curse", "power": "80", "type": "Psychic", "desc": "Places permanent shadow counters across enemy bench benches."}
        ],
        "stats": {"power": "92/100", "speed": "90/100", "element": "Ghost / Psychic", "tier": "Neo Secret"}
    }'::jsonb
),
(
    'lugia-crystal-aquapolis',
    'Crystal Lugia Secret Rare',
    'Aquapolis E-Reader Edition',
    '02 Silver Classics (2000-2006)',
    'silver',
    '#149/147',
    '2003',
    'PSA 10 GEM MT',
    '10',
    'PSA',
    '55419820',
    3950.00,
    4300.00,
    'assets/lugia.png',
    '["assets/lugia.png", "assets/card_back.png", "assets/card_detail.png"]'::jsonb,
    'Crystal Type Secret Rare',
    'E-Reader Classic',
    '100 HP',
    'Colorless / Psychic',
    'Kouki Saitou',
    'The elusive Crystal Lugia featuring dual energy dot-codes along the left margin and prismatic prism foil highlights.',
    false,
    false,
    'prism-crystal',
    '{
        "issueTitle": "ISSUE #7 — OCEAN ADVENTURES OF LUGIA",
        "comicImage": "assets/charizard_comic.png",
        "storyHeadline": "THE DIVINE PROTECTOR OF SEAS",
        "originStory": "Lugia slumbers in deep ocean trenches. It is said that a flutter of its wings causes a 40-day tempest storm over oceanic islands.",
        "moves": [
            {"name": "Aeroblast", "power": "140", "type": "Air", "desc": "Creates a vortex blast that blows away storm clouds."},
            {"name": "Divine Protection", "power": "100", "type": "Crystal", "desc": "Shields Lugia from all damage during the next turn."}
        ],
        "stats": {"power": "97/100", "speed": "91/100", "element": "Psychic / Sea", "tier": "Crystal Rare"}
    }'::jsonb
),
(
    'mew-shining-corocoro',
    'CoroCoro Shining Mew',
    'Japanese 1998 Vintage Holo',
    '01 Golden Era (1996-1999)',
    'golden',
    '#151',
    '2001',
    'PSA 10 GEM MT',
    '10',
    'PSA',
    '77291045',
    2450.00,
    2800.00,
    'assets/mew.png',
    '["assets/mew.png", "assets/card_back.png", "assets/card_detail.png"]'::jsonb,
    'Shining Holo Promo',
    'CoroCoro Heritage',
    '50 HP',
    'Psychic',
    'Hironobu Yoshida',
    'Full-card glitter holographic sparkle effect with pink cosmic halftone clouds and retro vintage Japanese text.',
    false,
    false,
    'glitter-pink',
    '{
        "issueTitle": "ISSUE #9 — SHINING MEW COSMIC ORIGIN",
        "comicImage": "assets/pikachu_comic.png",
        "storyHeadline": "ANCESTRAL POKÉMON OF ALL SPECIES",
        "originStory": "Mew contains the genetic code of all Pokémon. It is capable of learning any move and rendering itself invisible at will.",
        "moves": [
            {"name": "Psychic Wave", "power": "40+", "type": "Psychic", "desc": "Sends out cosmic wave pulses across the arena."},
            {"name": "Cosmic Shield", "power": "90", "type": "Sparkle", "desc": "Reflects incoming attacks back at the opponent."}
        ],
        "stats": {"power": "94/100", "speed": "99/100", "element": "Psychic / Genesis", "tier": "CoroCoro Vintage"}
    }'::jsonb
);

-- 8. SEED DATA FOR INVENTORY
INSERT INTO inventory (card_id, stock_quantity, reserved_quantity, low_stock_threshold) VALUES
('charizard-base-1st', 1, 0, 1),
('pikachu-illustrator-98', 1, 0, 1),
('shining-rayquaza-star', 2, 0, 1),
('dark-gengar-neo', 3, 0, 1),
('lugia-crystal-aquapolis', 1, 0, 1),
('mew-shining-corocoro', 2, 0, 1);
