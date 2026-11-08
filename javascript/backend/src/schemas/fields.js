import { z } from 'zod'

export function requiredText(label) {
  const missingMessage = `Podaj ${label}`
  const fieldName = label.charAt(0).toUpperCase() + label.slice(1)
  const tooLongMessage = `${fieldName} może mieć najwyżej 255 znaków`

  return z.unknown().superRefine((value, context) => {
    if (typeof value !== 'string' || value.trim() === '') {
      context.addIssue({ code: 'custom', message: missingMessage })
      return
    }

    if (value.trim().length > 255) {
      context.addIssue({ code: 'custom', message: tooLongMessage })
    }
  }).transform((value) => value.trim())
}

export const requiredEmailSchema = requiredText('email')
  .transform((value) => value.toLowerCase())
  .superRefine((email, context) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      context.addIssue({ code: 'custom', message: 'Podaj poprawny email' })
    }
  })

export const passwordSchema = z.unknown().superRefine((value, context) => {
  if (typeof value !== 'string' || value.length < 6) {
    context.addIssue({ code: 'custom', message: 'Hasło musi mieć co najmniej 6 znaków' })
  }
})

export function requiredInt(label, minimumValue) {
  const typeMessage = `${label} musi być liczbą całkowitą`
  const rangeMessage = `${label} musi być liczbą całkowitą od ${minimumValue}`

  return z.unknown().superRefine((value, context) => {
    if (typeof value === 'boolean' || value === null || value === undefined || value === '') {
      context.addIssue({ code: 'custom', message: typeMessage })
      return
    }

    const number = Number(value)

    if (!Number.isInteger(number) || number < minimumValue) {
      context.addIssue({ code: 'custom', message: rangeMessage })
    }
  }).transform((value) => Number(value))
}

export const idSchema = z.unknown().superRefine((value, context) => {
  const id = Number(value)

  if (!Number.isInteger(id) || id < 1) {
    context.addIssue({ code: 'custom', message: 'Podaj poprawne id' })
  }
}).transform((value) => Number(value))

export const idParamsSchema = z.object({
  id: idSchema,
})
