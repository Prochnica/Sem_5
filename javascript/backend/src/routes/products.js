import { Router } from 'express'
import { handle } from '../errors.js'
import { listProducts } from '../repositories/productRepository.js'
import { productListQuerySchema } from '../schemas/products.js'
import { getProductBySlug } from '../services/productService.js'
import { parse } from '../validate.js'

export const productsRouter = Router()

productsRouter.get('/', handle((request, response) => {
  response.json(listProducts(parse(productListQuerySchema, request.query)))
}))

productsRouter.get('/:slug', handle((request, response) => {
  response.json(getProductBySlug(request.params.slug))
}))
