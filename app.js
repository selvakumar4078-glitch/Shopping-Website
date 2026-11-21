/**
 * ShopBridge E-Commerce Marketplace - Main Application Logic
 * Full implementation compliant with SRS v1.0 (FR-1 through FR-39)
 */

// Extract data layer (works with both ES modules & standard script tags)
const { 
  DataStore, 
  INITIAL_CATEGORIES, 
  INITIAL_FAQS 
} = window.ShopBridgeData || {};

// Application State
const state = {
  currentRole: 'user', // 'user', 'seller', 'admin', 'support'
  activeCategory: 'all',
  searchQuery: '',
  maxPrice: 500,
  minRating: 0,
  inStockOnly: false,
  sortBy: 'relevance',
  activeCoupon: null,
  cart: [],
  wishlist: [],
  products: [],
  orders: [],
  user: null,
  checkoutStep: 1,
  selectedDelivery: 0,
  lastCreatedOrderId: null
};

// UI Notification Toast
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg class="w-5 h-5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>`;
  } else if (type === 'error') {
    iconSvg = `<svg class="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>`;
  } else {
    iconSvg = `<svg class="w-5 h-5 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>`;
  }

  toast.innerHTML = `
    ${iconSvg}
    <div class="flex-1">${message}</div>
    <button class="text-slate-400 hover:text-white text-xs ml-2" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    if (toast.parentElement) toast.remove();
  }, 4000);
}

// Initialize Application
function initApp() {
  DataStore.initialize();
  state.products = DataStore.getProducts();
  state.cart = DataStore.getCart();
  state.wishlist = DataStore.getWishlist();
  state.orders = DataStore.getOrders();
  state.user = DataStore.getUser();

  renderCategories();
  renderProducts();
  updateCartBadge();
  setupEventListeners();
  renderSellerDashboard();
  renderAdminPanel();
  renderSupportDesk();

  console.log('ShopBridge E-Commerce Marketplace initialized successfully.');
}

// Render Categories in Nav & Category Pills
function renderCategories() {
  const navList = document.getElementById('nav-categories-list');
  const pillsContainer = document.getElementById('category-pills-container');

  if (navList) {
    navList.innerHTML = INITIAL_CATEGORIES.filter(c => c.id !== 'all').map(cat => `
      <button class="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-sb-blue transition-colors flex items-center justify-between category-nav-item" data-category="${cat.id}">
        <span>${cat.name}</span>
        <span class="text-[10px] text-slate-400">→</span>
      </button>
    `).join('');
  }

  if (pillsContainer) {
    pillsContainer.innerHTML = INITIAL_CATEGORIES.map(cat => `
      <button 
        class="category-pill px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
          state.activeCategory === cat.id 
            ? 'bg-sb-blue text-white shadow-md shadow-blue-500/20' 
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }" 
        data-category="${cat.id}">
        ${cat.name}
      </button>
    `).join('');
  }
}

// Filter and Sort Products
function getFilteredProducts() {
  let list = [...state.products];

  // Category Filter
  if (state.activeCategory !== 'all') {
    list = list.filter(p => p.category === state.activeCategory);
  }

  // Keyword Search Filter
  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase();
    list = list.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) ||
      (p.features && p.features.some(f => f.toLowerCase().includes(q))) ||
      p.sellerName.toLowerCase().includes(q)
    );
  }

  // Price Filter
  list = list.filter(p => p.price <= state.maxPrice);

  // Rating Filter
  if (state.minRating > 0) {
    list = list.filter(p => p.rating >= state.minRating);
  }

  // In Stock Filter
  if (state.inStockOnly) {
    list = list.filter(p => p.stock > 0);
  }

  // Sort
  if (state.sortBy === 'price-low') {
    list.sort((a, b) => a.price - b.price);
  } else if (state.sortBy === 'price-high') {
    list.sort((a, b) => b.price - a.price);
  } else if (state.sortBy === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  }

  return list;
}

// Render Products Grid
function renderProducts() {
  const grid = document.getElementById('products-grid');
  const countLabel = document.getElementById('catalog-count');
  const emptyState = document.getElementById('catalog-empty');
  if (!grid) return;

  const filtered = getFilteredProducts();
  if (countLabel) countLabel.innerText = filtered.length;

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  grid.innerHTML = filtered.map(prod => {
    const isWishlisted = state.wishlist.includes(prod.id);
    const discount = prod.originalPrice ? Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100) : 0;

    return `
      <div class="product-card bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm flex flex-col group relative" data-id="${prod.id}">
        <!-- Image & Badges -->
        <div class="relative bg-slate-50 aspect-square overflow-hidden cursor-pointer btn-quickview-trigger" data-id="${prod.id}">
          <img src="${prod.image}" alt="${prod.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
          
          <!-- Discount Badge -->
          ${discount > 0 ? `
            <span class="absolute top-3 left-3 bg-red-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
              -${discount}%
            </span>
          ` : ''}

          <!-- Product Feature Tag -->
          ${prod.badge ? `
            <span class="absolute bottom-3 left-3 bg-[#0D2040]/80 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
              ${prod.badge}
            </span>
          ` : ''}

          <!-- Wishlist Heart Button -->
          <button class="btn-toggle-wishlist absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-md text-slate-400 hover:text-red-500 hover:bg-white shadow-sm transition-all" data-id="${prod.id}" title="Save to wishlist">
            <svg class="w-4 h-4 ${isWishlisted ? 'text-red-500 fill-red-500' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
          </button>
        </div>

        <!-- Product Details -->
        <div class="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span class="font-medium uppercase">${prod.category}</span>
              <span class="text-slate-500 font-semibold">${prod.sellerName}</span>
            </div>
            
            <h3 class="font-bold text-sm text-[#0D2040] line-clamp-2 hover:text-sb-blue cursor-pointer btn-quickview-trigger" data-id="${prod.id}">
              ${prod.title}
            </h3>

            <!-- Rating Stars -->
            <div class="flex items-center gap-1.5 mt-2">
              <div class="flex items-center text-amber-400 text-xs">
                ★ <span class="font-bold text-slate-800 ml-1 text-xs">${prod.rating}</span>
              </div>
              <span class="text-[11px] text-slate-400">(${prod.reviewsCount} reviews)</span>
            </div>
          </div>

          <!-- Price & Action -->
          <div class="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <div class="text-lg font-black text-[#0D2040]">$${prod.price.toFixed(2)}</div>
              ${prod.originalPrice ? `<div class="text-xs text-slate-400 line-through">$${prod.originalPrice.toFixed(2)}</div>` : ''}
            </div>

            <button class="btn-add-to-cart px-4 py-2 rounded-xl bg-sb-blue hover:bg-sb-blueDark text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-1.5" data-id="${prod.id}">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
              Add
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Cart Management (FR-11, FR-12)
function addToCart(productId, quantity = 1) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const existingIndex = state.cart.findIndex(item => item.productId === productId);
  if (existingIndex > -1) {
    state.cart[existingIndex].quantity += quantity;
  } else {
    state.cart.push({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      sellerName: product.sellerName,
      quantity: quantity
    });
  }

  DataStore.saveCart(state.cart);
  updateCartBadge();
  renderCartDrawer();
  showToast(`Added "${product.title.slice(0, 24)}..." to cart`, 'success');
}

