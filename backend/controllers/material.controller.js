const Material = require('../models/Material')

async function getAll(req, res, next) {
  try {
    const { kind, q, ids, page = 1, limit = 20 } = req.query
    const filter = {}
    if (kind && kind !== 'all') filter.kind = kind
    if (q) filter.$text = { $search: q }
    if (ids) {
      const { isValidObjectId } = require('mongoose')
      const idList = ids.split(',').filter(id => isValidObjectId(id.trim()))
      filter._id = { $in: idList }
    }

    const [materials, total] = await Promise.all([
      Material.find(filter)
        .populate('addedBy', 'name')
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Material.countDocuments(filter),
    ])
    res.json({ materials, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    next(err)
  }
}

async function getOne(req, res, next) {
  try {
    const material = await Material.findById(req.params.id).populate('addedBy', 'name')
    if (!material) return res.status(404).json({ message: 'Material not found' })
    res.json(material)
  } catch (err) {
    next(err)
  }
}

async function create(req, res, next) {
  try {
    const material = await Material.create({ ...req.body, addedBy: req.user._id })
    res.status(201).json(material)
  } catch (err) {
    next(err)
  }
}

async function update(req, res, next) {
  try {
    const material = await Material.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('addedBy', 'name')
    if (!material) return res.status(404).json({ message: 'Material not found' })
    res.json(material)
  } catch (err) {
    next(err)
  }
}

async function remove(req, res, next) {
  try {
    const material = await Material.findByIdAndDelete(req.params.id)
    if (!material) return res.status(404).json({ message: 'Material not found' })
    res.json({ message: 'Material deleted' })
  } catch (err) {
    next(err)
  }
}

module.exports = { getAll, getOne, create, update, remove }
