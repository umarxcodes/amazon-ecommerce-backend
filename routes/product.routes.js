/*
📁 FILE: product.routes.js
📌 PURPOSE: Declares public catalog endpoints and admin-only product
management routes with upload, validation, and rate-limit middleware.
========================================
*/

/* ===== IMPORTS ===== */
import { Router } from 'express'
import productController from '../controllers/product.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'
import adminMiddleware from '../middleware/admin.middleware.js'
import validate from '../middleware/validate.middleware.js'
import {
  productValidationSchema,
  updateProductValidationSchema,
} from '../validations/product.validation.js'
import upload, { requireCloudinaryUpload } from '../middleware/upload.middleware.js'
import {
  adminRateLimit,
  publicApiRateLimit,
} from '../middleware/rate-limit.middleware.js'

const router = Router()

/* ===== PRODUCT ROUTES ===== */
/* Public routes provide catalog access; protected routes manage inventory. */

// =====*** Get All Products ***=====
router.get('/', publicApiRateLimit, productController.getProducts)

// =====*** Get Single Product ***=====
router.get('/:id', publicApiRateLimit, productController.getProductById)

/* ============================* ADMIN ROUTES *============================= */

// =====*** Create Product ***=====
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  adminRateLimit,
  requireCloudinaryUpload,
  upload.array('image', 5),
  validate(productValidationSchema),
  productController.createProduct
)

// =====*** Update Product ***=====
router.put(
  '/:id',
  authMiddleware,
  adminMiddleware,
  adminRateLimit,
  requireCloudinaryUpload,
  upload.array('image', 5),
  validate(updateProductValidationSchema),
  productController.updateProduct
)

// =====*** Delete Product ***=====
router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  adminRateLimit,
  productController.deleteProduct
)

export default router
