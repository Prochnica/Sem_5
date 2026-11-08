import { z } from 'zod'
import { passwordSchema, requiredEmailSchema, requiredText } from './fields.js'

export const registerSchema = z.object({
  email: requiredEmailSchema,
  password: passwordSchema,
  name: requiredText('imię'),
})

export const loginSchema = z.object({
  email: requiredEmailSchema,
  password: passwordSchema,
})
