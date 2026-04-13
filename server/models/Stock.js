const mongoose = require('mongoose')

const stockSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true, trim: true, uppercase: true },
  name: { type: String, required: true },
  buyPrice: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  currentPrice: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Stock', stockSchema)
