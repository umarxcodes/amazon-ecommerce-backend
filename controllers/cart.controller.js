/*
📁 FILE: cart.controller.js
📌 PURPOSE: Handles authenticated cart operations and delegates pricing and
stock rules to the cart service layer.
========================================
*/

/* ===== IMPORTS ===== */
import {
  addToCart as addToCartService,
  getCart as getCartService,
  updateCartItem as updateCartItemService,
  removeFromCart as removeFromCartService,
  clearCart as clearCartService,
} from '../services/cart.service.js'
import { asyncHandler } from '../utils/async-handler.util.js'

/* ===== CART CONTROLLER ===== */
/* Handles cart creation, retrieval, mutation, and cleanup endpoints. */

/* ===== ADD TO CART FUNCTION ===== */
/* Adds a product to the authenticated user's cart after stock validation. */
const addToCart = asyncHandler(async (req, res) => {
  const response = await addToCartService({
    userId: req.user.userId,
    productId: req.body.productId,
    quantity: req.body.quantity,
  })
  res.status(200).json(response)
})

/* ===== GET CART FUNCTION ===== */
/* Returns the current authenticated user's cart, using cache when available. */
const getCart = asyncHandler(async (req, res) => {
  const response = await getCartService(req.user.userId)
  res.status(200).json(response)
})

/* ===== UPDATE CART ITEM FUNCTION ===== */
/* Replaces the quantity of an existing cart item. */
const updateCartItem = asyncHandler(async (req, res) => {
  const response = await updateCartItemService({
    userId: req.user.userId,
    productId: req.params.productId,
    quantity: req.body.quantity,
  })
  res.status(200).json(response)
})

/* ===== REMOVE CART ITEM FUNCTION ===== */
/* Removes a single product from the user's cart. */
const removeFromCart = asyncHandler(async (req, res) => {
  const response = await removeFromCartService({
    userId: req.user.userId,
    productId: req.params.productId,
  })
  res.status(200).json(response)
})

/* ===== CLEAR CART FUNCTION ===== */
/* Removes all items from the authenticated user's cart. */
const clearCart = asyncHandler(async (req, res) => {
  const response = await clearCartService(req.user.userId)
  res.status(200).json(response)
})

/* ===== EXPORT CONTROLLER ===== */
export default {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
}
