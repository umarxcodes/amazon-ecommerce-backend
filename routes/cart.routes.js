import express from 'express'
import cartController from '../controllers/cart.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'
import validate from '../middleware/validate.middleware.js'
import {
  addToCartSchema,
  updateCartItemSchema,
} from '../validations/cart.validation.js'

const router = express.Router()

router.post(
  '/',
  authMiddleware,
  validate(addToCartSchema),
  cartController.addToCart
)

router.get('/', authMiddleware, cartController.getCart)

router.delete('/clear', authMiddleware, cartController.clearCart)

router.put(
  '/:productId',
  authMiddleware,
  validate(updateCartItemSchema),
  cartController.updateCartItem
)

router.delete('/:productId', authMiddleware, cartController.removeFromCart)

export default router
