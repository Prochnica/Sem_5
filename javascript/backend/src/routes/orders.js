import { Router } from 'express'
import { requireUser } from '../auth.js'
import { getDatabase, runInTransaction } from '../db/database.js'
import { ApiError, handle } from '../errors.js'
import { readId, requiredText } from '../validate.js'

export const ordersRouter = Router()

ordersRouter.use(requireUser)

const orderColumns = `
  id,
  user_id,
  status,
  recipient_name,
  address_line,
  postal_code,
  city,
  total_cents,
  created_at
`

function readOrder(userId, orderId) {
  const order = getDatabase()
    .prepare(`SELECT ${orderColumns} FROM orders WHERE id = ? AND user_id = ?`)
    .get(orderId, userId)

  if (!order) {
    return null
  }

  const items = getDatabase().prepare(`
    SELECT id, product_id, product_name, unit_price_cents, quantity
    FROM order_items
    WHERE order_id = ?
    ORDER BY id
  `).all(orderId)

  return { ...order, items }
}

ordersRouter.get('/', handle((req, res) => {
  const orders = getDatabase()
    .prepare(`SELECT ${orderColumns} FROM orders WHERE user_id = ? ORDER BY id DESC`)
    .all(req.user.id)

  res.json(orders)
}))

ordersRouter.get('/:id', handle((req, res) => {
  const order = readOrder(req.user.id, readId(req.params.id))

  if (!order) {
    throw new ApiError(404, 'not_found', 'Nie ma takiego zamówienia')
  }

  res.json(order)
}))

ordersRouter.post('/', handle((req, res) => {
  const body = req.body ?? {}
  const recipientName = requiredText(body.recipient_name, 'imię odbiorcy')
  const addressLine = requiredText(body.address_line, 'adres')
  const postalCode = requiredText(body.postal_code, 'kod pocztowy')
  const city = requiredText(body.city, 'miasto')

  const orderId = runInTransaction(() => {
    const database = getDatabase()
    const cart = database.prepare('SELECT id FROM carts WHERE user_id = ?').get(req.user.id)
    const items = cart
      ? database.prepare(`
          SELECT cart_items.quantity, products.id AS product_id, products.name, products.price_cents, products.stock
          FROM cart_items
          JOIN products ON products.id = cart_items.product_id
          WHERE cart_items.cart_id = ?
        `).all(cart.id)
      : []

    if (items.length === 0) {
      throw new ApiError(400, 'validation', 'Koszyk jest pusty')
    }

    for (const item of items) {
      if (item.quantity > item.stock) {
        throw new ApiError(400, 'validation', `Za mało sztuk: ${item.name}`)
      }
    }

    const totalCents = items.reduce((sum, item) => sum + item.price_cents * item.quantity, 0)
    const created = database.prepare(`
      INSERT INTO orders (
        user_id, status, recipient_name, address_line, postal_code, city, total_cents, created_at
      ) VALUES (?, 'zlozone', ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.id,
      recipientName,
      addressLine,
      postalCode,
      city,
      totalCents,
      new Date().toISOString(),
    )
    const newOrderId = Number(created.lastInsertRowid)
    const insertItem = database.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, unit_price_cents, quantity)
      VALUES (?, ?, ?, ?, ?)
    `)
    const decreaseStock = database.prepare('UPDATE products SET stock = stock - ? WHERE id = ?')

    for (const item of items) {
      insertItem.run(newOrderId, item.product_id, item.name, item.price_cents, item.quantity)
      decreaseStock.run(item.quantity, item.product_id)
    }

    database.prepare('DELETE FROM cart_items WHERE cart_id = ?').run(cart.id)
    return newOrderId
  })

  res.status(201).json(readOrder(req.user.id, orderId))
}))
