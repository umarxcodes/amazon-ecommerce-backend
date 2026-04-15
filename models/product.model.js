import mongoose from 'mongoose'

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
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      enum: [
        'Electronics',
        'Clothing',
        'Home & Kitchen',
        'Books',
        'Sports & Outdoors',
        'Toys & Games',
        'Health & Beauty',
        'Automotive',
        'Computers & Accessories',
        'Grocery & Gourmet',
        'Gaming',
      ],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
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
    listPrice: {
      type: Number,
      min: [0, 'List price cannot be negative'],
    },
    prime: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

productSchema.index({ name: 'text', description: 'text' })
productSchema.index({ category: 1, price: 1, createdAt: -1 })
productSchema.index({ createdAt: -1 })

export default mongoose.model('Product', productSchema)
