const express = require('express')
const router = express.Router()
const Stock = require('../models/Stock')
const auth = require('../middleware/auth')

router.use(auth)

router.get('/', async (req, res) => {
  try {
    const stocks = await Stock.find({ userId: req.userId })
    
    const enrichedStocks = stocks.map(s => {
      const pl = (s.currentPrice - s.buyPrice) * s.quantity
      const plPercent = (((s.currentPrice - s.buyPrice) / s.buyPrice) * 100).toFixed(2)
      
      let suggestion = `Holding zone. Monitor for 5% movement before acting.`
      const pct = parseFloat(plPercent)
      if (pct > 15) {
        suggestion = `Consider taking partial profits. You are up ${pct.toFixed(1)}%.`
      } else if (pct < -10) {
        suggestion = `Down ${Math.abs(pct).toFixed(1)}%. Evaluate fundamentals before averaging down.`
      }

      return {
        ...s._doc,
        pl,
        plPercent,
        suggestion
      }
    })

    res.json(enrichedStocks)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { symbol, name, buyPrice, quantity } = req.body
    
    if (!symbol || !symbol.trim()) return res.status(400).json({ message: 'Symbol is required' })
    if (buyPrice === undefined || buyPrice <= 0) return res.status(400).json({ message: 'Valid buy price is required' })
    if (quantity === undefined || quantity < 1) return res.status(400).json({ message: 'Quantity must be at least 1' })

    const stock = new Stock({
      userId: req.userId,
      symbol,
      name: name || symbol,
      buyPrice,
      quantity,
      currentPrice: buyPrice
    })

    await stock.save()
    res.status(201).json(stock)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { currentPrice, quantity, buyPrice } = req.body
    const stock = await Stock.findOne({ _id: req.params.id, userId: req.userId })
    
    if (!stock) return res.status(404).json({ message: 'Stock not found' })

    if (currentPrice !== undefined) stock.currentPrice = currentPrice
    if (quantity !== undefined) stock.quantity = quantity
    if (buyPrice !== undefined) stock.buyPrice = buyPrice
    
    stock.lastUpdated = Date.now()

    await stock.save()
    res.json(stock)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const stock = await Stock.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!stock) return res.status(404).json({ message: 'Stock not found' })
    res.json({ message: 'Stock deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

module.exports = router
