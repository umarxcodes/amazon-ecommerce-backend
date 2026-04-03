import mongoose from 'mongoose'
import Product from '../models/product.model.js'
import {
  clearProductCache,
  getCachedValue,
  getProductCacheVersion,
  setCachedValue,
} from './cache.service.js'
import { createAppError } from '../utils/app-error.util.js'

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const createProduct = async ({ body, files }) => {
  const images = files?.map((file) => file.path) || []

  const product = await Product.create({
    ...body,
    images,
  })

  await clearProductCache()

  return {
    success: true,
    message: 'Product created successfully',
    product,
  }
}

export const getProducts = async (queryParams) => {
  const cacheVersion = await getProductCacheVersion()
  const cacheKey = `products:${cacheVersion}:${JSON.stringify(queryParams)}`
  const cachedData = await getCachedValue(cacheKey)

  if (cachedData) {
    return cachedData
  }

  const {
    search,
    category,
    minPrice,
    maxPrice,
    rating,
    sort,
    page = 1,
    limit = 10,
  } = queryParams

  const query = {}

  if (search) {
    const safeSearch = escapeRegex(search.trim())
    query.$or = [
      { name: { $regex: safeSearch, $options: 'i' } },
      { description: { $regex: safeSearch, $options: 'i' } },
    ]
  }

  if (category) {
    query.category = category
  }

  if (minPrice || maxPrice) {
    query.price = {}
    if (minPrice) query.price.$gte = Number(minPrice)
    if (maxPrice) query.price.$lte = Number(maxPrice)
  }

  if (rating) {
    query.ratings = { $gte: Number(rating) }
  }

  const pageNumber = Math.max(1, Number(page))
  const limitNumber = Math.min(100, Math.max(1, Number(limit)))
  const skip = (pageNumber - 1) * limitNumber

  const allowedSortFields = ['price', 'createdAt', 'ratings']
  let sortOption = { createdAt: -1 }

  if (sort) {
    const field = sort.replace('-', '')
    if (allowedSortFields.includes(field)) {
      sortOption = { [field]: sort.startsWith('-') ? -1 : 1 }
    }
  }

  const [products, total] = await Promise.all([
    Product.find(query).sort(sortOption).skip(skip).limit(limitNumber).lean(),
    Product.countDocuments(query),
  ])

  const response = {
    success: true,
    total,
    page: pageNumber,
    pages: Math.ceil(total / limitNumber),
    results: products.length,
    products,
  }

  await setCachedValue(cacheKey, response, { ex: 60 })

  return response
}

export const getProductById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createAppError('Invalid product ID', 400)
  }

  const product = await Product.findById(id).lean()
  if (!product) {
    throw createAppError('Product not found', 404)
  }

  return {
    success: true,
    product,
  }
}

export const updateProduct = async ({ productId, body, files }) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw createAppError('Invalid product ID', 400)
  }

  const product = await Product.findById(productId)
  if (!product) {
    throw createAppError('Product not found', 404)
  }

  if (files?.length) {
    product.images = files.map((file) => file.path)
  }

  const allowedUpdates = ['name', 'description', 'price', 'category', 'stock']
  allowedUpdates.forEach((field) => {
    if (body[field] !== undefined) {
      product[field] = body[field]
    }
  })

  await product.save()
  await clearProductCache()

  return {
    success: true,
    message: 'Product updated successfully',
    product,
  }
}

export const deleteProduct = async (productId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw createAppError('Invalid product ID', 400)
  }

  const product = await Product.findById(productId)
  if (!product) {
    throw createAppError('Product not found', 404)
  }

  await product.deleteOne()
  await clearProductCache()

  return {
    success: true,
    message: 'Product deleted successfully',
  }
}
