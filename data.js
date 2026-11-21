/**
 * ShopBridge E-Commerce Marketplace - Seed Data & Storage Layer
 * Compliant with SRS v1.0 specifications
 * Dual-compatible with both ES Modules (HTTP) and standard browser scripts (file://)
 */

(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    root.ShopBridgeData = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this, function () {

  const STORAGE_KEYS = {
    PRODUCTS: 'shopbridge_products',
    CART: 'shopbridge_cart',
    WISHLIST: 'shopbridge_wishlist',
    ORDERS: 'shopbridge_orders',
    USER: 'shopbridge_user',
    SELLER_REQUESTS: 'shopbridge_seller_requests',
    REVIEWS: 'shopbridge_reviews',
    COUPONS: 'shopbridge_coupons',
    TICKETS: 'shopbridge_tickets',
    AUDIT_LOGS: 'shopbridge_audit_logs',
    SETTINGS: 'shopbridge_settings'
  };

  const INITIAL_CATEGORIES = [
    { id: 'all', name: 'All Categories', icon: 'grid' },
    { id: 'electronics', name: 'Electronics', icon: 'cpu', subcategories: ['Headphones', 'Smartphones', 'Laptops', 'Wearables', 'Audio'] },
    { id: 'fashion', name: 'Fashion & Apparel', icon: 'shirt', subcategories: ['Men', 'Women', 'Footwear', 'Accessories'] },
    { id: 'home', name: 'Home & Kitchen', icon: 'home', subcategories: ['Kitchenware', 'Furniture', 'Decor', 'Lighting'] },
    { id: 'beauty', name: 'Beauty & Personal Care', icon: 'sparkles', subcategories: ['Skincare', 'Fragrances', 'Haircare'] },
    { id: 'sports', name: 'Sports & Outdoors', icon: 'activity', subcategories: ['Fitness', 'Camping', 'Cycling', 'Footwear'] }
  ];

  const INITIAL_PRODUCTS = [
    {
      id: 'sb-prod-1',
      sku: 'SB-ELEC-001',
      title: 'AuraSound Pro Wireless ANC Headphones',
      category: 'electronics',
      subcategory: 'Headphones',
      price: 199.99,
      originalPrice: 249.99,
      rating: 4.8,
      reviewsCount: 142,
      stock: 35,
      sellerId: 'seller-1',
      sellerName: 'Acoustic Labs Official',
      badge: 'Best Seller',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80'
      ],
      description: 'Immerse yourself in pure studio-grade sound with the AuraSound Pro. Features hybrid active noise cancellation, 45-hour ultra battery life, custom 40mm neodymium drivers, and multi-point Bluetooth 5.3 connectivity.',
      features: [
        'Hybrid Active Noise Cancellation up to 38dB',
        '45-Hour Battery Life with Quick Charge (10 min = 5 hours)',
        'Custom 40mm Neodymium Acoustic Drivers',
        'Plush Memory Foam Ear Cushions & Lightweight Aluminum Frame'
      ],
      status: 'active'
    },
    {
      id: 'sb-prod-2',
      sku: 'SB-FASH-002',
      title: 'Minimalist Urban Canvas Everyday Backpack',
      category: 'fashion',
      subcategory: 'Accessories',
      price: 64.50,
      originalPrice: 89.00,
      rating: 4.7,
      reviewsCount: 89,
      stock: 52,
      sellerId: 'seller-2',
      sellerName: 'Nordic Craft Co.',
      badge: 'Popular',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80'
      ],
      description: 'Water-resistant vintage washed canvas backpack engineered with a dedicated padded 16-inch laptop compartment, ergonomic breathable mesh back, and anti-theft hidden pockets for seamless daily commuting.',
      features: [
        'Fits laptops up to 16 inches',
        'Heavy-duty water-repellent organic cotton canvas',
        'Reinforced YKK metal zippers',
        'Ergonomic padded shoulder straps with sternum strap'
      ],
      status: 'active'
    },
    {
      id: 'sb-prod-3',
      sku: 'SB-ELEC-003',
      title: 'Horizon Gen-3 Smart Fitness Watch with AMOLED',
      category: 'electronics',
      subcategory: 'Wearables',
      price: 149.00,
      originalPrice: 199.00,
      rating: 4.9,
      reviewsCount: 310,
      stock: 24,
      sellerId: 'seller-1',
      sellerName: 'Acoustic Labs Official',
      badge: 'Top Rated',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80'
      ],
      description: 'Always-on 1.43-inch vibrant AMOLED display, comprehensive 24/7 heart rate, SpO2 blood oxygen tracking, dual-frequency GPS navigation, and 5ATM water resistance up to 50 meters.',
      features: [
        '1.43" Ultra-Bright AMOLED Always-On Display',
        'Continuous Heart Rate, SpO2 & Sleep Stage Monitoring',
        '100+ Professional Sport & Workout Modes',
        '14-Day Battery Life on a Single Charge'
      ],
      status: 'active'
    },
    {
      id: 'sb-prod-4',
      sku: 'SB-HOME-004',
      title: 'Artisan Matte Ceramic Pour-Over Coffee Set',
      category: 'home',
      subcategory: 'Kitchenware',
      price: 45.00,
      originalPrice: 58.00,
      rating: 4.6,
      reviewsCount: 64,
      stock: 18,
      sellerId: 'seller-3',
      sellerName: 'Terra Living Essentials',
      badge: 'Handcrafted',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80'
      ],
      description: 'Slow pour-over dripper handcrafted from durable stoneware ceramic with internal spiral ribs for optimal brew extraction. Includes matching 600ml server carafe and bamboo coaster.',
      features: [
        'Hand-thrown durable stoneware with tactile matte finish',
        'Optimized extraction spiral groove interior',
        'Heat-resistant ergonomic pouring handle',
        'Dishwasher and microwave safe'
      ],
      status: 'active'
    },
    {
      id: 'sb-prod-5',
      sku: 'SB-BEAU-005',
      title: 'Radiance Botanical Hydrating Facial Serum (50ml)',
      category: 'beauty',
      subcategory: 'Skincare',
      price: 38.00,
      originalPrice: 48.00,
      rating: 4.9,
      reviewsCount: 198,
      stock: 80,
      sellerId: 'seller-3',
      sellerName: 'Terra Living Essentials',
      badge: 'Organic',
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80'
      ],
      description: 'Cold-pressed botanical elixir powered by multi-weight hyaluronic acid, Vitamin C, and squalane. Instantly replenishes deep dermal moisture, calms redness, and unlocks radiant glow.',
      features: [
        '100% Vegan, Cruelty-free & Paraben-free',
        'Multi-molecular Hyaluronic Acid for layered hydration',
        'Stabilized 10% Vitamin C for luminous skin tone',
        'Non-greasy, fast-absorbing micro-formula'
      ],
      status: 'active'
    },
    {
      id: 'sb-prod-6',
      sku: 'SB-SPRT-006',
      title: 'EcoGrip Pro Alignment Yoga Mat (6mm Dual Layer)',
      category: 'sports',
      subcategory: 'Fitness',
      price: 52.00,
      originalPrice: 70.00,
      rating: 4.8,
      reviewsCount: 115,
      stock: 45,
      sellerId: 'seller-2',
      sellerName: 'Nordic Craft Co.',
      badge: 'Eco Friendly',
      image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=80'
      ],
      description: 'Biodegradable natural tree rubber yoga mat featuring laser-etched posture alignment guidelines, sweat-activated non-slip grip, and optimal 6mm dense joint cushioning.',
      features: [
        'Laser-etched body alignment system',
        'Sweat-absorbent textured non-slip polyurethane top',
        'Sustainably harvested natural rubber base',
        'Includes complimentary breathable carrying strap'
      ],
      status: 'active'
    },
    {
      id: 'sb-prod-7',
      sku: 'SB-ELEC-007',
      title: 'SoundPulse Waterproof Portable Bluetooth Speaker',
      category: 'electronics',
      subcategory: 'Audio',
      price: 79.99,
      originalPrice: 99.99,
      rating: 4.7,
      reviewsCount: 220,
      stock: 60,
      sellerId: 'seller-1',
      sellerName: 'Acoustic Labs Official',
      badge: 'IP67 Rugged',
      image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80'
      ],
      description: '360-degree immersive sound with dual passive radiators for deep punchy bass. IP67 certified dust- and water-proof, floatable in water, with 24 hours of non-stop playback.',
      features: [
        'True 360-degree room-filling acoustic profile',
        'IP67 waterproof & floatable in pools',
        'PartySync technology links up to 100 speakers',
        'Built-in powerbank charges your smartphone'
      ],
      status: 'active'
    },
    {
      id: 'sb-prod-8',
      sku: 'SB-HOME-008',
      title: 'Nordic Oak & Linen Dimmable Bedside Lamp',
      category: 'home',
      subcategory: 'Lighting',
      price: 68.00,
      originalPrice: 85.00,
      rating: 4.6,
      reviewsCount: 78,
      stock: 22,
      sellerId: 'seller-3',
      sellerName: 'Terra Living Essentials',
      badge: 'Trending',
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80'
      ],
      description: 'Natural solid white oak base paired with handwoven textured linen lampshade. Features smooth 3-stage touch dimming and dual integrated fast USB-C charging ports in base.',
      features: [
        'Solid FSC-certified White Oak timber',
        'Handmade natural flax linen shade',
        '3-level smooth capacitive touch dimming',
        'Integrated USB-C and USB-A charging ports'
      ],
      status: 'active'
    }
  ];

  const INITIAL_REVIEWS = [
    {
      id: 'rev-1',
      productId: 'sb-prod-1',
      userName: 'Samantha Hayes',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      rating: 5,
      date: '2026-11-14',
      title: 'Outstanding sound quality and ANC!',
      comment: 'The noise cancelling on these is on par with premium flagships costing double. Battery life easily lasts my entire work week. Fast shipping via ShopBridge too!',
      verified: true,
      helpful: 28
    },
    {
      id: 'rev-2',
      productId: 'sb-prod-1',
      userName: 'David Miller',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      rating: 4,
      date: '2026-11-10',
      title: 'Very comfortable for long flights',
      comment: 'Cushions are super soft. Sound profile is rich with crisp highs. Multipoint Bluetooth switches seamlessly between my MacBook and phone.',
      verified: true,
      helpful: 14
    },
    {
      id: 'rev-3',
      productId: 'sb-prod-3',
      userName: 'Elena Rostova',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      rating: 5,
      date: '2026-11-18',
      title: 'Best fitness companion yet',
      comment: 'Accurate GPS for morning trail runs and the AMOLED screen is super bright under direct sunlight. Battery lasts well over 10 days.',
      verified: true,
      helpful: 19
    }
  ];

  const INITIAL_COUPONS = [
    { code: 'SHOPBRIDGE10', discountType: 'percentage', value: 10, minSpend: 50, description: '10% off on orders over $50' },
    { code: 'WELCOME20', discountType: 'percentage', value: 20, minSpend: 100, description: '20% off your first order over $100' },
    { code: 'FREESHIP', discountType: 'shipping', value: 0, minSpend: 30, description: 'Free Express Shipping' }
  ];

  const INITIAL_ORDERS = [
    {
      id: 'ORD-89421',
      date: '2026-11-19T14:30:00Z',
      status: 'out_for_delivery',
      trackingNumber: 'SBTK-99201488',
      courier: 'ShopBridge Express / BlueDart Logistics',
      estimatedDelivery: '2026-11-21',
      timeline: [
        { status: 'Order Placed', timestamp: 'Nov 19, 2026 - 02:30 PM', completed: true, detail: 'Order received and payment verified successfully.' },
        { status: 'Packed by Seller', timestamp: 'Nov 19, 2026 - 05:45 PM', completed: true, detail: 'Acoustic Labs prepared and packaged items with tamper-evident seal.' },
        { status: 'Shipped', timestamp: 'Nov 20, 2026 - 09:15 AM', completed: true, detail: 'In transit from Central Logistics Hub (Bay 4).' },
        { status: 'Out for Delivery', timestamp: 'Nov 21, 2026 - 08:30 AM', completed: true, detail: 'Courier agent Ravi Kumar is on the way to your address.' },
        { status: 'Delivered', timestamp: 'Pending', completed: false, detail: 'Delivery confirmation with OTP.' }
      ],
      items: [
        {
          id: 'sb-prod-1',
          title: 'AuraSound Pro Wireless ANC Headphones',
          price: 199.99,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          sellerName: 'Acoustic Labs Official'
        }
      ],
      shippingAddress: {
        fullName: 'Udhay Kumar',
        street: '42 Crescent Avenue, Tech Park',
        city: 'Bangalore',
        state: 'Karnataka',
        zip: '560100',
        phone: '+91 98765 43210'
      },
      paymentMethod: 'Credit Card (Visa ending in 4242)',
      subtotal: 199.99,
      discount: 20.00,
      shippingFee: 0.00,
      tax: 16.20,
      total: 196.19
    }
  ];

  const INITIAL_FAQS = [
    {
      category: 'Orders & Tracking',
      q: 'How do I track my ShopBridge order?',
      a: 'You can track your order in real-time by clicking on your Profile icon at the top right and selecting "My Orders", or by tapping the tracking link in your confirmation email/SMS.'
    },
    {
      category: 'Orders & Tracking',
      q: 'What is the return and refund policy?',
      a: 'ShopBridge offers a hassle-free 14-day return policy for eligible products. Simply go to "My Orders", select the order, and click "Request Return". Once picked up and verified, refunds are credited within 3-5 business days.'
    },
    {
      category: 'Payments',
      q: 'Which payment methods are accepted?',
      a: 'We accept all major Credit/Debit cards (Visa, MasterCard, Amex), UPI (Google Pay, PhonePe, Paytm), Net Banking from 50+ banks, Digital Wallets, and Cash on Delivery (COD) for eligible pin codes.'
    },
    {
      category: 'Selling on ShopBridge',
      q: 'How do I become a seller on ShopBridge?',
      a: 'Click the "Become a Seller" button in the header or the "Start Selling" button in the hero banner. Complete the 3-step onboarding form with your store name, business tax details, and bank account for payouts. Our admin team approves applications within 24 hours.'
    },
    {
      category: 'Selling on ShopBridge',
      q: 'What are the seller commission rates?',
      a: 'ShopBridge charges a competitive platform commission between 6% and 10% depending on the category. There are zero listing fees, and payouts are deposited directly to your bank account every Wednesday.'
    }
  ];

  class DataStore {
    static get(key, fallback = null) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
      } catch (e) {
        console.warn('LocalStorage read error:', e);
        return fallback;
      }
    }

    static set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.warn('LocalStorage write error:', e);
      }
    }

    static initialize() {
      if (!this.get(STORAGE_KEYS.PRODUCTS)) {
        this.set(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      }
      if (!this.get(STORAGE_KEYS.REVIEWS)) {
        this.set(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
      }
      if (!this.get(STORAGE_KEYS.ORDERS)) {
        this.set(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
      }
      if (!this.get(STORAGE_KEYS.COUPONS)) {
        this.set(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
      }
      if (!this.get(STORAGE_KEYS.CART)) {
        this.set(STORAGE_KEYS.CART, []);
      }
      if (!this.get(STORAGE_KEYS.WISHLIST)) {
        this.set(STORAGE_KEYS.WISHLIST, []);
      }
      if (!this.get(STORAGE_KEYS.USER)) {
        this.set(STORAGE_KEYS.USER, {
          id: 'user-001',
          name: 'Udhay Kumar',
          email: 'udhay@shopbridge.com',
          phone: '+91 98765 43210',
          role: 'user',
          isSellerApproved: true,
          sellerStore: {
            storeName: 'Acoustic Labs Official',
            category: 'electronics',
            totalSales: 24500.00,
            pendingPayout: 1840.50
          }
        });
      }
      if (!this.get(STORAGE_KEYS.SELLER_REQUESTS)) {
        this.set(STORAGE_KEYS.SELLER_REQUESTS, [
          {
            id: 'REQ-101',
            storeName: 'Velvet Stitch Studio',
            applicantName: 'Elena Rostova',
            category: 'fashion',
            taxId: 'GSTIN29ABCDE1234F1Z5',
            date: '2026-11-20',
            status: 'pending'
          }
        ]);
      }
      if (!this.get(STORAGE_KEYS.AUDIT_LOGS)) {
        this.set(STORAGE_KEYS.AUDIT_LOGS, [
          { id: 'LOG-1', action: 'SELLER_APPROVED', target: 'Acoustic Labs Official', admin: 'Admin System', timestamp: '2026-11-18 10:15 AM' },
          { id: 'LOG-2', action: 'COMMISSION_UPDATED', target: 'Electronics Category (8%)', admin: 'Chief Admin', timestamp: '2026-11-19 02:00 PM' }
        ]);
      }
    }

    static getProducts() {
      return this.get(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    }

    static saveProducts(products) {
      this.set(STORAGE_KEYS.PRODUCTS, products);
    }

    static getCart() {
      return this.get(STORAGE_KEYS.CART, []);
    }

    static saveCart(cart) {
      this.set(STORAGE_KEYS.CART, cart);
    }

    static getWishlist() {
      return this.get(STORAGE_KEYS.WISHLIST, []);
    }

    static saveWishlist(list) {
      this.set(STORAGE_KEYS.WISHLIST, list);
    }

    static getOrders() {
      return this.get(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    }

    static saveOrders(orders) {
      this.set(STORAGE_KEYS.ORDERS, orders);
    }

    static getUser() {
      return this.get(STORAGE_KEYS.USER);
    }

    static saveUser(user) {
      this.set(STORAGE_KEYS.USER, user);
    }

    static getSellerRequests() {
      return this.get(STORAGE_KEYS.SELLER_REQUESTS, []);
    }

    static saveSellerRequests(reqs) {
      this.set(STORAGE_KEYS.SELLER_REQUESTS, reqs);
    }

    static getAuditLogs() {
      return this.get(STORAGE_KEYS.AUDIT_LOGS, []);
    }

    static logAction(action, target, admin = 'Current Admin') {
      const logs = this.getAuditLogs();
      logs.unshift({
        id: `LOG-${Date.now()}`,
        action,
        target,
        admin,
        timestamp: new Date().toLocaleString()
      });
      this.set(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 50));
    }
  }

  return {
    STORAGE_KEYS,
    INITIAL_CATEGORIES,
    INITIAL_PRODUCTS,
    INITIAL_REVIEWS,
    INITIAL_COUPONS,
    INITIAL_ORDERS,
    INITIAL_FAQS,
    DataStore
  };
});
