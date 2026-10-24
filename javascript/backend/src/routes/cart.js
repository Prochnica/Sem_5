import { Router } from 'express'
import { requireUser } from '../auth.js'
import { getDatabase } from '../db/database.js'
import { ApiError, handle } from '../errors.js'
import { readId, requiredInt } from '../validate.js'

export const cartRouter = Router()

cartRouter.use(requireUser)

function getOrCreateCart(userId) {
  const database = getDatabase()
  const existing = database.prepare('SELECT id FROM carts WHERE user_id = ?').get(userId)

  if (existing) {
    return existing.id
  }

  try {
    const created = database.prepare('INSERT INTO carts (user_id) VALUES (?)').run(userId)
    return Number(created.lastInsertRowid)
  } catch (error) {
    const again = database.prepare('SELECT id FROM carts WHERE user_id = ?').get(userId)

    if (again) {
      return again.id
    }

    throw error
  }
}

function readCart(userId) {
  const cartId = getOrCreateCart(userId)
  const items = getDatabase().prepare(`
    SELECT
      cart_items.id,
      cart_items.product_id,
      cart_items.quantity,
      products.name,
      products.slug,
      products.price_cents AS unit_price_cents,
      products.stock
    FROM cart_items
    JOIN products ON products.id = cart_items.product_id
    WHERE cart_items.cart_id = ?
    ORDER BY cart_items.id
  `).all(cartId)

  return { id: cartId, items }
}

function findItem(cartId, itemId) {
  return getDatabase().prepare(`
    SELECT cart_items.id, cart_items.product_id, cart_items.quantity, products.stock, products.name
    FROM cart_items
    JOIN products ON products.id = cart_items.product_id
    WHERE cart_items.id = ? AND cart_items.cart_id = ?
  `).get(itemId, cartId)
}

cartRouter.get('/', handle((req, res) => {
  res.json(readCart(req.user.id))
}))

cartRouter.post('/items', handle((req, res) => {
  const body = req.body ?? {}
  const productId = requiredInt(body.product_id, 'Produkt', 1)
  const quantity = body.quantity === undefined ? 1 : requiredInt(body.quantity, 'Ilość', 1)
  const database = getDatabase()
  const product = database.prepare('SELECT id, name, stock FROM products WHERE id = ?').get(productId)

  if (!product) {
    throw new ApiError(404, 'not_found', 'Nie ma takiego produktu')
  }

  const cartId = getOrCreateCart(req.user.id)
  const existing = database
    .prepare('SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?')
    .get(cartId, productId)
  const nextQuantity = (existing?.quantity ?? 0) + quantity

  if (nextQuantity > product.stock) {
    throw new ApiError(400, 'validation', `Za mało sztuk: ${product.name}`)
  }

  if (existing) {
    database.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(nextQuantity, existing.id)
  } else {
    database.prepare('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)').run(cartId, productId, nextQuantity)
  }

  res.status(201).json(readCart(req.user.id))
}))

cartRouter.patch('/items/:id', handle((req, res) => {
  const itemId = readId(req.params.id)
  const quantity = requiredInt(req.body?.quantity, 'Ilość', 1)
  const cartId = getOrCreateCart(req.user.id)
  const item = findItem(cartId, itemId)

  if (!item) {
    throw new ApiError(404, 'not_found', 'Nie ma takiej pozycji')
  }

  if (quantity > item.stock) {
    throw new ApiError(400, 'validation', `Za mało sztuk: ${item.name}`)
  }

  getDatabase().prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(quantity, itemId)
  res.json(readCart(req.user.id))
}))

cartRouter.delete('/items/:id', handle((req, res) => {
  const itemId = readId(req.params.id)
  const cartId = getOrCreateCart(req.user.id)
  const item = findItem(cartId, itemId)

  if (!item) {
    throw new ApiError(404, 'not_found', 'Nie ma takiej pozycji')
  }

  getDatabase().prepare('DELETE FROM cart_items WHERE id = ?').run(itemId)
  res.json(readCart(req.user.id))
}))
