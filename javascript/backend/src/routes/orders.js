import { Router } from 'express'
import { requireUser } from '../auth.js'
import { handle } from '../errors.js'
import { listOrders } from '../repositories/orderRepository.js'
import { idParamsSchema } from '../schemas/fields.js'
import { placeOrderSchema } from '../schemas/orders.js'
import { getOrder, placeOrder } from '../services/orderService.js'
import { parse } from '../validate.js'

export const ordersRouter = Router()

ordersRouter.use(requireUser)

ordersRouter.get('/', handle((request, response) => {
  response.json(listOrders(request.user.id))
}))

ordersRouter.get('/:id', handle((request, response) => {
  const { id } = parse(idParamsSchema, request.params)
  response.json(getOrder(request.user.id, id))
}))

ordersRouter.post('/', handle((request, response) => {
  const body = parse(placeOrderSchema, request.body)
  response.status(201).json(placeOrder(request.user.id, body))
}))
