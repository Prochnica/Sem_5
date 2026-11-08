import { ApiError } from '../errors.js'
import { findCategoryBySlug } from '../repositories/categoryRepository.js'

export function getCategoryBySlug(slug) {
  const category = findCategoryBySlug(slug)

  if (!category) {
    throw new ApiError(404, 'not_found', 'Nie ma takiej kategorii')
  }

  return category
}
