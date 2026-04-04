# Amazon-Style Ecommerce Backend

A production-oriented ecommerce backend built with Node.js, Express, MongoDB, Redis, Cloudinary, and Stripe. The API supports authentication, role-based administration, product catalog management, cart workflows, transactional order creation, and payment checkout for an Amazon-like shopping experience.

## Overview

This project is structured as a modular backend service for ecommerce applications. It separates routing, controllers, services, validation, middleware, and persistence concerns so the codebase stays maintainable and easy to extend.

### Key Highlights

- JWT-based authentication with role-aware authorization
- Admin-only product and user management flows
- Product search, filtering, sorting, and pagination
- Per-user cart system with stock validation and Redis caching
- Transactional order creation with atomic stock deduction
- Stripe Checkout integration with webhook-driven payment confirmation
- Distributed sliding-window rate limiting backed by Upstash Redis
- Cloudinary-powered media uploads for product images
- Centralized validation and error handling

## Features

### Authentication and Authorization

- User registration and login
- JWT access token generation
- Bearer-token protected routes
- Admin-only route protection
- Inactive-user blocking during authorization
- Dedicated rate limiting for auth and login endpoints

### Product Management

- Public product listing and detail endpoints
- Search by product name and description
- Category and price filtering
- Sorting by price, rating, and creation date
- Pagination with bounded page size
- Admin-only create, update, and delete operations
- Cloudinary image upload support for product media
- Product-list caching with version-based invalidation

### Cart System

- One cart per user
- Add items with live stock validation
- Update item quantities
- Remove individual items
- Clear entire cart
- Cached cart retrieval using Redis

### Order and Checkout

- Create orders from cart contents
- Snapshot product details into order items
- Deduct stock inside a MongoDB transaction
- Retrieve authenticated user order history
- Retrieve individual orders with ownership or admin checks
- Create Stripe Checkout sessions for unpaid orders

### Payments

- Stripe Checkout session creation
- Stripe webhook verification
- Automatic order payment status updates after successful checkout
- Guard against reprocessing already-paid orders

### Admin Features

- Create admin users
- List all users
- Change user roles
- Deactivate user accounts
- Rate-limited admin operations

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

### Authentication and Security

- JSON Web Tokens (`jsonwebtoken`)
- `bcrypt`
- Custom security headers
- CORS allowlist controls
- Distributed Redis-backed rate limiting

### Payments and Uploads

- Stripe
- Multer
- `multer-storage-cloudinary`

### Validation and Error Flow

- Yup
- `express-async-handler`

## Folder Structure

```text
amazon-ecommerce-backend/
├── app.js
├── server.js
├── config/
│   ├── cloudinary.config.js
│   ├── db.config.js
│   ├── env.config.js
│   ├── redis.config.js
│   └── stripe.config.js
├── controllers/
│   ├── admin.controller.js
│   ├── auth.controller.js
│   ├── cart.controller.js
│   ├── order.controller.js
│   ├── payment.controller.js
│   └── product.controller.js
├── middleware/
│   ├── admin.middleware.js
│   ├── auth.middleware.js
│   ├── error.middleware.js
│   ├── rate-limit.middleware.js
│   ├── security.middleware.js
│   ├── upload.middleware.js
│   └── validate.middleware.js
├── models/
│   ├── cart.model.js
│   ├── order.model.js
│   ├── product.model.js
│   └── user.model.js
├── routes/
│   ├── admin.routes.js
│   ├── auth.routes.js
│   ├── cart.routes.js
│   ├── order.routes.js
│   ├── payment.routes.js
│   └── product.routes.js
├── services/
│   ├── admin.service.js
│   ├── auth.service.js
│   ├── cache.service.js
│   ├── cart.service.js
│   ├── order.service.js
│   ├── payment.service.js
│   └── product.service.js
├── utils/
│   ├── app-error.util.js
│   ├── hash.util.js
│   └── jwt.util.js
├── validations/
│   ├── admin.validation.js
│   ├── auth.validation.js
│   ├── cart.validation.js
│   ├── order.validation.js
│   ├── payment.validation.js
│   └── product.validation.js
├── webhooks/
│   └── stripe.webhook.js
├── package.json
└── README.md
```

### Folder Guide

