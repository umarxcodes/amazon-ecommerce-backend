/* =====*** IMPORTS ***===== */
import asyncHandler from 'express-async-handler'
import mongoose from 'mongoose'
import Cart from '../models/cart.model.js'
import Product from '../models/product.model.js'
import redis from '../config/redis.config.js'

/* ================= HELPER: CALCULATE TOTAL ================= */
const calculateTotal = (cart) => {
  return cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0)
}

/* ================= HELPER: CACHE KEY ================= */
const getCartCacheKey = (userId) => `cart:${userId}`

/* ================= HELPER: NORMALIZE QUANTITY ================= */
const normalizeQuantity = (quantity) => Number.parseInt(quantity, 10)

/* ================= HELPER: GET POPULATED CART ================= */
const getPopulatedCart = async (userId) => {
  return Cart.findOne({ user: userId }).populate('items.product').lean()
}

/* ================= ADD TO CART ================= */
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body

  /* ===== VALIDATE PRODUCT ID ===== */
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400)
    throw new Error('Invalid product ID')
  }

  const qty = quantity === undefined ? 1 : normalizeQuantity(quantity)
  if (!Number.isInteger(qty) || qty < 1) {
    res.status(400)
    throw new Error('Invalid quantity')
  }

  /* ===== CHECK PRODUCT EXISTS ===== */
  const product = await Product.findById(productId).lean()
  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  /* ===== FIND OR CREATE CART ===== */
  let cart = await Cart.findOne({ user: req.user.userId })

  if (!cart) {
    cart = new Cart({
      user: req.user.userId,
      items: [],
    })
  }

  /* ===== CHECK IF ITEM ALREADY EXISTS ===== */
  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  )
  if (itemIndex > -1) {
    const updatedQuantity = cart.items[itemIndex].quantity + qty
    if (updatedQuantity > product.stock) {
      res.status(400)
      throw new Error(`Only ${product.stock} item(s) available in stock`)
    }

    cart.items[itemIndex].quantity = updatedQuantity
  } else {
    if (qty > product.stock) {
      res.status(400)
      throw new Error(`Only ${product.stock} item(s) available in stock`)
    }

    cart.items.push({
      product: productId,
      quantity: qty,
      price: product.price,
    })
  }

  /* ===== RECALCULATE TOTAL ===== */
  cart.totalPrice = calculateTotal(cart)

  await cart.save()

  /* ===== INVALIDATE CACHE ===== */
  await redis.del(getCartCacheKey(req.user.userId))

  const populatedCart = await getPopulatedCart(req.user.userId)

  res.status(200).json({
    success: true,
    message: 'Item added to cart',
    cart: populatedCart,
  })
})

/* ================= GET CART (WITH REDIS CACHE) ================= */
const getCart = asyncHandler(async (req, res) => {
  const cacheKey = getCartCacheKey(req.user.userId)

  /* ===== CHECK CACHE ===== */
  const cachedCart = await redis.get(cacheKey)

  if (cachedCart) {
    console.log('⚡ CART CACHE HIT')
    return res.json({
      success: true,
      cart: cachedCart,
    })
  }

  console.log(' CART CACHE MISS')

  /* ===== FETCH FROM DATABASE ===== */
  const cart = await Cart.findOne({ user: req.user.userId })
    .populate('items.product')
    .lean()

  if (!cart) {
    const emptyCart = { items: [], totalPrice: 0 }

    /* ===== CACHE EMPTY CART ===== */
    await redis.set(cacheKey, emptyCart, { ex: 60 })

    return res.status(200).json({
      success: true,
      cart: emptyCart,
    })
  }

  /* ===== SAVE TO CACHE ===== */
  await redis.set(cacheKey, cart, { ex: 60 })

  res.status(200).json({
    success: true,
    cart,
  })
})

/* ================= UPDATE CART ITEM ================= */
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body
  const { productId } = req.params

  /* ===== VALIDATION ===== */
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400)
    throw new Error('Invalid product ID')
  }

  const qty = normalizeQuantity(quantity)
  if (!Number.isInteger(qty) || qty < 1) {
    res.status(400)
    throw new Error('Invalid quantity')
  }

  const cart = await Cart.findOne({ user: req.user.userId })

  if (!cart) {
    res.status(404)
    throw new Error('Cart not found')
  }

  const item = cart.items.find((item) => item.product.toString() === productId)

  if (!item) {
    res.status(404)
    throw new Error('Item not found in cart')
  }

  const product = await Product.findById(productId).lean()
  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  if (qty > product.stock) {
    res.status(400)
    throw new Error(`Only ${product.stock} item(s) available in stock`)
  }

  /* ===== UPDATE QUANTITY ===== */
  item.quantity = qty

  cart.totalPrice = calculateTotal(cart)

  await cart.save()

  /* ===== INVALIDATE CACHE ===== */
  await redis.del(getCartCacheKey(req.user.userId))

  const populatedCart = await getPopulatedCart(req.user.userId)

  res.status(200).json({
    success: true,
    message: 'Cart updated',
    cart: populatedCart,
  })
})

/* ================= REMOVE ITEM ================= */
const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400)
    throw new Error('Invalid product ID')
  }

  const cart = await Cart.findOne({ user: req.user.userId })

  if (!cart) {
    res.status(404)
    throw new Error('Cart not found')
  }

  /* ===== REMOVE ITEM ===== */
  const initialItemsCount = cart.items.length
  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  )

  if (cart.items.length === initialItemsCount) {
    res.status(404)
    throw new Error('Item not found in cart')
  }

  cart.totalPrice = calculateTotal(cart)

  await cart.save()

  /* ===== INVALIDATE CACHE ===== */
  await redis.del(getCartCacheKey(req.user.userId))

  const populatedCart = await getPopulatedCart(req.user.userId)

  res.status(200).json({
    success: true,
    message: 'Item removed from cart',
    cart: populatedCart,
  })
})

/* ================= CLEAR CART ================= */
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.userId })

  if (!cart) {
    res.status(404)
    throw new Error('Cart not found')
  }

  /* ===== CLEAR ALL ITEMS ===== */
  cart.items = []
  cart.totalPrice = 0

  await cart.save()

  /* ===== INVALIDATE CACHE ===== */
  await redis.del(getCartCacheKey(req.user.userId))

  res.status(200).json({
    success: true,
    message: 'Cart cleared successfully',
    cart: { items: [], totalPrice: 0 },
  })
})

/* =====*** EXPORT CONTROLLER ***===== */
export default {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
}
