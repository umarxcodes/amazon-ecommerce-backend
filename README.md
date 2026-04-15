# Amazon-Style Ecommerce Backend

[![Node.js Version](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Express](https://img.shields.io/badge/Express-5.x-black)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green)](https://www.mongodb.com/)
[![Tests](https://img.shields.io/badge/Tests-Jest-orange)](https://jestjs.io/)

A production-grade REST API for a full-featured ecommerce platform. Built with Node.js, Express, MongoDB, Redis, Stripe, and Cloudinary — this backend handles authentication, product catalogs, shopping carts, order management, payment processing, and administrative user management out of the box.

Designed for developers who need a solid, scalable foundation for building ecommerce applications without starting from scratch.

## 🌐 Live Demo

- **API Base URL:** `http://localhost:5000/api`
- **Health Check:** `GET http://localhost:5000/`
- **Deployed:** https://amazon-ecommerce-backend.vercel.app

## ✨ Features

### 🔐 Authentication & Authorization

- User registration with email, password, and name
- JWT-based login with configurable token expiry
- Role-based access control (`USER` / `ADMIN`)
- Account deactivation and soft-delete support
- Active-user enforcement at middleware level

### 🛍️ Product Catalog

- CRUD operations with admin-only write access
- Full-text search with regex-based name/description matching
- Filtering by category, price range, and minimum rating
- Pagination with configurable page size (max 100)
- Sorting by price, creation date, or ratings
- Redis-backed cache invalidation on product mutations
- Cloudinary image uploads (up to 5 images per product)

### 🛒 Shopping Cart

- Per-user cart with one-to-one relationship
- Real-time stock validation on add and update
- Price snapshots at time of adding (immune to price changes)
- Redis cache for fast cart retrieval
- Increment, decrement, remove, and clear operations

### 📦 Orders

- Atomic order creation from cart via MongoDB transactions
- Stock deduction at order time with rollback on cancellation
- Order history per user
- Ownership and admin-based access control
- 30-minute TTL for unpaid orders
- Order cancellation with automatic stock restoration

### 💳 Payments

- Stripe Checkout session creation
- Webhook-based payment confirmation with idempotency guard
- Per-order payment tracking with result metadata
- Checkout rate limiting per user and IP

### 👤 Admin Management

- Admin-only user creation via protected endpoint
- View all users with full details
- Role promotion/demotion (`USER` ↔ `ADMIN`)
- User deactivation (blocks login and API access)
- Self-protection: admins cannot change their own role

### 🛡️ Security

- Password hashing with bcrypt (12 rounds)
- Helmet security headers
- CORS origin allow-list
- Redis-backed sliding-window rate limiting (per-IP, per-email, per-user)
- Input validation with Yup (body sanitization, unknown field stripping)
- File upload restrictions (MIME type, 2MB size limit)
- JWT token expiry and active-user enforcement

## 🧱 Tech Stack

| Category       | Technology                         |
| -------------- | ---------------------------------- |
| **Runtime**    | Node.js 18+ (ES Modules)           |
| **Framework**  | Express 5                          |
| **Database**   | MongoDB 7 with Mongoose 9          |
| **Cache**      | Upstash Redis (REST API)           |
| **Auth**       | JWT (jsonwebtoken) + bcrypt        |
| **Validation** | Yup                                |
| **Payments**   | Stripe Checkout + Webhooks         |
| **Storage**    | Cloudinary (product images)        |
| **Uploads**    | Multer + multer-storage-cloudinary |
| **Testing**    | Jest + Supertest                   |
| **Security**   | Helmet, CORS, custom rate limiter  |
| **Deployment** | Vercel (serverless)                |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser/Mobile)               │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP Request
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     Vercel Edge / Load Balancer              │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    api/index.js (Serverless)                  │
│                    └─ or ─ server.js (Local)                 │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                         app.js                               │
│  ┌──────────┐ ┌────────┐ ┌──────────┐ ┌───────────────────┐ │
│  │ Security │ │  CORS  │ │RateLimit │ │  Webhook (raw)    │ │
│  │ (Helmet) │ │        │ │ (DDoS)   │ │  Stripe           │ │
│  └──────────┘ └────────┘ └──────────┘ └───────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              JSON Body Parser (1MB limit)               ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌────────┐ ┌──────────┐ ┌────────┐ ┌────────┐ ┌─────────┐ │
│  │ /auth  │ │/products │ │/admin  │ │ /cart  │ │/orders  │ │
│  │        │ │          │ │        │ │        │ │/payment │ │
│  └───┬────┘ └────┬─────┘ └───┬────┘ └───┬────┘ └────┬────┘ │
└──────┼───────────┼───────────┼──────────┼────────────┼──────┘
       │           │           │          │            │
       ▼           ▼           ▼          ▼            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Routes → Controllers → Services            │
│                              │                               │
│              ┌───────────────┼───────────────┐               │
│              ▼               ▼               ▼               │
│        Mongoose Models   Redis Cache   Stripe API            │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
amazon-ecommerce-backend/
├── api/                     # Vercel serverless entry point
├── config/                  # Database, Redis, Cloudinary, env configuration
├── controllers/             # HTTP layer — parse requests, call services, send responses
├── middleware/              # Auth, admin check, validation, security, rate limiting, error handler
├── models/                  # Mongoose schemas (User, Product, Cart, Order)
├── routes/                  # Express route declarations with middleware chains
├── services/                # Business logic — DB operations, caching, Stripe integration
├── utils/                   # Shared utilities — AppError, async handler, hashing, JWT
├── validations/             # Yup validation schemas for request bodies
├── webhooks/                # Stripe webhook handler with signature verification
├── app.js                   # Express app composition and middleware registration
├── server.js                # Local development/production server entry point
├── vercel.json              # Vercel deployment routing configuration
└── package.json             # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

| Requirement | Version             |
| ----------- | ------------------- |
| Node.js     | 18+                 |
| npm / yarn  | Latest              |
| MongoDB     | 5+ (local or Atlas) |

### 1. Clone the Repository

```bash
git clone https://github.com/muhammadumar-codes/amazon-ecommerce-backend.git
cd amazon-ecommerce-backend
```

### 2. Install Dependencies

```bash
# With yarn (recommended)
yarn install

# Or with npm
npm install
```

### 3. Set Up Environment Variables

Copy the example below into a `.env` file:

```env
# ─── Application ───
NODE_ENV=development
PORT=5000
TRUST_PROXY=1

# ─── Database ───
MONGO_URI=mongodb://127.0.0.1:27017/amazon-backend

# ─── JWT ───
JWT_SECRET=replace-with-a-strong-random-secret
JWT_EXPIRES_IN=1h

# ─── CORS ───
CLIENT_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000

# ─── Stripe ───
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# ─── Cloudinary ───
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ─── Redis (Upstash) — Optional ───
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
# DISABLE_REDIS=true   # Uncomment to bypass Redis locally
```

## 📋 Environment Variables

### Application

| Variable      | Required | Description                      | Example       |
| ------------- | -------- | -------------------------------- | ------------- |
| `NODE_ENV`    | No       | Runtime environment              | `development` |
| `PORT`        | No       | HTTP server port (default: 5000) | `5000`        |
| `TRUST_PROXY` | No       | Express trust proxy setting      | `1`           |

### Database

| Variable    | Required | Description               | Example                                    |
| ----------- | -------- | ------------------------- | ------------------------------------------ |
| `MONGO_URI` | **Yes**  | MongoDB connection string | `mongodb://127.0.0.1:27017/amazon-backend` |

### JWT

| Variable         | Required | Description               | Example                  |
| ---------------- | -------- | ------------------------- | ------------------------ |
| `JWT_SECRET`     | **Yes**  | Secret for signing tokens | `random-string-32-chars` |
| `JWT_EXPIRES_IN` | No       | Token expiry duration     | `1h`                     |

### CORS

| Variable       | Required | Description                       | Example                 |
| -------------- | -------- | --------------------------------- | ----------------------- |
| `CLIENT_URL`   | Yes\*    | Frontend URL for Stripe redirects | `http://localhost:3000` |
| `CORS_ORIGINS` | No       | Comma-separated allowed origins   | `http://localhost:3000` |

### Stripe

| Variable                | Required | Description                   | Example       |
| ----------------------- | -------- | ----------------------------- | ------------- |
| `STRIPE_SECRET_KEY`     | Yes\*    | Stripe API secret key         | `sk_test_xxx` |
| `STRIPE_WEBHOOK_SECRET` | Yes\*    | Stripe webhook signing secret | `whsec_xxx`   |

### Cloudinary

| Variable                | Required | Description           | Example    |
| ----------------------- | -------- | --------------------- | ---------- |
| `CLOUDINARY_CLOUD_NAME` | Yes\*    | Cloudinary cloud name | `mycloud`  |
| `CLOUDINARY_API_KEY`    | Yes\*    | Cloudinary API key    | `12345678` |
| `CLOUDINARY_API_SECRET` | Yes\*    | Cloudinary API secret | `abcdefg`  |

### Redis (Upstash)

| Variable                   | Required | Description                  | Example                  |
| -------------------------- | -------- | ---------------------------- | ------------------------ |
| `UPSTASH_REDIS_REST_URL`   | No       | Upstash Redis REST endpoint  | `https://xxx.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | No       | Upstash authentication token | `your-token`             |
| `DISABLE_REDIS`            | No       | Set to `true` to skip Redis  | `true`                   |

_\* Required for the respective feature to function. The app starts without them but the feature will be unavailable._

## ▶️ Running the Project

### Development Mode

```bash
yarn dev
# or
npm run dev
```

Server starts with hot-reload via nodemon on `http://localhost:5000`.

### Production Mode

```bash
yarn start
# or
npm start
```

### Health Checks

```bash
# Root health check
curl http://localhost:5000/
# Response: {"success":true,"message":"API is running"}

# Direct API check
curl http://localhost:5000/api
# Response: 404 (no routes registered at /api directly)
```

## 📡 API Reference

**Base URL:** `http://localhost:5000/api`

**Authentication Header:**

```http
Authorization: Bearer <access-token>
```

### Auth

#### `POST /api/auth/register`

Create a new user account.

| Detail         | Value           |
| -------------- | --------------- |
| **Auth**       | No              |
| **Rate Limit** | 20 req / 15 min |

**Request Body:**

```json
{
  "name": "Muhammad Umar",
  "email": "umar@example.com",
  "password": "SecurePass123"
}
```

**Success — 201:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "6610d9bc1d9cb39ef0f09521",
    "name": "Muhammad Umar",
    "email": "umar@example.com",
    "role": "USER"
  }
}
```

**Errors:** `400` (validation), `409` (email exists)

---

#### `POST /api/auth/login`

Authenticate and receive an access token.

| Detail         | Value          |
| -------------- | -------------- |
| **Auth**       | No             |
| **Rate Limit** | 5 req / 15 min |

**Request Body:**

```json
{
  "email": "umar@example.com",
  "password": "SecurePass123"
}
```

**Success — 200:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "6610d9bc1d9cb39ef0f09521",
      "name": "Muhammad Umar",
      "email": "umar@example.com",
      "role": "USER"
    }
  }
}
```

**Errors:** `400` (validation), `401` (invalid credentials)

---

### Products

#### `GET /api/products`

List products with filtering, sorting, and pagination.

| Detail         | Value                 |
| -------------- | --------------------- |
| **Auth**       | No                    |
| **Rate Limit** | 90 req / min (global) |

**Query Parameters:**

| Param      | Type   | Description                            |
| ---------- | ------ | -------------------------------------- |
| `search`   | string | Search name and description            |
| `category` | string | Filter by category                     |
| `minPrice` | number | Minimum price                          |
| `maxPrice` | number | Maximum price                          |
| `rating`   | number | Minimum rating                         |
| `sort`     | string | Sort field (`-` for desc)              |
| `page`     | number | Page number (default: 1)               |
| `limit`    | number | Items per page (default: 10, max: 100) |

**Success — 200:**

```json
{
  "success": true,
  "total": 42,
  "page": 1,
  "pages": 4,
  "results": 12,
  "products": []
}
```

---

#### `GET /api/products/:id`

Get a single product by ID.

| Detail   | Value |
| -------- | ----- |
| **Auth** | No    |

**Errors:** `400` (invalid ID), `404` (not found)

---

#### `POST /api/products`

Create a product with images.

| Detail           | Value                 |
| ---------------- | --------------------- |
| **Auth**         | Admin only            |
| **Content-Type** | `multipart/form-data` |

**Fields:** `name`, `description`, `price`, `category`, `stock`, `image` (up to 5 files)

**Success — 201**

**Errors:** `401` (no token), `403` (not admin), `400` (validation)

---

#### `PUT /api/products/:id`

Update a product, optionally replacing images.

| Detail   | Value      |
| -------- | ---------- |
| **Auth** | Admin only |

**Errors:** `400` (validation/invalid ID), `403` (not admin), `404` (not found)

---

#### `DELETE /api/products/:id`

Delete a product.

| Detail   | Value      |
| -------- | ---------- |
| **Auth** | Admin only |

**Success:**

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

### Cart

All cart routes require authentication.

#### `POST /api/cart`

Add a product to the cart.

| Detail   | Value |
| -------- | ----- |
| **Auth** | Yes   |

**Request Body:**

```json
{
  "productId": "6610db311d9cb39ef0f09534",
  "quantity": 2
}
```

**Success — 201**

**Errors:** `400` (invalid quantity/product ID), `404` (product not found)

---

#### `GET /api/cart`

Get the current user's cart.

| Detail   | Value |
| -------- | ----- |
| **Auth** | Yes   |

---

#### `PUT /api/cart/:productId`

Update a cart item's quantity.

| Detail   | Value |
| -------- | ----- |
| **Auth** | Yes   |

**Request Body:**

```json
{
  "quantity": 3
}
```

---

#### `DELETE /api/cart/:productId`

Remove an item from the cart.

| Detail   | Value |
| -------- | ----- |
| **Auth** | Yes   |

---

#### `DELETE /api/cart/clear`

Clear all items from the cart.

| Detail   | Value |
| -------- | ----- |
| **Auth** | Yes   |

**Success:**

```json
{
  "success": true,
  "message": "Cart cleared successfully",
  "cart": {
    "items": [],
    "totalPrice": 0
  }
}
```

---

### Orders

All order routes require authentication.

#### `POST /api/orders`

Create an order from the current cart.

| Detail   | Value |
| -------- | ----- |
| **Auth** | Yes   |

**Request Body:**

```json
{
  "shippingAddress": {
    "address": "221B Baker Street",
    "city": "London",
    "postalCode": "NW16XE",
    "country": "UK"
  }
}
```

**Success — 201**

**Errors:** `400` (empty cart, insufficient stock, validation)

---

#### `GET /api/orders/my`

Get the current user's order history.

| Detail   | Value |
| -------- | ----- |
| **Auth** | Yes   |

---

#### `GET /api/orders/:id`

Get a single order (owner or admin only).

| Detail   | Value |
| -------- | ----- |
| **Auth** | Yes   |

**Errors:** `400` (invalid ID), `403` (forbidden), `404` (not found)

---

#### `POST /api/orders/:id/cancel`

Cancel an unpaid pending order and restore stock.

| Detail   | Value |
| -------- | ----- |
| **Auth** | Yes   |

---

### Payments

#### `POST /api/payment/checkout`

Create a Stripe Checkout session for an unpaid order.

| Detail         | Value           |
| -------------- | --------------- |
| **Auth**       | Yes             |
| **Rate Limit** | 10 req / 10 min |

**Request Body:**

```json
{
  "orderId": "6610ddf81d9cb39ef0f0958f"
}
```

**Success — 200:**

```json
{
  "success": true,
  "sessionId": "cs_test_a1b2c3d4",
  "url": "https://checkout.stripe.com/c/pay/cs_test_a1b2c3d4"
}
```

**Errors:** `400` (invalid ID, already paid, no items, cancelled, expired), `403` (forbidden), `404` (not found), `500` (Stripe misconfigured)

---

#### `POST /api/payment/webhook/stripe`

Stripe webhook endpoint for payment confirmation.

| Detail   | Value                 |
| -------- | --------------------- |
| **Auth** | Stripe signature only |

**Note:** Expects raw request body. Must be publicly reachable in production.

---

### Admin

All admin routes require `ADMIN` role.

#### `POST /api/admin/create-admin`

Create an admin user.

| Detail         | Value          |
| -------------- | -------------- |
| **Auth**       | Admin only     |
| **Rate Limit** | 50 req / 5 min |

---

#### `GET /api/admin/users`

List all users.

| Detail   | Value      |
| -------- | ---------- |
| **Auth** | Admin only |

---

#### `PATCH /api/admin/users/:id/role`

Change a user's role.

| Detail   | Value      |
| -------- | ---------- |
| **Auth** | Admin only |

**Request Body:**

```json
{
  "role": "ADMIN"
}
```

**Errors:** `400` (self-change attempt, invalid role), `404` (user not found)

---

#### `PATCH /api/admin/users/:id/deactivate`

Deactivate a user account.

| Detail   | Value      |
| -------- | ---------- |
| **Auth** | Admin only |

**Errors:** `400` (already inactive), `404` (user not found)

---

## 🔑 Authentication Flow

1. **Register** — `POST /api/auth/register` creates a user account.
2. **Login** — `POST /api/auth/login` returns an `accessToken` (JWT).
3. **Attach Token** — Include in every protected request:
   ```http
   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
   ```
4. **Verification** — The `authMiddleware` verifies the token, checks the user is active, and attaches `{ userId, role }` to `req.user`.
5. **Expiry** — Tokens expire after the configured `JWT_EXPIRES_IN` (default: 1 hour). On expiry, the user must log in again.

---

## ⚠️ Error Handling

All errors follow a consistent response shape:

```json
{
  "success": false,
  "message": "Validation failed",
  "statusCode": 400,
  "details": ["email must be a valid email"],
  "stack": null
}
```

- `stack` is only included in `development` mode.
- `details` is an array when available (validation errors) or `null`.

### Common Error Codes

| Code | Meaning                        |
| ---- | ------------------------------ |
| 400  | Bad request / validation error |
| 401  | Not authenticated              |
| 403  | Not authorized                 |
| 404  | Resource not found             |
| 409  | Conflict (duplicate email)     |
| 429  | Rate limit exceeded            |
| 500  | Internal server error          |
| 503  | Service unavailable            |

---

## 🧪 Testing

```bash
# Run all tests
yarn test

# Or with npm
npm test
```

### What's Covered

- Auth service unit tests
- Route-level API tests for all resources
- Status code verification
- Validation error handling
- Authentication and authorization checks

### Coverage Report

```bash
yarn test --coverage
```

---

## 🚢 Deployment

### Vercel Deployment

1. **Push to GitHub:**

   ```bash
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set environment variables (see below)
   - Deploy

3. **Vercel Config:**
   - `vercel.json` routes all requests to `api/index.js`
   - MongoDB connection is cached across serverless invocations

### Required Production Environment Variables

| Variable                   | Why Needed                     |
| -------------------------- | ------------------------------ |
| `NODE_ENV`                 | Set to `production`            |
| `MONGO_URI`                | Database connection            |
| `JWT_SECRET`               | Token signing                  |
| `CLIENT_URL`               | Stripe redirect URLs           |
| `CORS_ORIGINS`             | Allowed frontend origins       |
| `STRIPE_SECRET_KEY`        | Payment processing             |
| `STRIPE_WEBHOOK_SECRET`    | Webhook signature verification |
| `CLOUDINARY_CLOUD_NAME`    | Image uploads                  |
| `CLOUDINARY_API_KEY`       | Image uploads                  |
| `CLOUDINARY_API_SECRET`    | Image uploads                  |
| `UPSTASH_REDIS_REST_URL`   | Caching and rate limiting      |
| `UPSTASH_REDIS_REST_TOKEN` | Caching and rate limiting      |

### Deployment Checklist

- [ ] MongoDB Atlas cluster provisioned and whitelisted
- [ ] Strong `JWT_SECRET` generated (use `openssl rand -base64 32`)
- [ ] Stripe live keys configured
- [ ] Stripe webhook endpoint registered and URL set in Stripe dashboard
- [ ] Cloudinary production credentials configured
- [ ] CORS origins set to production frontend URL(s)
- [ ] Redis provisioned on Upstash (or `DISABLE_REDIS=true` set)
- [ ] HTTPS enabled on all endpoints
- [ ] Health check endpoint verified (`GET /`)
- [ ] Webhook reachability confirmed (test with Stripe CLI)

---

## ⚠️ Known Limitations

| Limitation                                      | Impact                                        | Planned Fix                       |
| ----------------------------------------------- | --------------------------------------------- | --------------------------------- |
| Stock is deducted at order time, before payment | Abandoned orders reduce available stock       | Add cron job to expire old orders |
| No refresh token mechanism                      | Users must re-login after token expiry        | Implement refresh token flow      |
| No token revocation                             | Stolen tokens are valid until expiry          | Add token blocklist in Redis      |
| Product endpoints return `{ product }` key      | Inconsistent with other endpoints' `{ data }` | Standardize response shape        |
| Populate inside MongoDB transactions            | May not fully work in all MongoDB versions    | Use manual population             |
| No structured logging                           | Console logs are hard to query in production  | Integrate Pino or Winston         |
| No OpenAPI/Swagger documentation                | Manual API exploration required               | Add swagger-ui-express            |

---

## 🗺️ Roadmap

| Feature                          | Priority | Status     |
| -------------------------------- | -------- | ---------- |
| Repository layer for DB access   | High     | 📋 Planned |
| Refresh token + token revocation | High     | 📋 Planned |
| Integration tests with real DB   | High     | 📋 Planned |
| Stripe webhook idempotency       | High     | ✅ Done    |
| Structured logging (Pino)        | Medium   | 📋 Planned |
| OpenAPI/Swagger documentation    | Medium   | 📋 Planned |
| Audit log for admin actions      | Medium   | 📋 Planned |
| Product reviews and ratings      | Medium   | 📋 Planned |
| Order shipping workflow          | Low      | 📋 Planned |
| Wishlist feature                 | Low      | 📋 Planned |
| Email notifications              | Low      | 📋 Planned |
| GraphQL API layer                | Low      | 📋 Planned |

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/add-wishlist
   ```
3. **Make your changes** and ensure tests pass:
   ```bash
   yarn test
   ```
4. **Commit** with clear, descriptive messages:
   ```bash
   git commit -m "feat: add wishlist CRUD endpoints"
   ```
5. **Push** and **open a Pull Request**:
   ```bash
   git push origin feature/add-wishlist
   ```

### Guidelines

- Follow the existing folder structure and naming conventions
- Write tests for new features
- Keep functions focused (single responsibility)
- Document new environment variables
- Update the README if you add or change endpoints

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👤 Author

**Muhammad Umar**

- GitHub: [@muhammadumar-codes](https://github.com/muhammadumar-codes)
- LinkedIn: [Muhammad Umar](https://www.linkedin.com/in/muhammad-umar-codes/)

---

<p align="center">If this project helped you, consider giving it a ⭐ on GitHub!</p>