- `config/`: environment handling and third-party service initialization
- `controllers/`: HTTP request orchestration
- `middleware/`: auth, validation, uploads, security, error handling, and rate limiting
- `models/`: Mongoose schemas and indexes
- `routes/`: API endpoints grouped by domain
- `services/`: business logic and cross-module operations
- `utils/`: shared utilities for errors, hashing, and JWT handling
- `validations/`: Yup request schemas
- `webhooks/`: Stripe webhook processing

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/muhammadumar-codes/amazon-ecommerce-backend.git
cd amazon-ecommerce-backend
```

### 2. Install Dependencies

```bash
yarn install
```

If you prefer npm:

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root.

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

### 4. Required Environment Variables

Required for application startup:

- `MONGO_URI`
- `JWT_SECRET`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Required for Stripe checkout:

- `CLIENT_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Required for Cloudinary uploads:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### 5. Run the Project

Development:

```bash
yarn dev
```

Production:

```bash
yarn start
```

### 6. Verify the API

```bash
curl http://localhost:5000/
```

Expected response:

```json
{
  "success": true,
  "message": "API is running"
}
```

## API Documentation

Base URL:

```text
http://localhost:5000/api
```

### Authentication

#### Register User

- Endpoint: `POST /api/auth/register`
- Auth: No
- Description: Create a standard user account

Request body:

```json
{
  "name": "Muhammad Umar",
  "email": "umar@example.com",
  "password": "SecurePass123"
}
```

Success response:

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

Error response:

```json
{
  "success": false,
  "message": "Validation failed",
  "details": [
    "password must be at least 6 characters"
  ]
}
```

#### Login User

- Endpoint: `POST /api/auth/login`
- Auth: No
- Description: Authenticate a user and return a JWT access token

Request body:

```json
{
  "email": "umar@example.com",
  "password": "SecurePass123"
}
```

Success response:

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

Error response:

```json
{
  "success": false,
  "message": "Invalid credentials",
  "details": null
}
```

#### Create Admin via Auth Module

- Endpoint: `POST /api/auth/admin-create`
- Auth: Yes, `ADMIN`
- Description: Create a new admin user from the auth namespace

Request body:

```json
{
  "name": "Ops Admin",
  "email": "ops-admin@example.com",
  "password": "StrongAdminPass123"
}
```

### Products

#### Get Products

- Endpoint: `GET /api/products`
- Auth: No
- Description: Fetch products with filtering, search, sorting, and pagination

Supported query parameters:

- `search`: product name or description keyword
- `category`: exact category filter
- `minPrice`: minimum price filter
- `maxPrice`: maximum price filter
- `rating`: minimum rating filter
- `sort`: `price`, `-price`, `createdAt`, `-createdAt`, `ratings`, `-ratings`
- `page`: page number, default `1`
- `limit`: page size, default `10`, max `100`

Example:

```http
GET /api/products?search=iphone&category=electronics&minPrice=100&maxPrice=2500&sort=-createdAt&page=1&limit=12
```

Success response:

```json
{
  "success": true,
  "total": 42,
  "page": 1,
  "pages": 4,
  "results": 12,
  "products": [
    {
      "_id": "6610db311d9cb39ef0f09534",
      "name": "iPhone 15 Pro",
      "description": "Flagship smartphone",
      "price": 1299,
      "category": "electronics",
      "stock": 10,
      "images": ["https://res.cloudinary.com/..."],
      "ratings": 4.8,
      "numReviews": 120,
      "createdAt": "2026-04-05T09:00:00.000Z",
      "updatedAt": "2026-04-05T09:00:00.000Z"
    }
  ]
}
```

#### Get Product By ID

- Endpoint: `GET /api/products/:id`
- Auth: No
- Description: Fetch a single product by MongoDB ObjectId

#### Create Product

- Endpoint: `POST /api/products`
- Auth: Yes, `ADMIN`
- Description: Create a new product with up to 5 uploaded images
- Content-Type: `multipart/form-data`

Form fields:

- `name`
- `description`
- `price`
- `category`
- `stock`
- `image` file field, repeatable up to 5 files

Success response:

```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "_id": "6610db311d9cb39ef0f09534",
    "name": "MacBook Pro",
    "description": "Apple laptop",
    "price": 2499,
    "category": "electronics",
    "stock": 8,
    "images": ["https://res.cloudinary.com/..."],
    "ratings": 0,
    "numReviews": 0
  }
}
```

#### Update Product

- Endpoint: `PUT /api/products/:id`
- Auth: Yes, `ADMIN`
- Description: Update product fields and optionally replace images
- Content-Type: `multipart/form-data`

Supported fields:

- `name`
- `description`
- `price`
- `category`
- `stock`
- `image`

#### Delete Product

- Endpoint: `DELETE /api/products/:id`
- Auth: Yes, `ADMIN`
- Description: Delete a product and invalidate cached listings

Success response:

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

### Cart

All cart routes require a bearer token.

#### Add to Cart

