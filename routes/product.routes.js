/* =====*** IMPORTS ***===== */
import { Router } from 'express'
import productController from '../controllers/product.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'
import adminMiddleware from '../middleware/admin.middleware.js'
import validate from '../middleware/validate.middleware.js'
import { productValidationSchema } from '../validations/product.validation.js'

const router = Router()

/* ============================* PUBLIC ROUTES *============================= */

// =====*** Get All Products ***=====
router.get('/', productController.getProducts)

// =====*** Get Single Product ***=====
router.get('/:id', productController.getProductById)

/* ============================* ADMIN ROUTES *============================= */

// =====*** Create Product ***=====
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  validate(productValidationSchema),
  productController.createProduct
)

// =====*** Update Product ***=====
router.put(
  '/:id',
  authMiddleware,
  adminMiddleware,
  validate(productValidationSchema), // (you can later create update schema)
  productController.updateProduct
)

// =====*** Delete Product ***=====
router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  productController.deleteProduct
)

export default router
