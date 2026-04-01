/* =====*** IMPORTS ***===== */
import asyncHandler from 'express-async-handler'
import Order from '../models/order.model.js'
import Cart from '../models/cart.model.js'
import Product from '../models/product.model.js'
import redis from '../config/redis.config.js'

/* ================= HELPER: CACHE KEY ================= */
const getCartCacheKey = (userId) => `cart:${userId}`

/* ================= CREATE ORDER =================
   Flow:
   1. Get user cart
   2. Validate cart
   3. Convert cart → order items (snapshot)
   4. Calculate total
   5. Save order
   6. Clear cart
*/
const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress } = req.body

  /* ===== VALIDATE SHIPPING ===== */
  if (
    !shippingAddress ||
    !shippingAddress.address ||
    !shippingAddress.city ||
    !shippingAddress.postalCode ||
    !shippingAddress.country
  ) {
    res.status(400)
    throw new Error('Shipping address is required')
  }

  /* ===== GET USER CART ===== */
  const cart = await Cart.findOne({ user: req.user.userId }).populate(
    'items.product'
  )

  if (!cart || cart.items.length === 0) {
    res.status(400)
    throw new Error('Cart is empty')
  }

  /* ===== CONVERT CART → ORDER ITEMS ===== */
  const orderItems = cart.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    price: item.price, // snapshot price
    quantity: item.quantity,
    image: item.product.images[0] || '',
  }))

  /* ===== CALCULATE TOTAL ===== */
  const totalPrice = orderItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  )

  /* ===== OPTIONAL: STOCK CHECK ===== */
  for (const item of cart.items) {
    const product = await Product.findById(item.product._id)

    if (!product || product.stock < item.quantity) {
      res.status(400)
      throw new Error(`Not enough stock for ${product?.name}`)
    }

    // Reduce stock
    product.stock -= item.quantity
    await product.save()
  }

  /* ===== CREATE ORDER ===== */
  const order = await Order.create({
    user: req.user.userId,
    items: orderItems,
    shippingAddress,
    totalPrice,
  })

  /* ===== CLEAR CART AFTER ORDER ===== */
  cart.items = []
  cart.totalPrice = 0
  await cart.save()
  await redis.del(getCartCacheKey(req.user.userId))

  /* ===== RESPONSE ===== */
  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    order,
  })
})

/* ================= GET MY ORDERS ================= */
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.userId }).sort({
    createdAt: -1,
  })

  res.status(200).json({
    success: true,
    count: orders.length,
    orders,
  })
})

/* ================= GET SINGLE ORDER ================= */
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  )

  if (!order) {
    res.status(404)
    throw new Error('Order not found')
  }

  res.status(200).json({
    success: true,
    order,
  })
})

/* ===== EXPORT CONTROLLER ===== */
export default {
  createOrder,
  getMyOrders,
  getOrderById,
}