- Endpoint: `POST /api/cart`
- Auth: Yes
- Description: Add a product to the authenticated user's cart

Request body:

```json
{
  "productId": "6610db311d9cb39ef0f09534",
  "quantity": 2
}
```

Success response:

```json
{
  "success": true,
  "message": "Item added to cart",
  "cart": {
    "user": "6610d9bc1d9cb39ef0f09521",
    "items": [
      {
        "product": {
          "_id": "6610db311d9cb39ef0f09534",
          "name": "MacBook Pro"
        },
        "quantity": 2,
        "price": 2499
      }
    ],
    "totalPrice": 4998
  }
}
```

#### Get Cart

- Endpoint: `GET /api/cart`
- Auth: Yes
- Description: Fetch the authenticated user's cart, using Redis cache when available

#### Update Cart Item

- Endpoint: `PUT /api/cart/:productId`
- Auth: Yes
- Description: Replace the quantity for a specific cart line item

Request body:

```json
{
  "quantity": 3
}
```

#### Remove From Cart

- Endpoint: `DELETE /api/cart/:productId`
- Auth: Yes
- Description: Remove a single item from the cart

#### Clear Cart

- Endpoint: `DELETE /api/cart`
- Auth: Yes
- Description: Remove all items from the cart

Success response:

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

### Orders

All order routes require a bearer token.

#### Create Order

- Endpoint: `POST /api/orders`
- Auth: Yes
- Description: Create an order from the user's cart inside a MongoDB transaction

Request body:

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

Success response:

```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "_id": "6610ddf81d9cb39ef0f0958f",
    "user": "6610d9bc1d9cb39ef0f09521",
    "items": [
      {
        "product": "6610db311d9cb39ef0f09534",
        "name": "MacBook Pro",
        "price": 2499,
        "quantity": 2,
        "image": "https://res.cloudinary.com/..."
      }
    ],
    "shippingAddress": {
      "address": "221B Baker Street",
      "city": "London",
      "postalCode": "NW16XE",
      "country": "UK"
    },
    "paymentMethod": "stripe",
    "totalPrice": 4998,
    "isPaid": false,
    "status": "pending"
  }
}
```

#### Get My Orders

- Endpoint: `GET /api/orders/my`
- Auth: Yes
- Description: Return all orders for the authenticated user, newest first

#### Get Order By ID

- Endpoint: `GET /api/orders/:id`
- Auth: Yes
- Description: Return an order if the caller is the owner or an admin

### Payments

#### Create Stripe Checkout Session

- Endpoint: `POST /api/payment/checkout`
- Auth: Yes
- Description: Create a Stripe Checkout session for an unpaid order

Request body:

```json
{
  "orderId": "6610ddf81d9cb39ef0f0958f"
}
```

Success response:

```json
{
  "success": true,
  "sessionId": "cs_test_a1b2c3d4",
  "url": "https://checkout.stripe.com/c/pay/cs_test_a1b2c3d4"
}
```

Common error cases:

- `400`: invalid order ID
- `400`: order already paid
- `400`: order has no items
- `403`: user does not own the order and is not an admin
- `404`: order not found
- `500`: Stripe is not configured

#### Stripe Webhook

- Endpoint: `POST /api/payment/webhook/stripe`
- Auth: Stripe signature verification
- Description: Receives Stripe events and marks orders as paid after `checkout.session.completed`

### Admin

All admin routes require `ADMIN` role.

#### Create Admin

- Endpoint: `POST /api/admin/create-admin`
- Auth: Yes, `ADMIN`
- Description: Create a new admin account

#### Get All Users

- Endpoint: `GET /api/admin/users`
- Auth: Yes, `ADMIN`
- Description: Return all users without password fields

Success response:

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "6610d9bc1d9cb39ef0f09521",
      "name": "Muhammad Umar",
      "email": "umar@example.com",
      "role": "USER",
      "isActive": true
    }
  ]
}
```

#### Change User Role

- Endpoint: `PATCH /api/admin/users/:id/role`
- Auth: Yes, `ADMIN`
- Description: Promote or demote another user

Request body:

```json
{
  "role": "ADMIN"
}
```

#### Deactivate User

- Endpoint: `PATCH /api/admin/users/:id/deactivate`
- Auth: Yes, `ADMIN`
- Description: Disable a user account so future authenticated requests are blocked

## Authentication and Security

### JWT Flow

1. A user registers or logs in.
2. On login, the server signs an access token with `JWT_SECRET`.
3. The client sends the token as `Authorization: Bearer <token>`.
4. `auth.middleware.js` verifies the token and loads the active user from MongoDB.
5. Route-level middleware and service checks enforce ownership and admin access.

### Authorization Layers

- `authMiddleware`: verifies JWTs and ensures the user is still active
- `adminMiddleware`: restricts admin-only endpoints
- service-level ownership checks: protect orders and checkout access

### Security Practices Implemented

- Password hashing with `bcrypt`
- JWT validation and expiry handling
- Request validation with Yup and unknown-field stripping
- Distributed rate limiting for public, auth, admin, and checkout routes
- Strict file-type and file-size constraints for product uploads
- Security headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-XSS-Protection: 0`
- CORS allowlist support via environment configuration
- ObjectId validation for sensitive lookups
- Regex escaping for product search terms

