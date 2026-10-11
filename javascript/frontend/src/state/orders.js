import { reactive, watch } from 'vue'
import { cartLines, cartTotalCents, clearCart } from './cart.js'
import { session } from './session.js'

const storageKey = 'emarket-orders'
const lastKey = 'emarket-last-order'

const seedOrder = {
  id: 'EM-1042',
  email: 'klient@emarket.test',
  status: 'wyslane',
  recipientName: 'Klient testowy',
  addressLine: 'ul. Prosta 1',
  postalCode: '00-001',
  city: 'Warszawa',
  totalCents: 21800,
  createdAt: '2026-09-28T10:00:00.000Z',
  items: [
    {
      productId: 1,
      productName: 'Czajnik emaliowany 2 l',
      unitPriceCents: 12900,
      quantity: 1,
    },
    {
      productId: 2,
      productName: 'Deska dębowa',
      unitPriceCents: 8900,
      quantity: 1,
    },
  ],
}

function readJson(key, fallback) {
  if (typeof sessionStorage === 'undefined') {
    return fallback
  }
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export const orderBook = reactive({
  list: readJson(storageKey, [seedOrder]),
  lastId: readJson(lastKey, null),
})

watch(
  orderBook,
  (value) => {
    if (typeof sessionStorage === 'undefined') {
      return
    }
    sessionStorage.setItem(storageKey, JSON.stringify(value.list))
    if (value.lastId) {
      sessionStorage.setItem(lastKey, JSON.stringify(value.lastId))
    }
  },
  { deep: true },
)

export function ordersForCurrentUser() {
  if (!session.user) {
    return []
  }
  return orderBook.list.filter((order) => order.email === session.user.email)
}

export function orderById(id) {
  return orderBook.list.find((order) => order.id === id) ?? null
}

export function placeOrder(form) {
  if (!session.user) {
    return { ok: false, message: 'Zamówienie składa zalogowany klient.' }
  }
  if (cartLines.value.length === 0) {
    return { ok: false, message: 'Koszyk jest pusty.' }
  }

  const order = {
    id: `EM-${Math.floor(1000 + Math.random() * 9000)}`,
    email: session.user.email,
    status: 'zlozone',
    recipientName: form.recipientName.trim(),
    addressLine: form.addressLine.trim(),
    postalCode: form.postalCode.trim(),
    city: form.city.trim(),
    totalCents: cartTotalCents.value,
    createdAt: new Date().toISOString(),
    items: cartLines.value.map((line) => ({
      productId: line.product.id,
      productName: line.product.name,
      unitPriceCents: line.product.priceCents,
      quantity: line.quantity,
    })),
  }

  orderBook.list.unshift(order)
  orderBook.lastId = order.id
  clearCart()
  return { ok: true, order }
}
