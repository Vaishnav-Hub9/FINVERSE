const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  payee: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  type: { type: String, enum: ['expense', 'income'], required: true },
  date: { type: String, required: true },
  time: { type: String, default: '00:00' },
  memo: { type: String, default: '' },
  cleared: { type: Boolean, default: true },
  isRegret: { type: Boolean, default: false },
  outflow: { type: Number, default: 0 },
  inflow: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Transaction', transactionSchema)
