import { api } from '../lib/api.js'
import { cartLineItems, clearCart } from './cart.js'
import { loadCatalog } from './catalog.js'

function orderFromApi(row) {
  return {
    id: row.id,
    status: row.status,
    recipientName: row.recipient_name,
    addressLine: row.address_line,
    postalCode: row.postal_code,
    city: row.city,
    totalCents: row.total_cents,
    createdAt: row.created_at,
    items: (row.items ?? []).map((item) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      unitPriceCents: item.unit_price_cents,
      quantity: item.quantity,
    })),
  }
}

export async function loadOrders() {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem('emarket-orders')
    sessionStorage.removeItem('emarket-last-order')
  }
  const rows = await api('/api/orders')
  return rows.map(orderFromApi)
}

export async function loadOrder(orderId) {
  const row = await api(`/api/orders/${orderId}`)
  return orderFromApi(row)
}

async function copyCartToDatabase(lines) {
  const current = await api('/api/cart')
  for (const item of current.items) {
    await api(`/api/cart/items/${item.id}`, { method: 'DELETE' })
  }
  for (const line of lines) {
    await api('/api/cart/items', {
      method: 'POST',
      body: {
        product_id: line.product.id,
        quantity: line.quantity,
      },
    })
  }
}

export async function placeOrder(form) {
  const lines = cartLineItems.value
  if (lines.length === 0) {
    throw new Error('Koszyk jest pusty.')
  }

  await copyCartToDatabase(lines)
  const created = await api('/api/orders', {
    method: 'POST',
    body: {
      recipient_name: form.recipientName.trim(),
      address_line: form.addressLine.trim(),
      postal_code: form.postalCode.trim(),
      city: form.city.trim(),
    },
  })
  clearCart()
  await loadCatalog()
  return orderFromApi(created)
}
