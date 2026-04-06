/*
📁 FILE: cart.service.js
📌 PURPOSE: Implements cart business rules such as stock validation,
price snapshots, totals, caching, and cart mutations.
========================================
*/

import mongoose from 'mongoose'
import Cart from '../models/cart.model.js'
import Product from '../models/product.model.js'
import {
  clearCartCache,
  getCartCacheKey,
  getCachedValue,
  setCachedValue,
} from './cache.service.js'
import { createAppError } from '../utils/app-error.util.js'

/* ===== CART HELPER FUNCTIONS ===== */
/* Shared helpers keep cart calculations and lookups consistent. */
const calculateTotal = (cart) => {
  return cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0)
}

const normalizeQuantity = (quantity) => Number.parseInt(quantity, 10)

const getPopulatedCart = async (userId) => {
  return Cart.findOne({ user: userId }).populate('items.product').lean()
}

const getCartDocument = async (userId) => {
  const cart = await Cart.findOne({ user: userId })

  if (!cart) {
    throw createAppError('Cart not found', 404)
  }

  return cart
}

/* ===== ADD TO CART FUNCTION ===== */
/* Adds or increments a cart item while enforcing current stock constraints. */
export const addToCart = async ({ userId, productId, quantity }) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw createAppError('Invalid product ID', 400)
  }

  const qty = quantity === undefined ? 1 : normalizeQuantity(quantity)
  if (!Number.isInteger(qty) || qty < 1) {
    throw createAppError('Invalid quantity', 400)
  }

  const product = await Product.findById(productId).lean()
  if (!product) {
    throw createAppError('Product not found', 404)
  }

  let cart = await Cart.findOne({ user: userId })
  if (!cart) {
    cart = new Cart({ user: userId, items: [] })
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  )

  if (itemIndex > -1) {
    const updatedQuantity = cart.items[itemIndex].quantity + qty
    if (updatedQuantity > product.stock) {
      throw createAppError(
        `Only ${product.stock} item(s) available in stock`,
        400
      )
    }

    cart.items[itemIndex].quantity = updatedQuantity
  } else {
    if (qty > product.stock) {
      throw createAppError(
        `Only ${product.stock} item(s) available in stock`,
        400
      )
    }

    cart.items.push({
      product: productId,
      quantity: qty,
      price: product.price,
    })
  }

  cart.totalPrice = calculateTotal(cart)
  await cart.save()
  await clearCartCache(userId)

  return {
    success: true,
    message: 'Item added to cart',
    cart: await getPopulatedCart(userId),
  }
}

/* ===== GET CART FUNCTION ===== */
/* Retrieves the user's cart from cache first, then falls back to MongoDB. */
export const getCart = async (userId) => {
  const cacheKey = getCartCacheKey(userId)
  const cachedCart = await getCachedValue(cacheKey)

  if (cachedCart) {
    return {
      success: true,
      cart: cachedCart,
    }
  }

  const cart = await Cart.findOne({ user: userId }).populate('items.product').lean()

  if (!cart) {
    const emptyCart = { items: [], totalPrice: 0 }
    await setCachedValue(cacheKey, emptyCart, { ex: 60 })

    return {
      success: true,
      cart: emptyCart,
    }
  }

  await setCachedValue(cacheKey, cart, { ex: 60 })

  return {
    success: true,
    cart,
  }
}

/* ===== UPDATE CART ITEM FUNCTION ===== */
/* Replaces a cart item's quantity after validating stock and ownership. */
export const updateCartItem = async ({ userId, productId, quantity }) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw createAppError('Invalid product ID', 400)
  }

  const qty = normalizeQuantity(quantity)
  if (!Number.isInteger(qty) || qty < 1) {
    throw createAppError('Invalid quantity', 400)
  }

  const cart = await getCartDocument(userId)
  const item = cart.items.find((entry) => entry.product.toString() === productId)

  if (!item) {
    throw createAppError('Item not found in cart', 404)
  }

  const product = await Product.findById(productId).lean()
  if (!product) {
    throw createAppError('Product not found', 404)
  }

  if (qty > product.stock) {
    throw createAppError(`Only ${product.stock} item(s) available in stock`, 400)
  }

  item.quantity = qty
  cart.totalPrice = calculateTotal(cart)
  await cart.save()
  await clearCartCache(userId)

  return {
    success: true,
    message: 'Cart updated',
    cart: await getPopulatedCart(userId),
  }
}

/* ===== REMOVE FROM CART FUNCTION ===== */
/* Deletes a single cart line item and recalculates totals. */
export const removeFromCart = async ({ userId, productId }) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw createAppError('Invalid product ID', 400)
  }

  const cart = await getCartDocument(userId)
  const initialItemsCount = cart.items.length
  cart.items = cart.items.filter((item) => item.product.toString() !== productId)

  if (cart.items.length === initialItemsCount) {
    throw createAppError('Item not found in cart', 404)
  }

  cart.totalPrice = calculateTotal(cart)
  await cart.save()
  await clearCartCache(userId)

  return {
    success: true,
    message: 'Item removed from cart',
    cart: await getPopulatedCart(userId),
  }
}

/* ===== CLEAR CART FUNCTION ===== */
/* Removes all cart items and resets the total price. */
export const clearCart = async (userId) => {
  const cart = await getCartDocument(userId)
  cart.items = []
  cart.totalPrice = 0
  await cart.save()
  await clearCartCache(userId)

  return {
    success: true,
    message: 'Cart cleared successfully',
    cart: { items: [], totalPrice: 0 },
  }
}
