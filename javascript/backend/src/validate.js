import { ApiError } from './errors.js'

export function requiredText(value, label) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ApiError(400, 'validation', `Podaj ${label}`)
  }

  return value.trim()
}

export function requiredEmail(value) {
  const email = requiredText(value, 'email').toLowerCase()

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, 'validation', 'Podaj poprawny email')
  }

  return email
}

export function requiredInt(value, label, minimumValue) {
  if (typeof value === 'boolean' || value === null || value === undefined || value === '') {
    throw new ApiError(400, 'validation', `${label} musi być liczbą całkowitą`)
  }

  const number = Number(value)

  if (!Number.isInteger(number) || number < minimumValue) {
    throw new ApiError(400, 'validation', `${label} musi być liczbą całkowitą od ${minimumValue}`)
  }

  return number
}

export function readId(value) {
  const id = Number(value)

  if (!Number.isInteger(id) || id < 1) {
    throw new ApiError(400, 'validation', 'Podaj poprawne id')
  }

  return id
}
