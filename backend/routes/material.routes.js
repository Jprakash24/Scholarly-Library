const router = require('express').Router()
const { getAll, getOne, create, update, remove } = require('../controllers/material.controller')
const { protect, requireRole } = require('../middleware/auth')

router.get('/', getAll)
router.get('/:id', getOne)
router.post('/', protect, requireRole('admin', 'superadmin'), create)
router.patch('/:id', protect, requireRole('admin', 'superadmin'), update)
router.delete('/:id', protect, requireRole('superadmin'), remove)

module.exports = router
