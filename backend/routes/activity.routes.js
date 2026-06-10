const router = require('express').Router()
const { myActivity, dismiss, clearAll, allActivity } = require('../controllers/activity.controller')
const { protect, requireRole } = require('../middleware/auth')

router.get('/my', protect, myActivity)
router.patch('/:id/dismiss', protect, dismiss)
router.delete('/my', protect, clearAll)
router.get('/', protect, requireRole('admin', 'superadmin'), allActivity)

module.exports = router
