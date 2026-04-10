/* ===== IMPORTS ===== */
import express from 'express'
import cartController from '../controllers/cart.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'
import validate from '../middleware/validate.middleware.js'
import {
  addToCartSchema,
  updateCartItemSchema,
} from '../validations/cart.validation.js'

const router = express.Router()

/* ===== CART ROUTES ===== */

// ===== ADD TO CART =====
router.post(
  '/',
  authMiddleware,
  validate(addToCartSchema),
  cartController.addToCart
)

// ===== GET USER CART =====
router.get('/', authMiddleware, cartController.getCart)

// ===== CLEAR CART =====
router.delete('/clear', authMiddleware, cartController.clearCart)

// ===== UPDATE ITEM =====
router.put(
  '/:productId',
  authMiddleware,
  validate(updateCartItemSchema),
  cartController.updateCartItem
)

// ===== REMOVE ITEM =====
router.delete('/:productId', authMiddleware, cartController.removeFromCart)

export default router
