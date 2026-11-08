import { Router } from 'express'
import { handle } from '../errors.js'
import { listCategories } from '../repositories/categoryRepository.js'
import { getCategoryBySlug } from '../services/categoryService.js'

export const categoriesRouter = Router()

categoriesRouter.get('/', handle((request, response) => {
  response.json(listCategories())
}))

categoriesRouter.get('/:slug', handle((request, response) => {
  response.json(getCategoryBySlug(request.params.slug))
}))
