import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../config/cloudinary.config.js'
import { isCloudinaryConfigured } from '../config/env.config.js'
import { createAppError } from '../utils/app-error.util.js'

// ===== CLOUDINARY STORAGE CONFIG =====
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: 'products',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 800, crop: 'scale' }],
      public_id: `product_${Date.now()}`, // unique name
    }
  },
})

// ===== FILE FILTER (SECURITY) =====
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed'), false)
  }
}

// ===== MULTER SETUP =====
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
})

export const requireCloudinaryUpload = (req, res, next) => {
  if (!isCloudinaryConfigured()) {
    return next(
      createAppError(
        'Cloudinary is not configured. Product image uploads are unavailable.',
        503
      )
    )
  }

  return next()
}

export default upload
