import { z } from 'zod'
import { requiredText } from './fields.js'

export const placeOrderSchema = z.object({
  recipient_name: requiredText('imię odbiorcy'),
  address_line: requiredText('adres'),
  postal_code: requiredText('kod pocztowy'),
  city: requiredText('miasto'),
})
