/* =====*** IMPORTS ***===== */
import mongoose from 'mongoose'

/* ================================* PRODUCT SCHEMA *=============================== */
const productSchema = new mongoose.Schema(
  {
    /* =====*** PRODUCT NAME ***===== */
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },

    /* =====*** DESCRIPTION ***===== */
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },

    /* =====*** PRICE ***===== */
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },

    /* =====*** CATEGORY ***===== */
    category: {
      type: String,
      required: [true, 'Product category is required'],
    },

    /* =====*** STOCK ***===== */
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },

    /* =====*** PRODUCT IMAGES (Cloudinary URLs) ***===== */
    images: [
      {
        type: String,
      },
    ],

    /* =====*** PRODUCT RATING ***===== */
    ratings: {
      type: Number,
      default: 0,
    },

    /* =====*** NUMBER OF REVIEWS ***===== */
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

/* =====*** TEXT INDEX FOR SEARCH OPTIMIZATION ***===== */
productSchema.index({ name: 'text', description: 'text' })
productSchema.index({ category: 1, price: 1, createdAt: -1 })
productSchema.index({ createdAt: -1 })

/* =====*** EXPORT MODEL ***===== */
export default mongoose.model('Product', productSchema)
