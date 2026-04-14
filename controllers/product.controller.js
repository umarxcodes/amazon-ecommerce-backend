import {
  createProduct as createProductService,
  getProducts as getProductsService,
  getProductById as getProductByIdService,
  updateProduct as updateProductService,
  deleteProduct as deleteProductService,
} from '../services/product.service.js'
import { asyncHandler } from '../utils/async-handler.util.js'

const createProduct = asyncHandler(async (req, res) => {
  const response = await createProductService({
    body: req.body,
    files: req.files,
  })
  res.status(201).json(response)
})

const getProducts = asyncHandler(async (req, res) => {
  const response = await getProductsService(req.query)
  res.status(200).json(response)
})

const getProductById = asyncHandler(async (req, res) => {
  const response = await getProductByIdService(req.params.id)
  res.status(200).json(response)
})

const updateProduct = asyncHandler(async (req, res) => {
  const response = await updateProductService({
    productId: req.params.id,
    body: req.body,
    files: req.files,
  })
  res.status(200).json(response)
})

const deleteProduct = asyncHandler(async (req, res) => {
  const response = await deleteProductService(req.params.id)
  res.status(200).json(response)
})

export default {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
}