function updateCartQuantity(productId, delta) {
  const itemIndex = state.cart.findIndex(i => i.productId === productId);
  if (itemIndex === -1) return;

  state.cart[itemIndex].quantity += delta;
  if (state.cart[itemIndex].quantity <= 0) {
    state.cart.splice(itemIndex, 1);
  }

  DataStore.saveCart(state.cart);
  updateCartBadge();
  renderCartDrawer();
}

function removeCartItem(productId) {
  state.cart = state.cart.filter(i => i.productId !== productId);
  DataStore.saveCart(state.cart);
  updateCartBadge();
  renderCartDrawer();
  showToast('Item removed from cart', 'info');
}

function updateCartBadge() {
  const totalCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cart-badge-count');
  const drawerBadge = document.getElementById('cart-drawer-count-badge');
  if (badge) badge.innerText = totalCount;
  if (drawerBadge) drawerBadge.innerText = `${totalCount} item${totalCount === 1 ? '' : 's'}`;
}

function getCartCalculations() {
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  let discount = 0;

  if (state.activeCoupon) {
    if (state.activeCoupon.discountType === 'percentage') {
      discount = (subtotal * state.activeCoupon.value) / 100;
    }
  }

  const shipping = subtotal > 50 || (state.activeCoupon && state.activeCoupon.discountType === 'shipping') ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% simulated tax
  const total = Math.max(0, subtotal - discount + (state.selectedDelivery || 0));

  return { subtotal, discount, shipping, tax, total };
}

