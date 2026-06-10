const router = require('express').Router()
const {
  requestBorrow,
  cancelRequest,
  returnMaterial,
  renewMaterial,
  myRequests,
  allRequests,
  approveRequest,
  rejectRequest,
  overrideRequest,
} = require('../controllers/borrow.controller')
const { protect, requireRole } = require('../middleware/auth')

// User routes
router.post('/', protect, requestBorrow)
router.get('/my', protect, myRequests)
router.patch('/:id/cancel', protect, cancelRequest)
router.patch('/:id/return', protect, returnMaterial)
router.patch('/:id/renew', protect, renewMaterial)

// Admin routes
router.get('/', protect, requireRole('admin', 'superadmin'), allRequests)
router.patch('/:id/approve', protect, requireRole('admin', 'superadmin'), approveRequest)
router.patch('/:id/reject', protect, requireRole('admin', 'superadmin'), rejectRequest)

// Superadmin-only override
router.patch('/:id/override', protect, requireRole('superadmin'), overrideRequest)

module.exports = router
