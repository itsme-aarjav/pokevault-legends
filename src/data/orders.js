/**
 * POKÉVAULT LEGENDS — Master Shared Orders Dataset
 * 
 * Provides a unified source of truth for Orders, Analytics, Customer CRM, and Risk Management.
 */
export const INITIAL_ORDERS = [
  {
    id: 'ord_1001',
    order_id: 'PV-89412',
    customer_name: 'Ash Ketchum',
    customer_email: 'ash@pallettown.jp',
    shipping_address: '123 Pallet Town Way, Kanto Region, 90210',
    total_amount: 145.00,
    subtotal: 135.01,
    discount_amount: 0.00,
    insurance_cost: 9.99,
    status: 'Unfulfilled',
    payment_method: 'PayPal',
    payment_status: 'COMPLETED',
    tracking_number: null,
    created_at: '2026-08-13T18:30:00.000Z',
    items: [
      { card_name: 'Gengar Heavyweight Hoodie', selectedSize: 'XL', quantity: 1, unit_price: 65.00 },
      { card_name: 'Gengar Tactical Sling Bag', selectedSize: null, quantity: 1, unit_price: 35.00 }
    ]
  },
  {
    id: 'ord_1002',
    order_id: 'PV-89413',
    customer_name: 'Misty Waterflower',
    customer_email: 'misty@ceruleangym.io',
    shipping_address: '456 Gym Leader Lane, Cerulean City, 10001',
    total_amount: 89.99,
    subtotal: 80.00,
    discount_amount: 0.00,
    insurance_cost: 9.99,
    status: 'Processing',
    payment_method: 'PayPal',
    payment_status: 'COMPLETED',
    tracking_number: null,
    created_at: '2026-08-13T14:15:00.000Z',
    items: [
      { card_name: 'Pikachu Cyberpunk Neon Sign', selectedSize: null, quantity: 1, unit_price: 80.00 }
    ]
  },
  {
    id: 'ord_1003',
    order_id: 'PV-89414',
    customer_name: 'Brock Slate',
    customer_email: 'brock@pewtergym.org',
    shipping_address: '789 Rock Gym Blvd, Pewter City, 94102',
    total_amount: 210.00,
    subtotal: 200.01,
    discount_amount: 0.00,
    insurance_cost: 9.99,
    status: 'Shipped',
    payment_method: 'PayPal',
    payment_status: 'COMPLETED',
    tracking_number: 'USPS: 9400111899562145879',
    created_at: '2026-08-11T10:00:00.000Z',
    items: [
      { card_name: 'Charizard Vintage Washed Tee', selectedSize: 'L', quantity: 2, unit_price: 45.00 },
      { card_name: 'Rayquaza Reflective Windbreaker', selectedSize: 'XL', quantity: 1, unit_price: 110.00 }
    ]
  },
  {
    id: 'ord_1004',
    order_id: 'PV-89415',
    customer_name: 'Trainer Red',
    customer_email: 'red@mtpinnacle.jp',
    shipping_address: '1 Champion Way, Mt. Silver Peak, 00001',
    total_amount: 2450.00,
    subtotal: 2440.01,
    discount_amount: 0.00,
    insurance_cost: 9.99,
    status: 'Delivered',
    payment_method: 'Credit Card (Stripe)',
    payment_status: 'COMPLETED',
    tracking_number: 'FEDEX: 789123456789',
    created_at: '2026-08-10T16:20:00.000Z',
    items: [
      { card_name: 'Masaki Vending Mail Gengar Holo', selectedSize: null, quantity: 1, unit_price: 2450.00 }
    ]
  },
  {
    id: 'ord_1005',
    order_id: 'PV-89416',
    customer_name: 'Serena Yvonne',
    customer_email: 'serena@kalosfashion.fr',
    shipping_address: '12 Rue de Paris, Kalos, 75001',
    total_amount: 175.00,
    subtotal: 165.01,
    discount_amount: 0.00,
    insurance_cost: 9.99,
    status: 'Delivered',
    payment_method: 'PayPal',
    payment_status: 'COMPLETED',
    tracking_number: 'DHL: 4561237890',
    created_at: '2026-08-09T11:45:00.000Z',
    items: [
      { card_name: 'Sylveon Pastel Embroidered Hoodie', selectedSize: 'M', quantity: 1, unit_price: 85.00 },
      { card_name: 'Eevelution Acrylic Display Stand Set', selectedSize: null, quantity: 1, unit_price: 80.00 }
    ]
  },
  {
    id: 'ord_1006',
    order_id: 'PV-89417',
    customer_name: 'Cynthia Shirona',
    customer_email: 'cynthia@sinnohleague.org',
    shipping_address: '88 Champion Villa, Celestic Town, 00888',
    total_amount: 1890.00,
    subtotal: 1880.01,
    discount_amount: 0.00,
    insurance_cost: 9.99,
    status: 'Shipped',
    payment_method: 'Credit Card (Stripe)',
    payment_status: 'COMPLETED',
    tracking_number: 'UPS: 1Z9999999999999999',
    created_at: '2026-08-08T09:10:00.000Z',
    items: [
      { card_name: 'Gold Star Mewtwo Unseen Forces', selectedSize: null, quantity: 1, unit_price: 1890.00 }
    ]
  },
  {
    id: 'ord_1007',
    order_id: 'PV-89418',
    customer_name: 'Gary Oak',
    customer_email: 'gary@oaklabs.edu',
    shipping_address: '77 Research Way, Pallet Town, 90210',
    total_amount: 320.00,
    subtotal: 310.01,
    discount_amount: 0.00,
    insurance_cost: 9.99,
    status: 'Delivered',
    payment_method: 'PayPal',
    payment_status: 'COMPLETED',
    tracking_number: 'USPS: 9200111899562145111',
    created_at: '2026-08-06T15:00:00.000Z',
    items: [
      { card_name: 'Blastoise Hydro Pump Bomber Jacket', selectedSize: 'L', quantity: 1, unit_price: 150.00 },
      { card_name: 'Umbreon Moonlight Oversized Hoodie', selectedSize: 'L', quantity: 1, unit_price: 160.00 }
    ]
  },
  {
    id: 'ord_1008',
    order_id: 'PV-89419',
    customer_name: 'Lance Dragon',
    customer_email: 'lance@indigoplaza.com',
    shipping_address: '1 Elite Four Chambers, Indigo Plateau, 10002',
    total_amount: 450.00,
    subtotal: 440.01,
    discount_amount: 0.00,
    insurance_cost: 9.99,
    status: 'Delivered',
    payment_method: 'PayPal',
    payment_status: 'COMPLETED',
    tracking_number: 'FEDEX: 444555666777',
    created_at: '2026-08-04T12:30:00.000Z',
    items: [
      { card_name: 'Dragonite Flight Club Leather Jacket', selectedSize: 'XL', quantity: 1, unit_price: 440.00 }
    ]
  },
  {
    id: 'ord_1009',
    order_id: 'PV-89420',
    customer_name: 'James Rocket',
    customer_email: 'james@teamrocket-corp.com',
    shipping_address: '99 Secret HQ, Saffron City, 99999',
    total_amount: 1450.00,
    subtotal: 1440.01,
    discount_amount: 0.00,
    insurance_cost: 9.99,
    status: 'Processing',
    payment_method: 'Credit Card (Stripe)',
    payment_status: 'COMPLETED',
    tracking_number: null,
    created_at: '2026-08-03T19:40:00.000Z',
    items: [
      { card_name: '1st Edition Base Set Booster Pack Sealed', selectedSize: null, quantity: 1, unit_price: 1440.00 }
    ]
  },
  {
    id: 'ord_1010',
    order_id: 'PV-89421',
    customer_name: 'Jessie Rocket',
    customer_email: 'jessie@teamrocket-corp.com',
    shipping_address: '99 Secret HQ, Saffron City, 99999',
    total_amount: 120.00,
    subtotal: 110.01,
    discount_amount: 0.00,
    insurance_cost: 9.99,
    status: 'Refunded',
    payment_method: 'PayPal',
    payment_status: 'REFUNDED',
    tracking_number: null,
    created_at: '2026-08-02T08:15:00.000Z',
    items: [
      { card_name: 'Arbok Poison Cross Beanie', selectedSize: null, quantity: 2, unit_price: 35.00 },
      { card_name: 'Seviper Stealth Waist Bag', selectedSize: null, quantity: 1, unit_price: 40.00 }
    ]
  },
  {
    id: 'ord_1011',
    order_id: 'PV-DRAFT-001',
    customer_name: 'Professor Oak',
    customer_email: 'oak@palletlabs.org',
    shipping_address: '1 Laboratory Lane, Pallet Town, 90210',
    total_amount: 295.00,
    subtotal: 285.01,
    discount_amount: 0.00,
    insurance_cost: 9.99,
    status: 'Draft Orders',
    payment_method: 'Invoice',
    payment_status: 'PENDING',
    tracking_number: null,
    created_at: '2026-08-13T20:00:00.000Z',
    items: [
      { card_name: 'Kanto Starter Pin Collection Box', selectedSize: null, quantity: 3, unit_price: 95.00 }
    ]
  }
];
