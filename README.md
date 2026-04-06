# Amazon-Style Ecommerce Backend

Production-oriented ecommerce backend built with Node.js, Express, MongoDB, Upstash Redis, Stripe, and Cloudinary. The API supports authentication, catalog management, cart workflows, order creation, checkout, and administrative user management.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [API Conventions](#api-conventions)
- [Authentication and Authorization](#authentication-and-authorization)
- [API Reference](#api-reference)
- [Error Handling](#error-handling)
- [Security Notes](#security-notes)
- [Testing](#testing)
- [Deployment](#deployment)
- [Known Limitations](#known-limitations)
- [Future Improvements](#future-improvements)

## Overview

This project is organized as a modular Express backend with separate route, controller, service, validation, middleware, and model layers.

Core capabilities:

- User registration and login with JWT access tokens
- Admin-only product and user-management endpoints
- Product listing with filtering, sorting, pagination, and cache invalidation
- Per-user cart system with stock checks
- Order creation from cart contents
- Stripe Checkout integration with webhook-based payment updates
- Redis-backed rate limiting and cache support
- Cloudinary-backed product image uploads

## Features

### Authentication

- Register user
- Login user
- Create admin user from protected admin flow
- Block inactive users at auth middleware level

### Product Catalog

- Public product listing
- Product detail endpoint
- Search, price filters, category filter, rating filter
- Pagination and sort options
- Admin create, update, and delete endpoints

### Cart

- Add item
- Get cart
- Update quantity
- Remove single item
- Clear cart

### Orders and Payments

- Create order from cart
- Fetch current user orders
- Fetch single order with ownership/admin checks
- Create Stripe Checkout session for unpaid orders
- Handle Stripe webhook updates

### Admin

- Create admin
- Get all users
- Change user role
- Deactivate user

## Tech Stack

### Backend

- Node.js
- Express 5
- ES Modules

### Database and Storage

- MongoDB
- Mongoose
- Upstash Redis
- Cloudinary

### Security and Validation

- JSON Web Tokens
- bcrypt
- helmet
- Yup

### Payments and Tooling

- Stripe
- Multer
- Jest
- Supertest

## Architecture

Current request flow:

```text
Route -> Middleware -> Controller -> Service -> Mongoose Model
```

This is clean enough for a small-to-medium backend, but it is not a strict clean architecture yet because controllers and services still depend directly on Mongoose models instead of repositories.

## Project Structure

```text
amazon-ecommerce-backend/
├── api/                # Vercel serverless entrypoint
├── config/             # Env loading and third-party service config
├── controllers/        # HTTP orchestration layer
├── middleware/         # Auth, admin, validation, security, rate limiting, errors
├── models/             # Mongoose schemas
├── routes/             # API route declarations
├── services/           # Business logic
├── tests/              # Unit and route-level API tests
├── utils/              # Shared utilities
├── validations/        # Yup schemas
├── webhooks/           # Stripe webhook handler
├── app.js              # Express app composition
├── server.js           # Local runtime entrypoint
└── vercel.json         # Vercel routing config
```

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/muhammadumar-codes/amazon-ecommerce-backend.git
cd amazon-ecommerce-backend
```

### 2. Install Dependencies

Using Yarn:

```bash
yarn install
```

Using npm:

```bash
npm install
```

### 3. Create a `.env` File

```env
NODE_ENV=development
PORT=5000
TRUST_PROXY=1

MONGO_URI=mongodb://127.0.0.1:27017/amazon-backend
JWT_SECRET=replace-with-a-strong-secret
JWT_EXPIRES_IN=1h

CLIENT_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000

STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

UPSTASH_REDIS_REST_URL=https://your-upstash-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token
```

## Environment Variables

### Required for Application Startup

- `MONGO_URI`
- `JWT_SECRET`

### Required for Stripe Checkout

- `CLIENT_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

### Required for Cloudinary Uploads

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Optional but Recommended

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `JWT_EXPIRES_IN`
- `CORS_ORIGINS`
- `TRUST_PROXY`
- `DISABLE_REDIS=true` for local runs where Redis should be bypassed

## Running the Project

Development:

```bash
yarn dev
```

Production:

```bash
yarn start
```

Health checks:

```bash
curl http://localhost:5000/
curl http://localhost:5000/healthz
```

Expected root response:

```json
{
  "success": true,
  "message": "API is running"
}
```

## API Conventions

Base URL:

```text
http://localhost:5000/api
```

Authentication header for protected routes:

```http
Authorization: Bearer <access-token>
```

Success responses generally follow:

```json
{
  "success": true,
  "message": "Optional message",
  "data": {}
}
```

Some endpoints return domain keys such as `product`, `cart`, `order`, or `products` instead of a top-level `data` field. This is an existing project convention.

## Authentication and Authorization

### JWT Flow

1. User registers or logs in.
2. Login returns a signed access token.
3. Client sends the token as `Authorization: Bearer <token>`.
4. `auth.middleware.js` verifies the token and loads the active user.
5. `admin.middleware.js` restricts admin-only routes.

### Roles

- `USER`
- `ADMIN`

### Protected Areas

- Cart routes: authenticated users
- Order routes: authenticated users
- Checkout route: authenticated users with order ownership or admin role
- Admin routes: `ADMIN` only
- Product write routes: `ADMIN` only

## API Reference

### Auth APIs

#### `POST /api/auth/register`

Create a standard user account.

Auth: No

Request:

```json
{
  "name": "Muhammad Umar",
  "email": "umar@example.com",
  "password": "SecurePass123"
}
```

Success: `201 Created`

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

Common errors:

- `400` validation failure
- `409` email already exists

#### `POST /api/auth/login`

Authenticate a user and return an access token.

Auth: No

Request:

```json
{
  "email": "umar@example.com",
  "password": "SecurePass123"
}
```

Success: `200 OK`

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "<jwt-token>",
    "user": {
      "id": "6610d9bc1d9cb39ef0f09521",
      "name": "Muhammad Umar",
      "email": "umar@example.com",
      "role": "USER"
    }
  }
}
```

Common errors:

- `400` validation failure
- `401` invalid credentials

#### `POST /api/auth/admin-create`

Create a new admin account from the auth namespace.

Auth: `ADMIN`

Request:

```json
{
  "name": "Ops Admin",
  "email": "ops-admin@example.com",
  "password": "StrongAdminPass123"
}
```

Success: `201 Created`

Common errors:

- `401` missing or invalid token
- `403` non-admin caller
- `409` email already exists

### Product APIs

#### `GET /api/products`

Return paginated products with filtering and sorting support.

Auth: No

Query params:

- `search`
- `category`
- `minPrice`
- `maxPrice`
- `rating`
- `sort`
- `page`
- `limit`

Example:

```http
GET /api/products?search=iphone&category=electronics&minPrice=100&maxPrice=2500&sort=-createdAt&page=1&limit=12
```

Success: `200 OK`

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

#### `GET /api/products/:id`

Return a single product by MongoDB ObjectId.

Auth: No

Common errors:

- `400` invalid ID
- `404` product not found

#### `POST /api/products`

Create a product with multipart form-data.

Auth: `ADMIN`

Content-Type:

```text
multipart/form-data
```

Fields:

- `name`
- `description`
- `price`
- `category`
- `stock`
- `image` up to 5 files

Success: `201 Created`

#### `PUT /api/products/:id`

Update a product and optionally replace images.

Auth: `ADMIN`

Common errors:

- `400` invalid payload
- `400` invalid product ID
- `404` product not found

#### `DELETE /api/products/:id`

Delete a product.

Auth: `ADMIN`

Success:

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

### Cart APIs

All cart routes require a bearer token.

#### `POST /api/cart`

Add a product to the authenticated user's cart.

Request:

```json
{
  "productId": "6610db311d9cb39ef0f09534",
  "quantity": 2
}
```

Common errors:

- `400` invalid quantity
- `400` invalid product ID
- `404` product not found

#### `GET /api/cart`

Return the authenticated user's cart.

#### `PUT /api/cart/:productId`

Update quantity for a single cart item.

Request:

```json
{
  "quantity": 3
}
```

#### `DELETE /api/cart/:productId`

Remove one item from the cart.

#### `DELETE /api/cart`

Clear the entire cart.

Success:

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

### Order APIs

All order routes require a bearer token.

#### `POST /api/orders`

Create an order from the authenticated user's cart.

Request:

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

Success: `201 Created`

Common errors:

- `400` validation failure
- `400` cart is empty
- `400` insufficient stock

#### `GET /api/orders/my`

Return the current user's order history.

#### `GET /api/orders/:id`

Return a single order if the requester is the owner or an admin.

Common errors:

- `400` invalid order ID
- `403` forbidden
- `404` order not found

### Payment APIs

#### `POST /api/payment/checkout`

Create a Stripe Checkout session for an unpaid order.

Auth: Yes

Request:

```json
{
  "orderId": "6610ddf81d9cb39ef0f0958f"
}
```

Success:

```json
{
  "success": true,
  "sessionId": "cs_test_a1b2c3d4",
  "url": "https://checkout.stripe.com/c/pay/cs_test_a1b2c3d4"
}
```

Common errors:

- `400` invalid order ID
- `400` order already paid
- `400` order has no items
- `403` forbidden
- `404` order not found
- `500` Stripe misconfiguration

#### `POST /api/payment/webhook/stripe`

Stripe webhook endpoint for payment updates.

Auth: Stripe signature verification

Notes:

- This route expects raw request body parsing.
- It must be publicly reachable in deployed environments.

### Admin APIs

All admin routes require `ADMIN` role.

#### `POST /api/admin/create-admin`

Create an admin user.

#### `GET /api/admin/users`

Return all users.

#### `PATCH /api/admin/users/:id/role`

Update another user's role.

Request:

```json
{
  "role": "ADMIN"
}
```

#### `PATCH /api/admin/users/:id/deactivate`

Deactivate a user account.

## Error Handling

The API uses centralized error middleware to normalize validation, JWT, Mongoose, Multer, and domain-level errors.

Standard error response:

```json
{
  "success": false,
  "message": "Validation failed",
  "statusCode": 400,
  "details": [
    "email must be a valid email"
  ],
  "stack": null
}
```

Notes:

- `stack` is included only in development mode
- validation details are returned as an array when available
- domain errors use the shared `AppError` utility

## Security Notes

Implemented:

- Password hashing with bcrypt
- JWT verification and expiration handling
- Role-based route protection
- `helmet` security headers
- CORS allowlist support
- Redis-backed rate limiting
- ObjectId validation on sensitive lookups
- Upload MIME-type and file-size restrictions

Important operational note:

- Secrets must never be committed to source control
- Rotate any credentials that were exposed during development

## Testing

Run tests:

```bash
yarn test
```

Current automated coverage includes:

- Auth service unit tests
- Route-level API tests for auth, products, cart, orders, payments, and admin routes

Current test files:

```text
tests/auth.service.unit.test.js
tests/routes/auth.routes.test.js
tests/routes/product.routes.test.js
tests/routes/cart.routes.test.js
tests/routes/order.routes.test.js
tests/routes/payment.routes.test.js
tests/routes/admin.routes.test.js
```

Notes:

- Route tests use Supertest with mocked dependencies to validate request handling and status codes
- Full database-backed integration coverage is still a future improvement

## Deployment

The repository includes Vercel routing via `vercel.json` and a serverless entrypoint in `api/index.js`.

### Vercel Notes

- `api/index.js` bootstraps the Express app for Vercel
- `vercel.json` routes all traffic to the serverless handler
- Mongo connection reuse is implemented to reduce serverless reconnect overhead

### Recommended Production Environment Variables

- `NODE_ENV=production`
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `CORS_ORIGINS`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

### Deployment Checklist

1. Provision MongoDB
2. Provision Redis or set `DISABLE_REDIS=true` for limited environments
3. Configure Stripe webhook endpoint
4. Configure Cloudinary credentials
5. Set production CORS origins
6. Set a strong JWT secret
7. Verify webhook reachability
8. Enable HTTPS

## Known Limitations

- Order creation currently deducts stock before payment is completed
- Validation is strong for request bodies, but query and params validation is still lighter than ideal
- The project uses service-to-model access directly instead of a repository abstraction
- API response shapes are mostly consistent, but some success payloads use domain keys instead of a single universal `data` wrapper

## Future Improvements

- Add repository layer for stricter separation of concerns
- Add database-backed integration tests
- Add refresh tokens and token revocation
- Add OpenAPI or Swagger documentation
- Add audit logs for admin actions
- Add structured logging, metrics, and tracing
- Improve payment reconciliation and webhook idempotency

## Author

**Muhammad Umar**

This project demonstrates practical backend experience with authentication, role-based access control, caching, rate limiting, third-party integrations, and modular API design.
