/* ======*IMPORTS*====== */
import mongoose from 'mongoose'

/* ======*PRODUCT SCHEMA*====== */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },

    description: {
      type: String,
      required: [true, 'Product description is required'],
    },

    price: {
      type: Number,
      required: [true, 'Product price is required'],
    },

    category: {
      type: String,
      required: [true, 'Product category is required'],
    },

    stock: {
      type: Number,
      default: 0,
    },

    images: [
      {
        type: String,
      },
    ],

    ratings: {
      type: Number,
      default: 0,
    },

    numReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
)

/* ======*EXPORT MODEL*====== */
export default mongoose.model('Product', productSchema)
