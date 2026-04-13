const express = require('express')
const router = express.Router()
const Transaction = require('../models/Transaction')
const auth = require('../middleware/auth')

router.use(auth)

router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId })
                                        .sort({ date: -1, createdAt: -1 })
    res.json(transactions)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { payee, amount, category, type, date, time, memo, cleared, isRegret } = req.body
    
    if (!payee) return res.status(400).json({ message: 'Payee is required' })
    if (amount === undefined || amount < 0) return res.status(400).json({ message: 'Valid amount is required' })
    if (!category) return res.status(400).json({ message: 'Category is required' })
    if (!type) return res.status(400).json({ message: 'Type is required' })

    const outflow = type === 'expense' ? amount : 0
    const inflow = type === 'income' ? amount : 0

    let finalMemo = memo || ''
    if (time) {
      const hour = parseInt(time.split(':')[0])
      const isLateNight = hour >= 22
      if (isLateNight && type === 'expense') {
        finalMemo = finalMemo ? finalMemo + ' [Late Night Purchase]' : '[Late Night Purchase]'
      }
    }

    const transaction = new Transaction({
      userId: req.userId,
      payee,
      amount,
      category,
      type,
      date,
      time: time || '00:00',
      memo: finalMemo,
      cleared: cleared !== undefined ? cleared : true,
      isRegret: isRegret || false,
      outflow,
      inflow
    })

    await transaction.save()
    res.status(201).json(transaction)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { payee, amount, category, date, time, memo, cleared, isRegret, type } = req.body
    
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.userId })
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' })

    if (payee !== undefined) transaction.payee = payee
    if (amount !== undefined) transaction.amount = amount
    if (category !== undefined) transaction.category = category
    if (date !== undefined) transaction.date = date
    if (time !== undefined) transaction.time = time
    if (memo !== undefined) transaction.memo = memo
    if (cleared !== undefined) transaction.cleared = cleared
    if (isRegret !== undefined) transaction.isRegret = isRegret
    if (type !== undefined) transaction.type = type

    transaction.outflow = transaction.type === 'expense' ? transaction.amount : 0
    transaction.inflow = transaction.type === 'income' ? transaction.amount : 0

    await transaction.save()
    res.json(transaction)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' })
    res.json({ message: 'Transaction deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

router.get('/analytics', async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId })

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + t.inflow, 0)

    const totalSpent = transactions
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + t.outflow, 0)

    const totalRegret = transactions
      .filter(t => t.isRegret)
      .reduce((s, t) => s + t.amount, 0)

    const regretRatio = totalSpent > 0 ? totalRegret / totalSpent : 0
    const disciplineScore = Math.min(100, Math.max(0, Math.round((1 - regretRatio) * 100)))

    const potentialSavings = Math.round(totalRegret * 0.15)
    const futureValue = Math.round(totalRegret * Math.pow(1.08, 5))
    const moneyLost = futureValue - totalRegret

    const savingsRate = totalIncome > 0 
      ? Math.round(((totalIncome - totalSpent) / totalIncome) * 100) 
      : 0

    const lateNightTransactions = transactions.filter(t => {
      const hour = parseInt(t.time?.split(':')[0] || '0')
      return hour >= 22 && t.type === 'expense'
    })
    const lateNightTotal = lateNightTransactions.reduce((s,t) => s + t.outflow, 0)

    const categoryBreakdown = ['Bills', 'Needs', 'Wants'].map(cat => ({
      category: cat,
      total: transactions.filter(t => t.category === cat).reduce((s,t) => s + t.outflow, 0),
      regretTotal: transactions.filter(t => t.category === cat && t.isRegret).reduce((s,t) => s + t.outflow, 0)
    }))

    const buffer = totalIncome - totalSpent

    res.json({
      totalIncome, totalSpent, totalRegret, buffer,
      regretRatio: Math.round(regretRatio * 100),
      disciplineScore, potentialSavings,
      futureValue, moneyLost, savingsRate,
      lateNightCount: lateNightTransactions.length,
      lateNightTotal, categoryBreakdown
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

module.exports = router
