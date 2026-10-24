import { computed, reactive, watch } from 'vue'
import { productById } from '../data/catalog.js'

const storageKey = 'emarket-cart'

function readItems() {
  if (typeof sessionStorage === 'undefined') {
    return []
  }
  try {
    const raw = sessionStorage.getItem(storageKey)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const cart = reactive({
  items: readItems(),
})

watch(
  () => cart.items,
  (items) => {
    if (typeof sessionStorage === 'undefined') {
      return
    }
    sessionStorage.setItem(storageKey, JSON.stringify(items))
  },
  { deep: true },
)

export const cartLineItems = computed(() => {
  return cart.items
    .map((cartItem) => {
      const product = productById(cartItem.productId)
      if (!product) {
        return null
      }
      return {
        product,
        quantity: cartItem.quantity,
        lineTotalCents: product.priceCents * cartItem.quantity,
      }
    })
    .filter(Boolean)
})

export const cartCount = computed(() => {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0)
})

export const cartTotalCents = computed(() => {
  return cartLineItems.value.reduce((sumCents, cartLine) => sumCents + cartLine.lineTotalCents, 0)
})

export function addCartItem(productId, quantity = 1) {
  const product = productById(productId)
  if (!product) {
    return { ok: false, message: 'Nie ma takiego produktu.' }
  }

  const current = cart.items.find((item) => item.productId === product.id)
  const nextQuantity = (current?.quantity ?? 0) + quantity
  if (nextQuantity > product.stock) {
    return { ok: false, message: `Na stanie jest tylko ${product.stock} szt.` }
  }

  if (current) {
    current.quantity = nextQuantity
  } else {
    cart.items.push({ productId: product.id, quantity: nextQuantity })
  }
  return { ok: true }
}

export function changeCartQuantity(productId, quantity) {
  const product = productById(productId)
  const current = cart.items.find((item) => item.productId === productId)
  if (!product || !current) {
    return
  }
  if (quantity < 1) {
    removeCartItem(productId)
    return
  }
  current.quantity = Math.min(product.stock, quantity)
}

export function removeCartItem(productId) {
  const index = cart.items.findIndex((item) => item.productId === productId)
  if (index >= 0) {
    cart.items.splice(index, 1)
  }
}

export function clearCart() {
  cart.items.splice(0, cart.items.length)
}
