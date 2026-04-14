import {
  addToCart as addToCartService,
  getCart as getCartService,
  updateCartItem as updateCartItemService,
  removeFromCart as removeFromCartService,
  clearCart as clearCartService,
} from '../services/cart.service.js'
import { asyncHandler } from '../utils/async-handler.util.js'

const addToCart = asyncHandler(async (req, res) => {
  const response = await addToCartService({
    userId: req.user.userId,
    productId: req.body.productId,
    quantity: req.body.quantity,
  })
  res.status(201).json(response)
})

const getCart = asyncHandler(async (req, res) => {
  const response = await getCartService(req.user.userId)
  res.status(200).json(response)
})

const updateCartItem = asyncHandler(async (req, res) => {
  const response = await updateCartItemService({
    userId: req.user.userId,
    productId: req.params.productId,
    quantity: req.body.quantity,
  })
  res.status(200).json(response)
})

const removeFromCart = asyncHandler(async (req, res) => {
  const response = await removeFromCartService({
    userId: req.user.userId,
    productId: req.params.productId,
  })
  res.status(200).json(response)
})

const clearCart = asyncHandler(async (req, res) => {
  const response = await clearCartService(req.user.userId)
  res.status(200).json(response)
})

export default {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
}
