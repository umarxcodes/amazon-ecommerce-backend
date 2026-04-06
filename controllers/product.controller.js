/*
📁 FILE: product.controller.js
📌 PURPOSE: Maps product-related HTTP requests to service methods and returns
HTTP responses with the correct status codes.
========================================
*/

/* ===== IMPORTS ===== */
import {
  createProduct as createProductService,
  getProducts as getProductsService,
  getProductById as getProductByIdService,
  updateProduct as updateProductService,
  deleteProduct as deleteProductService,
} from '../services/product.service.js'
import { asyncHandler } from '../utils/async-handler.util.js'

/* ===== PRODUCT CONTROLLER ===== */
/* Handles public catalog reads and admin product management endpoints. */

/* ===== CREATE PRODUCT FUNCTION ===== */
/* Creates a new catalog item and forwards uploaded image metadata. */
const createProduct = asyncHandler(async (req, res) => {
  const response = await createProductService({ body: req.body, files: req.files })
  res.status(201).json(response)
})

/* ===== GET PRODUCTS FUNCTION ===== */
/* Returns a paginated and filtered catalog list for public consumption. */
const getProducts = asyncHandler(async (req, res) => {
  const response = await getProductsService(req.query)
  res.status(200).json(response)
})

/* ===== GET PRODUCT BY ID FUNCTION ===== */
/* Returns one product document after ID validation and lookup. */
const getProductById = asyncHandler(async (req, res) => {
  const response = await getProductByIdService(req.params.id)
  res.status(200).json(response)
})

/* ===== UPDATE PRODUCT FUNCTION ===== */
/* Updates mutable product fields and replaces images when new files arrive. */
const updateProduct = asyncHandler(async (req, res) => {
  const response = await updateProductService({
    productId: req.params.id,
    body: req.body,
    files: req.files,
  })
  res.status(200).json(response)
})

/* ===== DELETE PRODUCT FUNCTION ===== */
/* Removes a product from the catalog for administrative maintenance. */
const deleteProduct = asyncHandler(async (req, res) => {
  const response = await deleteProductService(req.params.id)
  res.status(200).json(response)
})

/* ===== EXPORT CONTROLLER ===== */
export default {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
}
