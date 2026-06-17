const mongoose = require('mongoose')

async function connectDB() {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,  // fail fast if URI is wrong
    socketTimeoutMS: 45000,          // drop slow queries after 45s
  })
  console.log(`MongoDB connected: ${conn.connection.host}`)

  mongoose.connection.on('disconnected', () =>
    console.warn('MongoDB disconnected — will auto-reconnect')
  )
  mongoose.connection.on('reconnected', () =>
    console.log('MongoDB reconnected')
  )
  mongoose.connection.on('error', (err) =>
    console.error('MongoDB error:', err.message)
  )
}

module.exports = connectDB
