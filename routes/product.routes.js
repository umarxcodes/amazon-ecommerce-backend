import { Router } from 'express'
import productController from '../controllers/product.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'
import adminMiddleware from '../middleware/admin.middleware.js'
import validate from '../middleware/validate.middleware.js'
import {
  productValidationSchema,
  updateProductValidationSchema,
} from '../validations/product.validation.js'
import upload, {
  requireCloudinaryUpload,
} from '../middleware/upload.middleware.js'
import {
  adminRateLimit,
  publicApiRateLimit,
} from '../middleware/rate-limit.middleware.js'

const router = Router()

router.get('/', publicApiRateLimit, productController.getProducts)
router.get('/:id', publicApiRateLimit, productController.getProductById)

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

router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  adminRateLimit,
  productController.deleteProduct
)

export default router