## Error Handling

The application uses centralized Express error middleware to normalize validation, upload, JWT, Mongoose, and custom domain errors.

### Standard Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "details": [
    "email must be a valid email"
  ],
  "stack": null
}
```

### Error Handling Behavior

- custom `AppError` support for domain-specific HTTP errors
- Mongoose cast errors translated to `400 Invalid ID format`
- duplicate-key errors normalized into client-readable responses
- JWT and expired-token errors mapped to `401`
- Multer upload failures mapped to `400`
- stack traces included only in development mode

## Performance and Scalability

### Optimizations Implemented

- Redis-backed caching for product listings
- Redis-backed caching for per-user cart retrieval
- version-based cache invalidation for product queries
- bounded pagination for large result sets
- MongoDB indexes on products and orders
- parallel `find` and `countDocuments` execution for product listing
- transactional order creation for stock and cart consistency

### Rate Limiting Strategy

The system uses a distributed sliding-window rate limiter backed by Upstash Redis.

Current policies:

- Global API DDoS limit: `35 requests / 10 seconds / IP`
- Public product API: `90 requests / minute / IP`
- Auth routes: `20 requests / 15 minutes / IP`
- Login endpoint: `5 requests / 15 minutes / IP + email dimension`
- Checkout endpoint: `10 requests / 10 minutes / IP and user`
- Admin endpoints: `50 requests / 5 minutes / IP and user`

## Testing

There is currently no automated test suite configured in `package.json`.

### Current State

- No Jest, Mocha, or Supertest setup is present
- No `test` script is defined

### Recommended Test Stack

- Jest or Vitest for unit and integration tests
- Supertest for endpoint testing
- MongoDB Memory Server for isolated integration runs

### Suggested Test Cases

- registration and login success and failure flows
- JWT-protected route access
- admin-only route enforcement
- product filtering, sorting, and pagination behavior
- cart stock validation
- order creation transaction rollback on insufficient stock
- Stripe checkout authorization and webhook fulfillment
- distributed rate limiting behavior

## Deployment

### Production Checklist

1. Provision MongoDB
2. Provision Upstash Redis
3. Configure Stripe keys and webhook secret
4. Configure Cloudinary credentials
5. Set `CLIENT_URL` and `CORS_ORIGINS`
6. Set a strong `JWT_SECRET`
7. Run the service behind a trusted reverse proxy
8. Set `NODE_ENV=production`

### Start Command

```bash
yarn start
```

### Production Considerations

- Redis is required at startup because distributed rate limiting depends on it
- Stripe checkout requires both a frontend callback URL and a webhook secret
- Product uploads rely on Cloudinary for media storage
- The Stripe webhook endpoint must be publicly reachable
- Use HTTPS for all client and API traffic in production
- Store secrets in your deployment platform, not in source control

### Suggested Hosting Stack

- Render, Railway, Fly.io, or AWS ECS for the API
- MongoDB Atlas for the database
- Upstash for Redis
- Cloudinary for media storage
- Stripe for payment processing

## Future Improvements

- Add automated API and integration test coverage
- Introduce refresh tokens and token revocation
- Add product reviews and rating submission endpoints
- Add coupon, discount, and tax modules
- Add shipment and delivery workflow endpoints
- Implement audit logs for admin operations
- Add background jobs for emails, reconciliation, and cleanup
- Generate OpenAPI or Swagger documentation
- Add structured logging, metrics, and tracing
- Split services into independently deployable domains as scale increases

## API Response Conventions

### Success Pattern

```json
{
  "success": true,
  "message": "Optional human-readable message",
  "data": {}
}
```

### Error Pattern

```json
{
  "success": false,
  "message": "Human-readable error message",
  "details": null
}
```

## Author

**Muhammad Umar**

This backend demonstrates practical experience with API design, authorization, transactional data integrity, distributed rate limiting, third-party integrations, and production-minded service layering.
