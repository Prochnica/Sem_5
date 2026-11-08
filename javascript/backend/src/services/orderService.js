import { ApiError } from '../errors.js'
import { getDatabase } from '../db/client.js'
import { deleteCartItems, findCartByUserId, listCartLines } from '../repositories/cartRepository.js'
import { findOrder, insertOrder, insertOrderItem } from '../repositories/orderRepository.js'
import { decreaseProductStock } from '../repositories/productRepository.js'

export function getOrder(userId, orderId) {
  const order = findOrder(userId, orderId)

  if (!order) {
    throw new ApiError(404, 'not_found', 'Nie ma takiego zamówienia')
  }

  return order
}

export function placeOrder(userId, address) {
  const orderId = getDatabase().transaction((tx) => {
    const cart = findCartByUserId(userId, tx)
    const items = cart ? listCartLines(cart.id, tx) : []

    if (items.length === 0) {
      throw new ApiError(400, 'validation', 'Koszyk jest pusty')
    }

    for (const item of items) {
      if (item.quantity > item.stock) {
        throw new ApiError(400, 'validation', `Za mało sztuk: ${item.name}`)
      }
    }

    const totalCents = items.reduce((sum, item) => sum + item.price_cents * item.quantity, 0)
    const createdOrderId = insertOrder({
      user_id: userId,
      status: 'zlozone',
      recipient_name: address.recipient_name,
      address_line: address.address_line,
      postal_code: address.postal_code,
      city: address.city,
      total_cents: totalCents,
      created_at: new Date().toISOString(),
    }, tx)

    for (const item of items) {
      insertOrderItem({
        order_id: createdOrderId,
        product_id: item.product_id,
        product_name: item.name,
        unit_price_cents: item.price_cents,
        quantity: item.quantity,
      }, tx)
      decreaseProductStock(item.product_id, item.quantity, tx)
    }

    deleteCartItems(cart.id, tx)
    return createdOrderId
  }, { behavior: 'immediate' })

  return getOrder(userId, orderId)
}
