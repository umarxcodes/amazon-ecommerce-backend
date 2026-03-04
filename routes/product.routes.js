// =====*** IMPORTS ***=====
import { Router } from 'express'

import validate from '../middleware/validate.middleware.js'

import authMiddleware from '../middleware/auth.middleware.js'
import { productValidationSchema } from '../validations/productValidation.js'
import productController from '../controllers/productController.js'
import adminMiddleware from '../middleware/admin.middleware.js'

const router = Router()

// ============================* PRODUCT ROUTES *=============================

// =====*** Get All Products ***=====

router.get('/', productController.getProducts)

// =====*** Get Single Product ***=====
router.get('/:id', productController.getProductById)

// =====*** Create Product (Protected) ***=====
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  validate(productValidationSchema),
  productController.createProduct
)

// =====*** Update Product (Protected) ***=====
router.put(
  '/:id',
  authMiddleware,
  adminMiddleware,
  validate(productValidationSchema),
  productController.updateProduct
)

// =====*** Delete Product (Protected) ***=====
router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  productController.deleteProduct
)

export default router
