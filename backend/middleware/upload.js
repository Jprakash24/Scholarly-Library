const multer = require('multer')
const path = require('path')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const cloudinary = require('../config/cloudinary')

const ALLOWED_EXT = new Set([
  '.pdf', '.doc', '.docx', '.ppt', '.pptx',
  '.xls', '.xlsx', '.txt', '.zip', '.rar',
  '.jpg', '.jpeg', '.png', '.webp', '.gif',
])

const storage = new CloudinaryStorage({
  cloudinary,
  params: {folder: 'library-app' , resource_type:'auto'},
})

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase()
  cb(null, ALLOWED_EXT.has(ext))
}

module.exports = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter,
})
