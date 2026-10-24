import { Router } from 'express'
import { getDatabase } from '../db/database.js'
import { ApiError, handle } from '../errors.js'

export const categoriesRouter = Router()

function findBySlug(slug) {
  return getDatabase().prepare('SELECT id, name, slug FROM categories WHERE slug = ?').get(slug)
}

categoriesRouter.get('/', handle((req, res) => {
  const categories = getDatabase()
    .prepare('SELECT id, name, slug FROM categories ORDER BY name')
    .all()

  res.json(categories)
}))

categoriesRouter.get('/:slug', handle((req, res) => {
  const category = findBySlug(req.params.slug)

  if (!category) {
    throw new ApiError(404, 'not_found', 'Nie ma takiej kategorii')
  }

  res.json(category)
}))
