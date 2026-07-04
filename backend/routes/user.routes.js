const router = require('express').Router()
const { getAll, getOne, create, update, remove, resetPassword, suspend, reactivate, restore } = require('../controllers/user.controller')
const { protect, requireRole } = require('../middleware/auth')

router.get('/', protect, requireRole('admin', 'superadmin'), getAll)
router.get('/:id', protect, requireRole('admin', 'superadmin'), getOne)
router.post('/', protect, requireRole('admin', 'superadmin'), create)
router.patch('/:id', protect, requireRole('admin', 'superadmin'), update)
router.delete('/:id', protect, requireRole('admin', 'superadmin'), remove)
router.patch('/:id/reset-password', protect, requireRole('admin', 'superadmin'), resetPassword)
router.patch('/:id/suspend',        protect, requireRole('admin', 'superadmin'), suspend)
router.patch('/:id/reactivate',     protect, requireRole('admin', 'superadmin'), reactivate)
router.patch('/:id/restore',        protect, requireRole('admin', 'superadmin'), restore)

module.exports = router
