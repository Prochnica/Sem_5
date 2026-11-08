import { and, asc, eq } from 'drizzle-orm'
import { connection } from '../db/client.js'
import { cartItems, carts, products } from '../db/schema.js'

export function findCartByUserId(userId, tx) {
  return connection(tx)
    .select({ id: carts.id })
    .from(carts)
    .where(eq(carts.user_id, userId))
    .get()
}

export function getOrCreateCart(userId, tx) {
  const existing = findCartByUserId(userId, tx)

  if (existing) {
    return existing.id
  }

  const database = connection(tx)

  try {
    const created = database.insert(carts).values({ user_id: userId }).returning({ id: carts.id }).get()
    return created.id
  } catch (error) {
    const again = findCartByUserId(userId, tx)

    if (again) {
      return again.id
    }

    throw error
  }
}

export function listCartItems(cartId, tx) {
  return connection(tx)
    .select({
      id: cartItems.id,
      product_id: cartItems.product_id,
      quantity: cartItems.quantity,
      name: products.name,
      slug: products.slug,
      unit_price_cents: products.price_cents,
      stock: products.stock,
    })
    .from(cartItems)
    .innerJoin(products, eq(products.id, cartItems.product_id))
    .where(eq(cartItems.cart_id, cartId))
    .orderBy(asc(cartItems.id))
    .all()
}

export function getCart(userId, tx) {
  const cartId = getOrCreateCart(userId, tx)

  return {
    id: cartId,
    items: listCartItems(cartId, tx),
  }
}

export function findCartItem(cartId, itemId, tx) {
  return connection(tx)
    .select({
      id: cartItems.id,
      product_id: cartItems.product_id,
      quantity: cartItems.quantity,
      stock: products.stock,
      name: products.name,
    })
    .from(cartItems)
    .innerJoin(products, eq(products.id, cartItems.product_id))
    .where(and(eq(cartItems.id, itemId), eq(cartItems.cart_id, cartId)))
    .get()
}

export function findCartItemByProduct(cartId, productId, tx) {
  return connection(tx)
    .select({
      id: cartItems.id,
      quantity: cartItems.quantity,
    })
    .from(cartItems)
    .where(and(eq(cartItems.cart_id, cartId), eq(cartItems.product_id, productId)))
    .get()
}

export function insertCartItem(values, tx) {
  connection(tx).insert(cartItems).values(values).run()
}

export function updateCartItemQuantity(itemId, quantity, tx) {
  connection(tx)
    .update(cartItems)
    .set({ quantity })
    .where(eq(cartItems.id, itemId))
    .run()
}

export function deleteCartItem(itemId, tx) {
  connection(tx).delete(cartItems).where(eq(cartItems.id, itemId)).run()
}

export function deleteCartItems(cartId, tx) {
  connection(tx).delete(cartItems).where(eq(cartItems.cart_id, cartId)).run()
}

export function listCartLines(cartId, tx) {
  return connection(tx)
    .select({
      quantity: cartItems.quantity,
      product_id: products.id,
      name: products.name,
      price_cents: products.price_cents,
      stock: products.stock,
    })
    .from(cartItems)
    .innerJoin(products, eq(products.id, cartItems.product_id))
    .where(eq(cartItems.cart_id, cartId))
    .all()
}
