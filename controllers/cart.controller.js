/* =====*** IMPORTS ***===== */
import asyncHandler from 'express-async-handler'
import mongoose from 'mongoose'
import Cart from '../models/cart.model.js'
import Product from '../models/product.model.js'

/* ================= HELPER: CALCULATE TOTAL ================= */
const calculateTotal = (cart) => {
  return cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0)
}

/* ================= ADD TO CART ================= */
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body

  /* ===== VALIDATE PRODUCT ID ===== */
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400)
    throw new Error('Invalid product ID')
  }

  const qty = Math.max(1, Number(quantity) || 1)

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

  /* ===== CHECK IF ITEM EXISTS ===== */
  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  )

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += qty
  } else {
    cart.items.push({
      product: productId,
      quantity: qty,
      price: product.price,
    })
  }

  /* ===== RECALCULATE TOTAL ===== */
  cart.totalPrice = calculateTotal(cart)

  await cart.save()

  res.status(200).json({
    success: true,
    message: 'Item added to cart',
    cart,
  })
})

/* ================= GET CART ================= */
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.userId })
    .populate('items.product')
    .lean()

  if (!cart) {
    return res.status(200).json({
      success: true,
      cart: { items: [], totalPrice: 0 },
    })
  }

  res.status(200).json({
    success: true,
    cart,
  })
})

/* ================= UPDATE CART ITEM ================= */
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body

  if (!quantity || quantity < 1) {
    res.status(400)
    throw new Error('Invalid quantity')
  }

  const cart = await Cart.findOne({ user: req.user.userId })
  if (!cart) {
    res.status(404)
    throw new Error('Cart not found')
  }

  const item = cart.items.find(
    (item) => item.product.toString() === req.params.productId
  )

  if (!item) {
    res.status(404)
    throw new Error('Item not found in cart')
  }

  item.quantity = quantity

  cart.totalPrice = calculateTotal(cart)

  await cart.save()

  res.status(200).json({
    success: true,
    message: 'Cart updated',
    cart,
  })
})

/* ================= REMOVE ITEM ================= */
const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.userId })

  if (!cart) {
    res.status(404)
    throw new Error('Cart not found')
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== req.params.productId
  )

  cart.totalPrice = calculateTotal(cart)

  await cart.save()

  res.status(200).json({
    success: true,
    message: 'Item removed from cart',
    cart,
  })
})

/* ================= CLEAR CART ================= */
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.userId })

  if (!cart) {
    res.status(404)
    throw new Error('Cart not found')
  }

  cart.items = []
  cart.totalPrice = 0

  await cart.save()

  res.status(200).json({
    success: true,
    message: 'Cart cleared',
  })
})

/* ===== EXPORT CONTROLLER ===== */
export default {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
}
