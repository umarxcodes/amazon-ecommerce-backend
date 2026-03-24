/* =====*** IMPORTS ***===== */
import express from 'express'
import cartController from '../controllers/cart.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'

const router = express.Router()

/* ================= CART ROUTES (ALL PROTECTED) ================= */

// ===== ADD TO CART =====
router.post('/', authMiddleware, cartController.addToCart)

// ===== GET USER CART =====
router.get('/', authMiddleware, cartController.getCart)

// ===== UPDATE ITEM =====
router.put('/:productId', authMiddleware, cartController.updateCartItem)

// ===== REMOVE ITEM =====
router.delete('/:productId', authMiddleware, cartController.removeFromCart)

// ===== CLEAR CART =====
router.delete('/', authMiddleware, cartController.clearCart)

export default router
