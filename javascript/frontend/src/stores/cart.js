import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useCatalogStore } from './catalog.js'

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

export const useCartStore = defineStore('cart', () => {
  const items = ref(readItems())

  watch(
    items,
    (nextItems) => {
      if (typeof sessionStorage === 'undefined') {
        return
      }
      sessionStorage.setItem(storageKey, JSON.stringify(nextItems))
    },
    { deep: true },
  )

  const lineItems = computed(() => {
    const catalog = useCatalogStore()
    return items.value
      .map((cartItem) => {
        const product = catalog.productById(cartItem.productId)
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

  const count = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const totalCents = computed(() => {
    return lineItems.value.reduce((sumCents, cartLine) => sumCents + cartLine.lineTotalCents, 0)
  })

  function addItem(productId, quantity = 1) {
    const catalog = useCatalogStore()
    const product = catalog.productById(productId)
    if (!product) {
      return { ok: false, message: 'Nie ma takiego produktu.' }
    }

    const current = items.value.find((item) => item.productId === product.id)
    const nextQuantity = (current?.quantity ?? 0) + quantity
    if (nextQuantity > product.stock) {
      return { ok: false, message: `Na stanie jest tylko ${product.stock} szt.` }
    }

    if (current) {
      current.quantity = nextQuantity
    } else {
      items.value.push({ productId: product.id, quantity: nextQuantity })
    }
    return { ok: true }
  }

  function removeItem(productId) {
    const index = items.value.findIndex((item) => item.productId === productId)
    if (index >= 0) {
      items.value.splice(index, 1)
    }
  }

  function changeQuantity(productId, quantity) {
    const catalog = useCatalogStore()
    const product = catalog.productById(productId)
    const current = items.value.find((item) => item.productId === productId)
    if (!product || !current) {
      return
    }
    if (quantity < 1) {
      removeItem(productId)
      return
    }
    current.quantity = Math.min(product.stock, quantity)
  }

  function clear() {
    items.value.splice(0, items.value.length)
  }

  return {
    items,
    lineItems,
    count,
    totalCents,
    addItem,
    changeQuantity,
    removeItem,
    clear,
  }
})
