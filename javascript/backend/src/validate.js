import { ApiError } from './errors.js'

export function parse(schema, value) {
  const record = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  const parsed = schema.safeParse(record)

  if (!parsed.success) {
    throw new ApiError(400, 'validation', parsed.error.issues[0]?.message || 'Niepoprawne dane')
  }

  return parsed.data
}