// Render Cart Drawer
function renderCartDrawer() {
  const container = document.getElementById('cart-items-container');
  if (!container) return;

  const calcs = getCartCalculations();

  // Free shipping progress bar
  const freeShippingThreshold = 50.0;
  const progressPct = Math.min(100, Math.round((calcs.subtotal / freeShippingThreshold) * 100));
  const meterBar = document.getElementById('shipping-meter-bar');
  const meterText = document.getElementById('shipping-meter-text');
  const meterPct = document.getElementById('shipping-meter-pct');

  if (meterBar && meterText && meterPct) {
    meterBar.style.width = `${progressPct}%`;
    meterPct.innerText = `${progressPct}%`;
    if (calcs.subtotal >= freeShippingThreshold) {
      meterText.innerText = 'You qualify for FREE Express Delivery!';
      meterBar.className = 'bg-emerald-500 h-full transition-all duration-300';
    } else {
      meterText.innerText = `Add $${(freeShippingThreshold - calcs.subtotal).toFixed(2)} more for FREE Express Delivery!`;
      meterBar.className = 'bg-sb-blue h-full transition-all duration-300';
    }
  }

  if (state.cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-16 text-slate-400">
        <svg class="w-16 h-16 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
        <p class="text-sm font-semibold text-slate-600">Your cart is empty</p>
        <p class="text-xs mt-1">Discover thousands of top products from independent sellers!</p>
      </div>
    `;
  } else {
    container.innerHTML = state.cart.map(item => `
      <div class="py-3 flex items-center gap-3">
        <img src="${item.image}" alt="${item.title}" class="w-16 h-16 object-cover rounded-xl border border-slate-100 flex-shrink-0">
        <div class="flex-1 min-w-0">
          <h4 class="font-bold text-xs text-slate-800 truncate">${item.title}</h4>
          <span class="text-[10px] text-slate-400">Sold by ${item.sellerName}</span>
          <div class="font-black text-xs text-[#0D2040] mt-1">$${item.price.toFixed(2)}</div>
        </div>
        <div class="flex items-center gap-2">
          <div class="flex items-center border border-slate-200 rounded-lg bg-slate-50">
            <button class="btn-qty-minus px-2 py-0.5 text-slate-600 hover:text-black font-bold text-xs" data-id="${item.productId}">-</button>
            <span class="px-2 text-xs font-bold text-slate-800">${item.quantity}</span>
            <button class="btn-qty-plus px-2 py-0.5 text-slate-600 hover:text-black font-bold text-xs" data-id="${item.productId}">+</button>
          </div>
          <button class="btn-cart-remove text-slate-400 hover:text-red-500 p-1" data-id="${item.productId}" title="Remove item">
            ✕
          </button>
        </div>
      </div>
    `).join('');
  }

  // Update totals in drawer footer
  document.getElementById('cart-subtotal-text').innerText = `$${calcs.subtotal.toFixed(2)}`;
  document.getElementById('cart-total-text').innerText = `$${calcs.total.toFixed(2)}`;

  const discountRow = document.getElementById('cart-discount-row');
  if (calcs.discount > 0) {
    discountRow.classList.remove('hidden');
    document.getElementById('cart-discount-text').innerText = `-$${calcs.discount.toFixed(2)}`;
  } else {
    discountRow.classList.add('hidden');
  }
}

// Multi-Step Checkout Modal (FR-14 to FR-19)
function openCheckoutModal() {
  if (state.cart.length === 0) {
    showToast('Your cart is empty. Please add items before checking out.', 'error');
    return;
  }

  // Close cart drawer
  document.getElementById('cart-drawer-backdrop').classList.add('hidden');

  state.checkoutStep = 1;
  updateCheckoutStepUI();
  updateCheckoutSummary();

  const modal = document.getElementById('checkout-modal-backdrop');
  if (modal) modal.classList.remove('hidden');
}

function updateCheckoutStepUI() {
  const step1 = document.getElementById('checkout-step-1');
  const step2 = document.getElementById('checkout-step-2');
  const step3 = document.getElementById('checkout-step-3');

  const ind1 = document.getElementById('checkout-step-1-indicator');
  const ind2 = document.getElementById('checkout-step-2-indicator');
  const ind3 = document.getElementById('checkout-step-3-indicator');

  step1.classList.toggle('hidden', state.checkoutStep !== 1);
  step2.classList.toggle('hidden', state.checkoutStep !== 2);
  step3.classList.toggle('hidden', state.checkoutStep !== 3);

  ind1.className = `flex items-center gap-2 text-xs font-bold ${state.checkoutStep >= 1 ? 'text-sb-blue' : 'text-slate-400'}`;
  ind2.className = `flex items-center gap-2 text-xs font-bold ${state.checkoutStep >= 2 ? 'text-sb-blue' : 'text-slate-400'}`;
  ind3.className = `flex items-center gap-2 text-xs font-bold ${state.checkoutStep >= 3 ? 'text-sb-blue' : 'text-slate-400'}`;
}

function updateCheckoutSummary() {
  const calcs = getCartCalculations();
  document.getElementById('chk-summary-subtotal').innerText = `$${calcs.subtotal.toFixed(2)}`;
  document.getElementById('chk-summary-delivery').innerText = state.selectedDelivery === 0 ? 'FREE' : `$${state.selectedDelivery.toFixed(2)}`;
  document.getElementById('chk-summary-tax').innerText = `$${calcs.tax.toFixed(2)}`;
  document.getElementById('chk-summary-total').innerText = `$${(calcs.total + state.selectedDelivery).toFixed(2)}`;
}

// Complete Order & Generate Invoice (FR-18)
function placeOrder() {
  const calcs = getCartCalculations();
  const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
  const trackingNumber = `SBTK-${Math.floor(10000000 + Math.random() * 90000000)}`;

  const customerName = document.getElementById('chk-name').value || 'Udhay Kumar';
  const customerPhone = document.getElementById('chk-phone').value || '+91 98765 43210';
  const street = document.getElementById('chk-street').value || '42 Crescent Avenue';
  const city = document.getElementById('chk-city').value || 'Bangalore';
  const zip = document.getElementById('chk-zip').value || '560100';

  const newOrder = {
    id: orderId,
    date: new Date().toISOString(),
    status: 'placed',
    trackingNumber: trackingNumber,
    courier: 'ShopBridge Express Logistics',
    estimatedDelivery: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    timeline: [
      { status: 'Order Placed', timestamp: 'Just now', completed: true, detail: 'Order received and payment verified via PCI-DSS 256-bit gateway.' },
      { status: 'Packed by Seller', timestamp: 'Pending', completed: false, detail: 'Seller preparing package with safety seal.' },
      { status: 'Shipped', timestamp: 'Pending', completed: false, detail: 'Awaiting courier dispatch from fulfillment bay.' },
      { status: 'Out for Delivery', timestamp: 'Pending', completed: false, detail: 'Courier dispatch to doorstep.' },
      { status: 'Delivered', timestamp: 'Pending', completed: false, detail: 'Delivery confirmation.' }
    ],
    items: state.cart.map(c => ({
      id: c.productId,
      title: c.title,
      price: c.price,
      quantity: c.quantity,
      image: c.image,
      sellerName: c.sellerName
    })),
    shippingAddress: {
      fullName: customerName,
      street: street,
      city: city,
      state: 'Karnataka',
      zip: zip,
      phone: customerPhone
    },
    paymentMethod: 'Credit Card (Simulated PCI-DSS)',
    subtotal: calcs.subtotal,
    discount: calcs.discount,
    shippingFee: state.selectedDelivery,
    tax: calcs.tax,
    total: calcs.total + state.selectedDelivery
  };

  // Save to persistent storage
  state.orders.unshift(newOrder);
  DataStore.saveOrders(state.orders);

  // Clear cart
  state.cart = [];
  DataStore.saveCart([]);
  updateCartBadge();
  renderCartDrawer();

  // Log in Audit
  DataStore.logAction('NEW_ORDER_PLACED', `${orderId} - Total: $${newOrder.total.toFixed(2)}`, customerName);

  // Close Checkout Modal
  document.getElementById('checkout-modal-backdrop').classList.add('hidden');

  // Open Invoice Modal
  state.lastCreatedOrderId = orderId;
  openInvoiceModal(newOrder);
  showToast(`Order ${orderId} placed successfully!`, 'success');
}

// Render Printable Invoice (FR-18)
function openInvoiceModal(order) {
  const modal = document.getElementById('invoice-modal-backdrop');
  if (!modal) return;

  document.getElementById('inv-order-id').innerText = order.id;
  document.getElementById('inv-date').innerText = new Date(order.date).toLocaleDateString();
  document.getElementById('inv-customer-name').innerText = order.shippingAddress.fullName;
  document.getElementById('inv-customer-address').innerHTML = `${order.shippingAddress.street}<br>${order.shippingAddress.city}, ${order.shippingAddress.zip}`;
  document.getElementById('inv-customer-phone').innerText = order.shippingAddress.phone;
  document.getElementById('inv-tracking-no').innerText = `Tracking: ${order.trackingNumber}`;

  const itemsTable = document.getElementById('inv-items-table');
  itemsTable.innerHTML = order.items.map(item => `
    <tr>
      <td class="py-2 px-3 font-medium text-slate-800">${item.title}</td>
      <td class="py-2 px-3 text-center">${item.quantity}</td>
      <td class="py-2 px-3 text-right">$${item.price.toFixed(2)}</td>
      <td class="py-2 px-3 text-right font-bold">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  document.getElementById('inv-subtotal').innerText = `$${order.subtotal.toFixed(2)}`;
  document.getElementById('inv-discount').innerText = `-$${order.discount.toFixed(2)}`;
  document.getElementById('inv-shipping').innerText = order.shippingFee === 0 ? 'FREE' : `$${order.shippingFee.toFixed(2)}`;
  document.getElementById('inv-total').innerText = `$${order.total.toFixed(2)}`;

  modal.classList.remove('hidden');
}

// Open Order Tracking Modal (FR-20 to FR-23)
function openTrackingModal(orderId) {
  const order = state.orders.find(o => o.id === orderId) || state.orders[0];
  if (!order) return;

  const modal = document.getElementById('tracking-modal-backdrop');
  document.getElementById('trk-order-id').innerText = order.id;
  document.getElementById('trk-courier-name').innerText = order.courier;
  document.getElementById('trk-number').innerText = order.trackingNumber;

  const timelineContainer = document.getElementById('tracking-timeline-container');
  timelineContainer.innerHTML = order.timeline.map((step, idx) => `
    <div class="relative flex items-start gap-4">
      <!-- Vertical connecting line -->
      ${idx < order.timeline.length - 1 ? `
        <div class="absolute left-3.5 top-6 bottom-0 w-0.5 ${step.completed ? 'bg-sb-blue' : 'bg-slate-200'}"></div>
      ` : ''}
      
      <!-- Milestone Icon -->
      <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 z-10 ${
        step.completed ? 'bg-sb-blue text-white shadow-md shadow-blue-500/20' : 'bg-slate-200 text-slate-500'
      }">
        ${step.completed ? '✓' : idx + 1}
      </div>

      <!-- Milestone Details -->
      <div class="flex-1 pb-4">
        <div class="flex items-center justify-between">
          <h4 class="font-bold text-xs ${step.completed ? 'text-slate-900' : 'text-slate-500'}">${step.status}</h4>
          <span class="text-[10px] text-slate-400">${step.timestamp}</span>
        </div>
        <p class="text-[11px] text-slate-600 mt-0.5">${step.detail}</p>
      </div>
    </div>
  `).join('');

  modal.classList.remove('hidden');
}

// Product Quick View Modal (FR-9, FR-24)
function openProductQuickView(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const allReviews = DataStore.get('shopbridge_reviews', []);
  const productReviews = allReviews.filter(r => r.productId === productId);

  const modal = document.getElementById('quickview-modal-backdrop');
  const content = document.getElementById('quickview-modal-content');

  content.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Gallery Column -->
      <div>
        <div class="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 mb-3">
          <img id="qv-main-image" src="${product.image}" alt="${product.title}" class="w-full h-full object-cover">
        </div>
        <div class="flex gap-2 overflow-x-auto pb-1">
          ${(product.images || [product.image]).map((img, i) => `
            <img src="${img}" class="w-16 h-16 rounded-xl object-cover border-2 cursor-pointer transition-all ${i === 0 ? 'border-sb-blue' : 'border-slate-200 hover:border-slate-400'}" onclick="document.getElementById('qv-main-image').src='${img}'">
          `).join('')}
        </div>
      </div>

      <!-- Info Column -->
      <div class="flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-sb-blue uppercase">${product.category}</span>
            <span class="text-xs text-slate-500">SKU: ${product.sku}</span>
          </div>

          <h2 class="text-xl font-black text-[#0D2040] leading-snug">${product.title}</h2>
          
          <div class="flex items-center gap-2 my-2.5">
            <div class="flex text-amber-400 text-sm">★★★★★</div>
            <span class="text-xs font-bold text-slate-800">${product.rating}</span>
            <span class="text-xs text-slate-400">(${productReviews.length || product.reviewsCount} verified reviews)</span>
          </div>

          <div class="my-3 flex items-baseline gap-3">
            <span class="text-3xl font-black text-[#0D2040]">$${product.price.toFixed(2)}</span>
            ${product.originalPrice ? `<span class="text-base text-slate-400 line-through">$${product.originalPrice.toFixed(2)}</span>` : ''}
            <span class="text-xs font-bold text-emerald-600">In Stock (${product.stock} units left)</span>
          </div>

          <p class="text-xs text-slate-600 leading-relaxed mb-4">${product.description}</p>

          <div class="space-y-1.5 mb-6 text-xs text-slate-700">
            ${(product.features || []).map(f => `
              <div class="flex items-center gap-2">
                <span class="text-sb-blue font-bold">✓</span>
                <span>${f}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between mb-4 text-xs">
            <div>
              <span class="text-slate-400">Seller:</span>
              <span class="font-bold text-slate-800 ml-1">${product.sellerName}</span>
            </div>
            <span class="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold text-[10px]">Verified Partner</span>
          </div>

          <div class="flex gap-3">
            <button id="qv-btn-add-cart" class="flex-1 py-3 bg-sb-blue hover:bg-sb-blueDark text-white font-bold rounded-2xl text-xs shadow-md transition-all active:scale-95" data-id="${product.id}">
              Add to Shopping Cart
            </button>
            <button id="qv-btn-wishlist" class="p-3 rounded-2xl border border-slate-200 hover:border-red-400 text-slate-500 hover:text-red-500 transition-colors" data-id="${product.id}">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Verified Reviews Section (FR-24) -->
    <div class="mt-8 pt-8 border-t border-slate-100">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold text-sm text-[#0D2040]">Customer Reviews & Ratings</h3>
        <button id="btn-show-add-review" class="text-xs font-bold text-sb-blue hover:underline">+ Write a Review</button>
      </div>

      <!-- Add Review Form (Hidden by default) -->
      <form id="add-review-form" class="hidden mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3">
        <div class="font-bold text-slate-800">Share your experience with this product</div>
        <div>
          <label class="block font-semibold text-slate-600 mb-1">Rating</label>
          <select id="review-input-rating" class="p-2 border border-slate-300 rounded-lg bg-white">
            <option value="5">★★★★★ (5 - Excellent)</option>
            <option value="4">★★★★☆ (4 - Good)</option>
            <option value="3">★★★☆☆ (3 - Average)</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-600 mb-1">Review Headline</label>
          <input type="text" id="review-input-title" required placeholder="e.g. Exceptional sound and comfortable!" class="w-full p-2 border border-slate-300 rounded-lg">
        </div>
        <div>
          <label class="block font-semibold text-slate-600 mb-1">Your Detailed Review</label>
          <textarea id="review-input-comment" required rows="3" placeholder="Tell other shoppers why you loved this item..." class="w-full p-2 border border-slate-300 rounded-lg"></textarea>
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" id="btn-cancel-review" class="px-3 py-1.5 text-slate-500 font-bold hover:underline">Cancel</button>
          <button type="submit" class="px-4 py-1.5 bg-sb-blue text-white rounded-lg font-bold">Submit Review</button>
        </div>
      </form>

      <!-- Reviews Feed -->
      <div class="space-y-3">
        ${productReviews.length === 0 ? `
          <div class="text-xs text-slate-400 py-3">No reviews submitted yet. Be the first to review!</div>
        ` : productReviews.map(r => `
          <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-800">${r.userName}</span>
              <span class="text-[10px] text-slate-400">${r.date}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-amber-400">★★★★★</span>
              <span class="font-bold text-slate-700">${r.title}</span>
            </div>
            <p class="text-slate-600 text-[11px] leading-relaxed">${r.comment}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Attach event listener for Add Cart inside modal
  document.getElementById('qv-btn-add-cart').onclick = () => {
    addToCart(product.id, 1);
  };

  // Attach review form toggle
  const showReviewBtn = document.getElementById('btn-show-add-review');
  const reviewForm = document.getElementById('add-review-form');
  const cancelReviewBtn = document.getElementById('btn-cancel-review');

  if (showReviewBtn && reviewForm) {
    showReviewBtn.onclick = () => reviewForm.classList.remove('hidden');
    cancelReviewBtn.onclick = () => reviewForm.classList.add('hidden');

    reviewForm.onsubmit = (e) => {
      e.preventDefault();
      const rating = parseInt(document.getElementById('review-input-rating').value, 10);
      const title = document.getElementById('review-input-title').value;
      const comment = document.getElementById('review-input-comment').value;

      const newReview = {
        id: `rev-${Date.now()}`,
        productId: product.id,
        userName: state.user ? state.user.name : 'Udhay Kumar',
        rating: rating,
        date: new Date().toISOString().split('T')[0],
        title: title,
        comment: comment,
        verified: true,
        helpful: 1
      };

      const updatedReviews = [newReview, ...allReviews];
      DataStore.set('shopbridge_reviews', updatedReviews);
      showToast('Thank you! Your verified review has been posted.', 'success');
      openProductQuickView(product.id);
    };
  }

  modal.classList.remove('hidden');
}

// Seller Dashboard Logic (FR-26 to FR-32)
function renderSellerDashboard() {
  const tableBody = document.getElementById('seller-products-table-body');
  if (!tableBody) return;

  const sellerProducts = state.products.filter(p => p.sellerId === 'seller-1' || p.sellerName === 'Acoustic Labs Official');

  tableBody.innerHTML = sellerProducts.map(p => `
    <tr class="hover:bg-slate-50 transition-colors">
      <td class="py-3 px-4 flex items-center gap-3">
        <img src="${p.image}" class="w-10 h-10 object-cover rounded-lg border border-slate-200">
        <span class="font-bold text-slate-800">${p.title}</span>
      </td>
      <td class="py-3 px-4 font-mono text-slate-500">${p.sku}</td>
      <td class="py-3 px-4 font-bold text-slate-900">$${p.price.toFixed(2)}</td>
      <td class="py-3 px-4">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${p.stock < 30 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}">
          ${p.stock} in stock
        </span>
      </td>
      <td class="py-3 px-4">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-sb-blue">Active</span>
      </td>
      <td class="py-3 px-4 text-right space-x-2">
        <button class="text-sb-blue hover:underline font-bold" onclick="alert('Editing ${p.sku}')">Edit</button>
        <button class="text-red-500 hover:underline font-bold" onclick="alert('Listing deactivated')">Deactivate</button>
      </td>
    </tr>
  `).join('');

  // Seller orders list with shipping labels
  const ordersList = document.getElementById('seller-orders-list');
  if (ordersList) {
    ordersList.innerHTML = state.orders.map(order => `
      <div class="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div>
          <div class="flex items-center gap-2">
            <span class="font-black text-slate-800">${order.id}</span>
            <span class="px-2 py-0.5 bg-blue-100 text-sb-blue rounded font-bold uppercase text-[10px]">${order.status}</span>
          </div>
          <div class="text-slate-500 mt-1">Buyer: ${order.shippingAddress.fullName} • Items: ${order.items.length} • Total: $${order.total.toFixed(2)}</div>
        </div>
        <div class="flex items-center gap-2">
          <button class="btn-print-shipping-label px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-bold text-slate-700" data-id="${order.id}">
            Print Shipping Label
          </button>
          <button class="btn-mark-shipped px-3 py-1.5 bg-sb-blue hover:bg-sb-blueDark text-white rounded-lg font-bold" data-id="${order.id}">
            Advance Milestone
          </button>
        </div>
      </div>
    `).join('');
  }
}

// Admin Panel Logic (FR-35 to FR-39)
function renderAdminPanel() {
  const requestsContainer = document.getElementById('admin-seller-requests');
  const logsContainer = document.getElementById('admin-audit-logs');
  const pendingCount = document.getElementById('admin-pending-count');

  const requests = DataStore.getSellerRequests();
  if (pendingCount) pendingCount.innerText = `${requests.filter(r => r.status === 'pending').length} Pending`;

  if (requestsContainer) {
    if (requests.length === 0) {
      requestsContainer.innerHTML = `<div class="text-xs text-slate-400 py-3">No pending seller applications.</div>`;
    } else {
      requestsContainer.innerHTML = requests.map(req => `
        <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div class="flex items-center justify-between font-bold">
            <span class="text-slate-900">${req.storeName}</span>
            <span class="px-2 py-0.5 rounded text-[10px] uppercase ${req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
              ${req.status}
            </span>
          </div>
          <div class="text-slate-500 mt-1 text-[11px]">Applicant: ${req.applicantName} • Tax ID: ${req.taxId}</div>
          ${req.status === 'pending' ? `
            <div class="mt-3 flex gap-2">
              <button class="btn-approve-seller px-3 py-1 bg-emerald-600 text-white rounded font-bold text-[11px]" data-id="${req.id}">Approve Store</button>
              <button class="btn-reject-seller px-3 py-1 bg-red-600 text-white rounded font-bold text-[11px]" data-id="${req.id}">Reject</button>
            </div>
          ` : ''}
        </div>
      `).join('');
    }
  }

  if (logsContainer) {
    const logs = DataStore.getAuditLogs();
    logsContainer.innerHTML = logs.map(l => `
      <div class="py-2 flex items-center justify-between text-[11px]">
        <div>
          <span class="font-bold text-sb-blue font-mono">${l.action}</span>
          <span class="text-slate-600 ml-1.5">${l.target}</span>
        </div>
        <span class="text-slate-400">${l.timestamp}</span>
      </div>
    `).join('');
  }
}

// Support Desk & FAQs (FR-33)
function renderSupportDesk() {
  const faqList = document.getElementById('support-faq-list');
  if (faqList) {
    faqList.innerHTML = INITIAL_FAQS.map(faq => `
      <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
        <h4 class="font-bold text-slate-800">${faq.q}</h4>
        <p class="text-slate-600 mt-1 text-[11px] leading-relaxed">${faq.a}</p>
      </div>
    `).join('');
  }
}

// 24/7 Chatbot simulated interactions (FR-33)
function handleSupportChat(userText) {
  const messagesContainer = document.getElementById('chat-messages-container');
  if (!messagesContainer || !userText.trim()) return;

  // Append user bubble
  const userBubble = document.createElement('div');
  userBubble.className = 'flex justify-end gap-2';
  userBubble.innerHTML = `
    <div class="bg-sb-blue text-white p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[80%] text-xs">
      ${userText}
    </div>
  `;
  messagesContainer.appendChild(userBubble);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // Generate intelligent response based on SRS queries
  let botReply = "Thank you for reaching out! Our 24/7 customer care team is reviewing your query. You can also view live delivery tracking in 'My Orders'.";
  const lower = userText.toLowerCase();

  if (lower.includes('track') || lower.includes('order') || lower.includes('where is')) {
    botReply = `Your recent order (${state.orders[0]?.id || 'ORD-89421'}) is currently in transit with BlueDart. Estimated delivery: Today before 6:00 PM.`;
  } else if (lower.includes('return') || lower.includes('refund')) {
    botReply = "ShopBridge provides a 14-day zero-hassle return window. Once an order is delivered, you can click 'Request Return' from the Order History page.";
  } else if (lower.includes('sell') || lower.includes('seller') || lower.includes('store')) {
    botReply = "Starting a store takes under 2 minutes! Click 'Become a Seller' in the top header, submit your business name and tax info, and our admin team will approve your account within 24 hours.";
  }

  setTimeout(() => {
    const botBubble = document.createElement('div');
    botBubble.className = 'flex gap-2';
    botBubble.innerHTML = `
      <div class="w-6 h-6 rounded-full bg-blue-100 text-sb-blue flex items-center justify-center flex-shrink-0 font-bold text-[10px]">SB</div>
      <div class="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 max-w-[80%] text-slate-700 text-xs">
        ${botReply}
      </div>
    `;
    messagesContainer.appendChild(botBubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, 600);
}

// Global Event Listeners Setup
function setupEventListeners() {
  // Role Switcher
  const roleSelect = document.getElementById('role-select');
  if (roleSelect) {
    roleSelect.addEventListener('change', (e) => {
      state.currentRole = e.target.value;
      
      document.getElementById('view-shopper').classList.toggle('hidden', state.currentRole !== 'user');
      document.getElementById('view-seller').classList.toggle('hidden', state.currentRole !== 'seller');
      document.getElementById('view-admin').classList.toggle('hidden', state.currentRole !== 'admin');
      document.getElementById('view-support').classList.toggle('hidden', state.currentRole !== 'support');

      showToast(`Switched active view to: ${e.target.options[e.target.selectedIndex].text}`, 'info');
    });
  }

  // Quick Order button in top bar
  document.getElementById('btn-quick-orders')?.addEventListener('click', () => {
    openTrackingModal(state.orders[0]?.id || 'ORD-89421');
  });

  // Search input & Suggestions
  const searchInput = document.getElementById('global-search-input');
  const suggestionsBox = document.getElementById('search-suggestions');
  const suggestionsList = document.getElementById('search-suggestions-list');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      state.searchQuery = q;
      renderProducts();

      if (q.length > 1) {
        const matches = state.products.filter(p => p.title.toLowerCase().includes(q)).slice(0, 4);
        if (matches.length > 0) {
          suggestionsList.innerHTML = matches.map(m => `
            <div class="p-2.5 hover:bg-slate-50 cursor-pointer flex items-center gap-2 suggestion-item" data-id="${m.id}">
              <img src="${m.image}" class="w-8 h-8 rounded-lg object-cover">
              <div class="flex-1 truncate">
                <span class="font-bold text-slate-800">${m.title}</span>
                <span class="text-sb-blue ml-2 font-bold">$${m.price.toFixed(2)}</span>
              </div>
            </div>
          `).join('');
          suggestionsBox.classList.remove('hidden');
        } else {
          suggestionsBox.classList.add('hidden');
        }
      } else {
        suggestionsBox.classList.add('hidden');
      }
    });

    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
        suggestionsBox.classList.add('hidden');
      }
    });
  }

  // Suggestion item click
  document.addEventListener('click', (e) => {
    const item = e.target.closest('.suggestion-item');
    if (item) {
      const prodId = item.dataset.id;
      suggestionsBox.classList.add('hidden');
      openProductQuickView(prodId);
    }
  });

  // Category Pills
  document.addEventListener('click', (e) => {
    const pill = e.target.closest('.category-pill');
    if (pill) {
      state.activeCategory = pill.dataset.category;
      renderCategories();
      renderProducts();
    }
    const navItem = e.target.closest('.category-nav-item');
    if (navItem) {
      state.activeCategory = navItem.dataset.category;
      renderCategories();
      renderProducts();
      document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
    }
  });

  // Price Range Filter
  const priceRange = document.getElementById('filter-price-range');
  const priceLabel = document.getElementById('price-val-label');
  if (priceRange) {
    priceRange.addEventListener('input', (e) => {
      state.maxPrice = parseFloat(e.target.value);
      if (priceLabel) priceLabel.innerText = `$${state.maxPrice}`;
      renderProducts();
    });
  }

  // Rating Filter Radios
  document.querySelectorAll('input[name="rating-filter"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.minRating = parseFloat(e.target.value);
      renderProducts();
    });
  });

  // In Stock Checkbox
  const inStockCheckbox = document.getElementById('filter-in-stock');
  if (inStockCheckbox) {
    inStockCheckbox.addEventListener('change', (e) => {
      state.inStockOnly = e.target.checked;
      renderProducts();
    });
  }

  // Sort Dropdown
  const sortSelect = document.getElementById('catalog-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      renderProducts();
    });
  }

  // Reset Filters
  const resetBtn = document.getElementById('btn-reset-filters');
  const emptyResetBtn = document.getElementById('btn-empty-reset');
  const resetFn = () => {
    state.activeCategory = 'all';
    state.searchQuery = '';
    state.maxPrice = 500;
    state.minRating = 0;
    state.inStockOnly = false;
    state.sortBy = 'relevance';
    if (searchInput) searchInput.value = '';
    if (priceRange) priceRange.value = 500;
    if (priceLabel) priceLabel.innerText = '$500';
    renderCategories();
    renderProducts();
    showToast('Filters reset to default', 'info');
  };
  if (resetBtn) resetBtn.addEventListener('click', resetFn);
  if (emptyResetBtn) emptyResetBtn.addEventListener('click', resetFn);

  // Cart Drawer open/close
  const cartToggleBtn = document.getElementById('btn-cart-toggle');
  const cartBackdrop = document.getElementById('cart-drawer-backdrop');
  const cartCloseBtn = document.getElementById('btn-close-cart');

  if (cartToggleBtn && cartBackdrop) {
    cartToggleBtn.addEventListener('click', () => {
      renderCartDrawer();
      cartBackdrop.classList.remove('hidden');
    });
    cartCloseBtn?.addEventListener('click', () => {
      cartBackdrop.classList.add('hidden');
    });
    cartBackdrop.addEventListener('click', (e) => {
      if (e.target === cartBackdrop) cartBackdrop.classList.add('hidden');
    });
  }

  // Cart Item Qty and Remove delegation
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-qty-plus')) {
      updateCartQuantity(e.target.dataset.id, 1);
    }
    if (e.target.classList.contains('btn-qty-minus')) {
      updateCartQuantity(e.target.dataset.id, -1);
    }
    if (e.target.classList.contains('btn-cart-remove')) {
      removeCartItem(e.target.dataset.id);
    }
  });

  // Add to Cart from Product Grid
  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('.btn-add-to-cart');
    if (addBtn) {
      e.stopPropagation();
      addToCart(addBtn.dataset.id, 1);
    }
  });

  // Wishlist Toggle
  document.addEventListener('click', (e) => {
    const wishBtn = e.target.closest('.btn-toggle-wishlist');
    if (wishBtn) {
      e.stopPropagation();
      const id = wishBtn.dataset.id;
      if (state.wishlist.includes(id)) {
        state.wishlist = state.wishlist.filter(x => x !== id);
        showToast('Removed from wishlist', 'info');
      } else {
        state.wishlist.push(id);
        showToast('Saved to your wishlist', 'success');
      }
      DataStore.saveWishlist(state.wishlist);
      renderProducts();
    }
  });

  // Quick View triggers
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.btn-quickview-trigger');
    if (trigger) {
      openProductQuickView(trigger.dataset.id);
    }
  });
  document.getElementById('btn-close-quickview')?.addEventListener('click', () => {
    document.getElementById('quickview-modal-backdrop').classList.add('hidden');
  });

  // Coupon Application
  document.getElementById('btn-apply-coupon')?.addEventListener('click', () => {
    const code = document.getElementById('cart-coupon-input').value.trim().toUpperCase();
    const coupons = DataStore.get('shopbridge_coupons', []);
    const match = coupons.find(c => c.code === code);
    const msg = document.getElementById('coupon-applied-msg');

    if (match) {
      state.activeCoupon = match;
      renderCartDrawer();
      if (msg) {
        msg.innerText = `Coupon ${match.code} applied: ${match.description}`;
        msg.classList.remove('hidden');
      }
      showToast(`Coupon ${match.code} applied successfully!`, 'success');
    } else {
      showToast('Invalid or expired coupon code. Try: SHOPBRIDGE10', 'error');
    }
  });

  // Checkout flow buttons
  document.getElementById('btn-proceed-checkout')?.addEventListener('click', openCheckoutModal);
  document.getElementById('btn-close-checkout')?.addEventListener('click', () => {
    document.getElementById('checkout-modal-backdrop').classList.add('hidden');
  });

  document.getElementById('btn-step1-next')?.addEventListener('click', () => {
    state.checkoutStep = 2;
    updateCheckoutStepUI();
  });
  document.getElementById('btn-step2-back')?.addEventListener('click', () => {
    state.checkoutStep = 1;
    updateCheckoutStepUI();
  });
  document.getElementById('btn-step2-next')?.addEventListener('click', () => {
    const selectedMethod = document.querySelector('input[name="chk-delivery"]:checked')?.value || '0';
    state.selectedDelivery = parseFloat(selectedMethod);
    state.checkoutStep = 3;
    updateCheckoutStepUI();
    updateCheckoutSummary();
  });
  document.getElementById('btn-step3-back')?.addEventListener('click', () => {
    state.checkoutStep = 2;
    updateCheckoutStepUI();
  });
  document.getElementById('btn-place-order')?.addEventListener('click', placeOrder);

  // Invoice modal actions
  document.getElementById('btn-print-invoice')?.addEventListener('click', () => {
    window.print();
  });
  document.getElementById('btn-track-new-order')?.addEventListener('click', () => {
    document.getElementById('invoice-modal-backdrop').classList.add('hidden');
    openTrackingModal(state.lastCreatedOrderId);
  });

  // Tracking modal close
  document.getElementById('btn-close-tracking')?.addEventListener('click', () => {
    document.getElementById('tracking-modal-backdrop').classList.add('hidden');
  });
  document.getElementById('btn-close-tracking-bottom')?.addEventListener('click', () => {
    document.getElementById('tracking-modal-backdrop').classList.add('hidden');
  });

  // Return / Replacement action
  document.getElementById('btn-return-order')?.addEventListener('click', () => {
    alert('Return request initiated. A pickup agent will verify the parcel within 48 hours.');
    showToast('Return pickup scheduled successfully', 'info');
  });

  // Become a Seller Modal triggers
  const openSellerModal = () => {
    document.getElementById('seller-modal-backdrop').classList.remove('hidden');
  };
  document.getElementById('btn-become-seller')?.addEventListener('click', openSellerModal);
  document.getElementById('btn-hero-sell')?.addEventListener('click', openSellerModal);
  document.getElementById('nav-btn-apply-seller')?.addEventListener('click', openSellerModal);
  document.getElementById('footer-btn-sell')?.addEventListener('click', openSellerModal);
  document.getElementById('btn-close-seller-modal')?.addEventListener('click', () => {
    document.getElementById('seller-modal-backdrop').classList.add('hidden');
  });

  // Seller Onboarding form submission
  document.getElementById('seller-onboarding-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const storeName = document.getElementById('seller-input-name').value;
    const cat = document.getElementById('seller-input-category').value;
    const tax = document.getElementById('seller-input-tax').value;

    const requests = DataStore.getSellerRequests();
    const newReq = {
      id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
      storeName: storeName,
      applicantName: state.user ? state.user.name : 'Udhay Kumar',
      category: cat,
      taxId: tax,
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    };

    requests.unshift(newReq);
    DataStore.saveSellerRequests(requests);
    DataStore.logAction('SELLER_APPLICATION_SUBMITTED', `${storeName} (${cat})`, newReq.applicantName);

    document.getElementById('seller-modal-backdrop').classList.add('hidden');
    showToast('Application submitted! Our admin team reviews stores within 24 hours.', 'success');
    renderAdminPanel();
  });

  // Admin approvals delegation
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-approve-seller')) {
      const reqId = e.target.dataset.id;
      const requests = DataStore.getSellerRequests();
      const target = requests.find(r => r.id === reqId);
      if (target) {
        target.status = 'approved';
        DataStore.saveSellerRequests(requests);
        DataStore.logAction('SELLER_APPROVED', target.storeName, 'Administrator');
        renderAdminPanel();
        showToast(`Store "${target.storeName}" approved and live on ShopBridge!`, 'success');
      }
    }
  });

  // Seller Dashboard: Advance Milestone & Shipping Labels
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-mark-shipped')) {
      const orderId = e.target.dataset.id;
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        order.status = 'shipped';
        order.timeline[1].completed = true;
        order.timeline[1].timestamp = 'Completed';
        order.timeline[2].completed = true;
        order.timeline[2].timestamp = 'Just now';
        DataStore.saveOrders(state.orders);
        renderSellerDashboard();
        showToast(`Order ${orderId} marked as Shipped! Buyer notified via SMS/Email.`, 'success');
      }
    }

    if (e.target.classList.contains('btn-print-shipping-label')) {
      const orderId = e.target.dataset.id;
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        alert(`=== SHOPBRIDGE SHIPPING LABEL ===\nOrder ID: ${order.id}\nCourier: ${order.courier}\nBarcode: |||||| ${order.trackingNumber} ||||||\nRecipient: ${order.shippingAddress.fullName}\nAddress: ${order.shippingAddress.street}, ${order.shippingAddress.city} - ${order.shippingAddress.zip}\n\n[Label sent to thermal printer]`);
      }
    }
  });

  // Seller Central and Admin Menu buttons
  document.getElementById('nav-btn-seller-portal')?.addEventListener('click', () => {
    roleSelect.value = 'seller';
    roleSelect.dispatchEvent(new Event('change'));
  });
  document.getElementById('menu-btn-seller-dash')?.addEventListener('click', () => {
    roleSelect.value = 'seller';
    roleSelect.dispatchEvent(new Event('change'));
  });
  document.getElementById('menu-btn-admin-dash')?.addEventListener('click', () => {
    roleSelect.value = 'admin';
    roleSelect.dispatchEvent(new Event('change'));
  });
  document.getElementById('menu-btn-orders')?.addEventListener('click', () => {
    openTrackingModal(state.orders[0]?.id || 'ORD-89421');
  });

  // 24/7 Chat Drawer toggles
  const chatDrawer = document.getElementById('support-chat-drawer');
  document.getElementById('btn-support-chat-toggle')?.addEventListener('click', () => {
    chatDrawer.classList.toggle('hidden');
  });
  document.getElementById('btn-close-chat')?.addEventListener('click', () => {
    chatDrawer.classList.add('hidden');
  });

  // Chat message send
  const chatInput = document.getElementById('chat-user-input');
  const sendChatBtn = document.getElementById('btn-send-chat');

  const sendMsg = () => {
    const text = chatInput.value;
    chatInput.value = '';
    handleSupportChat(text);
  };

  sendChatBtn?.addEventListener('click', sendMsg);
  chatInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMsg();
  });

  // Chat Quick Buttons
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('chat-quick-btn')) {
      handleSupportChat(e.target.innerText);
    }
  });
}

// Start application once DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
