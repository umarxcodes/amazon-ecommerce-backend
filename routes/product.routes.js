/* =====*** IMPORTS ***===== */
import { Router } from 'express'
import productController from '../controllers/product.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'
import adminMiddleware from '../middleware/admin.middleware.js'
import validate from '../middleware/validate.middleware.js'
import {
  productValidationSchema,
  updateProductValidationSchema,
} from '../validations/product.validation.js'
import upload from '../middleware/upload.middleware.js'
import {
  adminRateLimit,
  publicApiRateLimit,
} from '../middleware/rate-limit.middleware.js'

const router = Router()

/* ============================* PUBLIC ROUTES *============================= */

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
