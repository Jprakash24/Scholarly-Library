const router = require('express').Router()
const { protect, requireRole } = require('../middleware/auth')
const upload = require('../middleware/upload')

router.post(
  '/',
  protect,
  requireRole('admin', 'superadmin'),
  upload.single('file'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded or file type not allowed' })
    }
    res.json({
      fileUrl: req.file.path,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    })
  },
)

module.exports = router
