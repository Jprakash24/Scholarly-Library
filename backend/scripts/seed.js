require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const mongoose = require('mongoose')
const User = require('../models/User')

const ADMINS = [
  {
    name: 'Super Admin',
    email: 'superadmin@scholarly.library',
    password: 'SuperAdmin#2026',
    role: 'superadmin',
  },
  {
    name: 'Library Admin',
    email: 'admin@scholarly.library',
    password: 'ScholarlyAdmin#2026',
    role: 'admin',
  },
]

async function seed() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected to MongoDB')

  for (const adminData of ADMINS) {
    const existing = await User.findOne({ email: adminData.email })
    if (existing) {
      console.log(`Already exists: ${adminData.email}`)
      continue
    }
    const user = new User(adminData)
    await user.save()
    console.log(`Created: ${adminData.email} (${adminData.role})`)
  }

  console.log('\nSeed credentials:')
  console.log('  superadmin@scholarly.library / SuperAdmin#2026')
  console.log('  admin@scholarly.library / ScholarlyAdmin#2026')

  await mongoose.disconnect()
  console.log('\nDone.')
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
