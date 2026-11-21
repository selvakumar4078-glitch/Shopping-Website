# ShopBridge – E-Commerce Marketplace
> **Tagline:** Buy. Sell. Grow Together.  
> **Specification Standard:** SRS v1.0 (IEEE 830 / ISO/IEC/IEEE 29148)

---

## 🚀 Overview

**ShopBridge** is a modern, responsive, multi-vendor e-commerce marketplace built from scratch to connect shoppers (buyers) with independent sellers, alongside dedicated administrator and customer support interfaces.

The frontend is faithfully designed to match the uploaded UI mockup:
- **Header & Navigation:** Brand logo with speed cart icon, dropdown menus for *Shop*, *Sell*, and *Categories*, live search with autocomplete suggestions, profile management, red-badged cart drawer counter, and the prominent **"Become a Seller"** pill button.
- **Hero Section:** Responsive split hero with floating glassmorphic cards:
  - *Shopper (Left):* Happy shopper holding a phone, floating 5-star headphone card, and "For Users" pill (*"Discover amazing products, enjoy a seamless shopping experience."*).
  - *Center:* Speed-cart icon, bold **ShopBridge** branding, tagline **"Buy. Sell. Grow Together."**, and dual CTAs: **Start Shopping →** and **Start Selling →**.
  - *Seller (Right):* Aproned seller with laptop and package cartons, floating monthly growth analytics badge (+148% sales), and "For Sellers" pill (*"List your products, reach more customers, and grow your business."*).
- **Trust Bar:** 4 feature cards: *Secure Payments*, *Fast & Reliable Delivery*, *24/7 Support*, and *Trusted Marketplace*.
- **How It Works:** 3-step numbered pathway: *1. For Users* → *2. For Sellers* → *3. Grow Together*.

---

## 📋 SRS v1.0 Feature Compliance Matrix

| SRS ID | Requirement | Implementation Status & Description |
| :--- | :--- | :--- |
| **FR-1 - FR-5** | **Account & Authentication** | User profile, multi-role switcher (Shopper, Seller, Admin, Support Agent), address management, and "Become a Seller" multi-step onboarding wizard. |
| **FR-6 - FR-10** | **Product Discovery** | Filterable catalog by categories, keyword search with live instant suggestions, price range slider ($20 - $500), rating filters (4★+), sorting (Relevance, Price, Rating), and Quick View modal with multi-image gallery. |
| **FR-11 - FR-13** | **Cart & Wishlist** | Persistent slide-over cart drawer with real-time count badge, qty increment/decrement (+/-), item removal, free shipping progress bar, promo coupon codes (`SHOPBRIDGE10`, `WELCOME20`, `FREESHIP`), and wishlist toggle. |
| **FR-14 - FR-19** | **Checkout & Payments** | Multi-step secure checkout wizard (Shipping Address → Delivery Speed [Standard Free / Express $9.99] → PCI-DSS payment methods [Credit/Debit Card, UPI Instant Pay, Cash on Delivery] → Order Summary). Instant tax invoice generation with printable format. |
| **FR-20 - FR-23** | **Order Management & Delivery** | Interactive real-time delivery tracking timeline with courier checkpoints (Order Placed → Packed → Shipped → Out for Delivery → Delivered), live courier telemetry, and Return / Replacement requests. |
| **FR-24 - FR-25** | **Reviews & Ratings** | Star ratings (1-5★), verified buyer review badges, customer reviews feed, and interactive "Write a Review" form with real-time score recalculation. |
| **FR-26 - FR-32** | **Seller Features & Dashboard** | Dedicated Seller Central portal with KPI metrics (Revenue, Orders, Active SKUs, Pending Payouts), product management table, milestone advancement, bulk CSV upload simulation, and thermal shipping label generator. |
| **FR-33 - FR-34** | **Customer Support** | 24/7 Floating Support Chat widget with conversational bot for tracking and returns, knowledge base FAQ accordion, and support ticket management. |
| **FR-35 - FR-39** | **Administration** | Operator dashboard with Gross Merchandise Value (GMV), pending seller onboarding approvals, commission rate editor (6-10%), and immutable audit logging. |

---

## 🛠️ How to Run

### Method 1: Double-Click Batch File (Windows)
Double-click `start-server.bat` in the project root. This launches the local HTTP server and automatically opens your default browser at:
```
http://localhost:8080/
```

### Method 2: PowerShell
Run the following in PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```

### Method 3: Direct Browser Preview
You can also directly double-click or open `index.html` in Google Chrome, Microsoft Edge, Mozilla Firefox, or Apple Safari. All styles, fonts, assets, and persistent LocalStorage functionality work out-of-the-box.

---

## 📂 Project Structure

```
e commerce web/
│
├── index.html            # Main semantic HTML5 single-page application
├── styles.css            # Custom CSS styles, glassmorphism, floating animations, print stylesheet
├── data.js               # Seed database, categories, products, orders, LocalStorage engine
├── app.js                # Full reactive application logic, cart, checkout, tracking, portals
├── server.ps1            # Native PowerShell HTTP server with MIME types
├── start-server.bat      # 1-click Windows starter batch script
├── README.md             # Complete technical & functional documentation
└── assets/
    ├── hero_reference.jpg# Uploaded reference mockup design
    ├── hero_woman.png    # Cropped left-hero shopper model
    ├── hero_seller.png   # Cropped right-hero entrepreneur seller model
    └── hero_banner.jpg   # Full high-res banner asset
```
