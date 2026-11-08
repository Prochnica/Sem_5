import { ApiError } from '../errors.js'
import { findProductBySlug, incrementProductViews } from '../repositories/productRepository.js'

export function getProductBySlug(slug) {
  const product = findProductBySlug(slug)

  if (!product) {
    throw new ApiError(404, 'not_found', 'Nie ma takiego produktu')
  }

  incrementProductViews(product.id)
  return findProductBySlug(slug)
}
