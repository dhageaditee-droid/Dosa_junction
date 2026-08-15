# 🍛 Dakshin Bhavan - Full-Stack South Indian Food Ordering Website

A complete, modern, responsive South Indian restaurant/hotel food-ordering website and management platform inspired by modern food-ordering user experiences.

---

## 🌟 Key Features

### 1. Customer Website
- **Sticky Responsive Navigation**: Logo, Restaurant Name, Home, Menu, Offers, About, Contact, My Orders, Cart, Login/Profile, hamburger menu & drawer for mobile screens.
- **Hero Section**: "Authentic South Indian Food, Delivered Fresh", subtitle, live search bar ("Search for dosa, idli, vada, coffee..."), "Explore Menu" and "Order Now" CTA buttons.
- **"What's on your mind?"**: Circular category cards (Dosa, Idli, Vada, Uttapam, Meals, Rice, Snacks, Desserts, Beverages, Filter Coffee).
- **Featured Sections**: Popular Dishes, Best Sellers, Recommended For You, Today's Offers, Why Choose Us, Customer Reviews.
- **Food Cards**: Food image, name, short description, Veg/Non-Veg indicator, rating, preparation time, price, discount/bestseller badges, and interactive `ADD` button transforming into `− 1 +` quantity controls directly on the card.
- **Searchable Menu**: Search by food name, category, or description with popular & recent search tags. Multi-filtering (Veg, Non-Veg, Bestseller, Available, Rating 4.0+, Under ₹100, Under ₹200, Price Low/High, Clear Filters).
- **Food Details Modal**: Inspect food image, name, description, rating, price, category, prep time, veg indicator, spice level, quantity selector, add to cart button, and "You May Also Like" recommendation carousel.
- **Shopping Cart & Sticky Mobile Cart**: Persisted in `localStorage`. Shows item breakdown (Item Total, Coupon Discount, Tax 5%, Packing Charge ₹15, Delivery Charge ₹30 or FREE above ₹400, To Pay ₹XXX). Sticky mobile cart bar appears when items exist (`2 Items | ₹350  View Cart →`).
- **Checkout & Order Types**: Form supporting **Home Delivery** (requires address, city, PIN code), **Takeaway**, and **Dine In** (address optional). Supports **Cash on Delivery** and **Pay at Restaurant**. Includes confirmation modal prompt ("Are you sure you want to place this order?").
- **Order Tracking**: Visual status tracking stepper adjusting dynamically by order type:
  - *Home Delivery*: Order Placed → Confirmed → Preparing → Ready → Out for Delivery → Completed
  - *Takeaway / Dine In*: Order Placed → Confirmed → Preparing → Ready → Completed
- **Customer Auth**: Register, Login, JWT tokens, bcrypt hashed passwords, Profile page, My Orders history, and Order Again functionality.
- **About & Contact**: Complete story, traditional recipes, hygiene, fresh ingredients, Google Maps section, WhatsApp, Instagram, Facebook links, and enquiry form storing entries in PostgreSQL.

### 2. Admin Portal (`/admin/login`)
- **Admin Authentication**: Email & password login using bcrypt hashing and JWT protected middleware.
- **Admin Dashboard**: Real-time stats (Today's Orders, Today's Revenue, Pending, Confirmed, Preparing, Completed, Total Customers, Total Menu Items) and recent kitchen orders table.
- **Admin Order Management**: View all orders, search/filter by status, order type, payment status, advance status transitions (`Pending → Confirmed → Preparing → Ready → Out for Delivery → Completed`), cancel orders, and print receipts (`window.print()`).
- **Payment Management**: Admin updates payment status from `PENDING` to `PAID` with record keeping (`paid_amount`, `paid_at`, `payment_method`).
- **Menu Management**: Add, edit, delete food items, toggle availability, mark bestseller, mark featured, set category, spice level, prep time, and upload image URLs.
- **Coupons & Offers Management**: Full CRUD for promotional offers and coupon codes.

---

## 🛠️ Technology Stack

- **Frontend**: React.js (Vite), HTML5, CSS3, JavaScript, React Router DOM, Lucide Icons.
- **Backend**: Node.js, Express.js REST APIs, CORS, Helmet, express-rate-limit, express-validator.
- **Database**: PostgreSQL (`pg` driver, parameterized queries).
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs.
- **Testing**: Jest & Supertest automated integration test suite.

---

## 📋 Prerequisites

1. **Node.js**: v18.0.0 or higher
2. **npm**: v9.0.0 or higher
3. **PostgreSQL**: v14.0 or higher running on `localhost:5432`

---

## 🚀 Setup & Installation Steps

### Step 1: Clone or Navigate to Directory
```bash
cd d:/Users/Aditee/Desktop/Dosa
```

### Step 2: Install Dependencies
Run the master setup command:
```bash
npm run setup
```
*(Or install inside both client and server manually)*:
```bash
cd server && npm install
cd ../client && npm install
```

---

## 🐘 PostgreSQL Database Setup & Migrations

### Step 3: Configure Environment Variables
Create `.env` inside `server/` and project root:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:aditee@localhost:5432/dosabhavan
JWT_SECRET=dakshin_bhavan_super_secret_jwt_key_2026_south_indian_delights
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Step 4: Run Database Migration & Seed Script
This command will create the `dosabhavan` PostgreSQL database (if missing), execute `schema.sql` table migrations, seed South Indian categories/menu/offers/coupons, and create the default admin account:
```bash
npm run db:setup
```

---

## 🔑 Admin Creation & Credentials

Default Admin Account created during `db:setup`:
- **Admin Portal URL**: `http://localhost:5173/admin/login`
- **Email**: `admin@dosajunction.com`
- **Password**: `Admin@123456`

To manually reset or create another admin, run:
```bash
node server/scripts/setupDb.js
```

---

## 📡 Running the Application

### Option A: Run Full Stack Concurrently (Recommended)
From root directory:
```bash
npm run dev
```

### Option B: Run Backend and Frontend Separately

**Backend Server (Port 5000)**:
```bash
npm run server
```

**Frontend React App (Port 5173)**:
```bash
npm run client
```

Open `http://localhost:5173` in your browser.

---

## 🧪 Testing Commands

Execute the automated Jest & Supertest integration suite (covers Auth, Menu, Search, Coupons, COD Orders, Pay-at-Restaurant, Tracking, Admin Status Updates, and Payments):
```bash
npm test
```
Or directly in server directory:
```bash
cd server && npm test
```

---

## 📦 Production Build Command

To build the optimized production bundle for deployment:
```bash
npm run build
```
*(Outputs built client bundle inside `client/dist`)*.

---

## 💳 Phase 2 Architecture Notice

Online payment gateway integration (Razorpay / PhonePe / Cashfree / PayU) is scheduled for Phase 2.
The PostgreSQL schema includes the `payments` table and fields (`payment_method`, `payment_status`, `payment_gateway`, `transaction_id`, `paid_amount`, `paid_at`) to enable Phase 2 gateway integration without database alterations.
