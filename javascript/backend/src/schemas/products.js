import { z } from 'zod'

const sortValues = ['name', 'price_asc', 'price_desc', 'popularity']
const sortMessage = 'Sortowanie to name, price_asc, price_desc albo popularity'

function optionalQueryText() {
  return z.unknown().optional().transform((value) => (typeof value === 'string' ? value.trim() : ''))
}

export const productListQuerySchema = z.object({
  category: optionalQueryText(),
  search: optionalQueryText(),
  sort: z.unknown().optional().transform((value) => (typeof value === 'string' ? value.trim() : '')).superRefine((sort, context) => {
    if (sort !== '' && !sortValues.includes(sort)) {
      context.addIssue({ code: 'custom', message: sortMessage })
    }
  }),
})
