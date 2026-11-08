import { and, asc, desc, eq, inArray } from 'drizzle-orm'
import { connection } from '../db/client.js'
import { orderItems, orders } from '../db/schema.js'

function listOrderItems(orderIds, tx) {
  if (orderIds.length === 0) {
    return []
  }

  return connection(tx)
    .select({
      id: orderItems.id,
      order_id: orderItems.order_id,
      product_id: orderItems.product_id,
      product_name: orderItems.product_name,
      unit_price_cents: orderItems.unit_price_cents,
      quantity: orderItems.quantity,
    })
    .from(orderItems)
    .where(inArray(orderItems.order_id, orderIds))
    .orderBy(asc(orderItems.id))
    .all()
}

function withItems(orderRows, tx) {
  const items = listOrderItems(orderRows.map((order) => order.id), tx)
  const grouped = new Map()

  for (const item of items) {
    const bucket = grouped.get(item.order_id) ?? []
    bucket.push({
      id: item.id,
      product_id: item.product_id,
      product_name: item.product_name,
      unit_price_cents: item.unit_price_cents,
      quantity: item.quantity,
    })
    grouped.set(item.order_id, bucket)
  }

  return orderRows.map((order) => ({
    ...order,
    items: grouped.get(order.id) ?? [],
  }))
}

export function listOrders(userId, tx) {
  const rows = connection(tx)
    .select()
    .from(orders)
    .where(eq(orders.user_id, userId))
    .orderBy(desc(orders.id))
    .all()

  return withItems(rows, tx)
}

export function findOrder(userId, orderId, tx) {
  const order = connection(tx)
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.user_id, userId)))
    .get()

  if (!order) {
    return null
  }

  return withItems([order], tx)[0]
}

export function insertOrder(values, tx) {
  const created = connection(tx)
    .insert(orders)
    .values(values)
    .returning({ id: orders.id })
    .get()

  return created.id
}

export function insertOrderItem(values, tx) {
  connection(tx).insert(orderItems).values(values).run()
}
