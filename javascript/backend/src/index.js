import cors from 'cors'
import express from 'express'
import { authRouter } from './routes/auth.js'
import { cartRouter } from './routes/cart.js'
import { categoriesRouter } from './routes/categories.js'
import { ordersRouter } from './routes/orders.js'
import { productsRouter } from './routes/products.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.use('/api/auth', authRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/products', productsRouter)
app.use('/api/cart', cartRouter)
app.use('/api/orders', ordersRouter)

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'not_found' })
})

const port = Number(process.env.PORT) || 4520

app.listen(port, '0.0.0.0', () => {
  console.log(`EMarket API nasłuchuje na porcie ${port}`)
})
