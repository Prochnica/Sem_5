import { z } from 'zod'
import { requiredInt } from './fields.js'

export const addCartItemSchema = z.object({
  product_id: requiredInt('Produkt', 1),
  quantity: z.preprocess(
    (value) => (value === undefined ? 1 : value),
    requiredInt('Ilość', 1),
  ),
})

export const updateCartItemSchema = z.object({
  quantity: requiredInt('Ilość', 1),
})
