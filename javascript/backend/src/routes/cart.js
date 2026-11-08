import { Router } from 'express'
import { requireUser } from '../auth.js'
import { handle } from '../errors.js'
import { getCart } from '../repositories/cartRepository.js'
import { addCartItemSchema, updateCartItemSchema } from '../schemas/cart.js'
import { idParamsSchema } from '../schemas/fields.js'
import { addCartItem, changeCartItemQuantity, removeCartItem } from '../services/cartService.js'
import { parse } from '../validate.js'

export const cartRouter = Router()

cartRouter.use(requireUser)

cartRouter.get('/', handle((request, response) => {
  response.json(getCart(request.user.id))
}))

cartRouter.post('/items', handle((request, response) => {
  const body = parse(addCartItemSchema, request.body)
  response.status(201).json(addCartItem(request.user.id, body))
}))

cartRouter.patch('/items/:id', handle((request, response) => {
  const { id } = parse(idParamsSchema, request.params)
  const { quantity } = parse(updateCartItemSchema, request.body)
  response.json(changeCartItemQuantity(request.user.id, id, quantity))
}))

cartRouter.delete('/items/:id', handle((request, response) => {
  const { id } = parse(idParamsSchema, request.params)
  response.json(removeCartItem(request.user.id, id))
}))
