const router = require('express').Router()
const { toggle, getMine, getAll, getMyHistory } = require('../controllers/saved.controller')
const { protect, requireRole } = require('../middleware/auth')

router.get('/', protect, requireRole('admin', 'superadmin'), getAll)
router.get('/mine', protect, getMine)
router.get('/mine/history', protect, getMyHistory)
router.post('/:materialId', protect, toggle)

module.exports = router
