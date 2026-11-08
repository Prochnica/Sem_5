import { ApiError } from '../errors.js'
import {
  deleteCartItem,
  findCartItem,
  findCartItemByProduct,
  getCart,
  getOrCreateCart,
  insertCartItem,
  updateCartItemQuantity,
} from '../repositories/cartRepository.js'
import { findProductById } from '../repositories/productRepository.js'

export function addCartItem(userId, { product_id: productId, quantity }) {
  const product = findProductById(productId)

  if (!product) {
    throw new ApiError(404, 'not_found', 'Nie ma takiego produktu')
  }

  const cartId = getOrCreateCart(userId)
  const existing = findCartItemByProduct(cartId, productId)
  const nextQuantity = (existing?.quantity ?? 0) + quantity

  if (nextQuantity > product.stock) {
    throw new ApiError(400, 'validation', `Za mało sztuk: ${product.name}`)
  }

  if (existing) {
    updateCartItemQuantity(existing.id, nextQuantity)
  } else {
    insertCartItem({
      cart_id: cartId,
      product_id: productId,
      quantity: nextQuantity,
    })
  }

  return getCart(userId)
}

export function changeCartItemQuantity(userId, itemId, quantity) {
  const cartId = getOrCreateCart(userId)
  const item = findCartItem(cartId, itemId)

  if (!item) {
    throw new ApiError(404, 'not_found', 'Nie ma takiej pozycji')
  }

  if (quantity > item.stock) {
    throw new ApiError(400, 'validation', `Za mało sztuk: ${item.name}`)
  }

  updateCartItemQuantity(itemId, quantity)
  return getCart(userId)
}

export function removeCartItem(userId, itemId) {
  const cartId = getOrCreateCart(userId)
  const item = findCartItem(cartId, itemId)

  if (!item) {
    throw new ApiError(404, 'not_found', 'Nie ma takiej pozycji')
  }

  deleteCartItem(itemId)
  return getCart(userId)
}
