import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { ApiError } from './errors.js'
import { findPublicUserById } from './repositories/userRepository.js'

const tokenSecret = process.env.JWT_SECRET || 'emarket-dev-secret'

export function hashPassword(password) {
  return bcrypt.hashSync(password, 10)
}

export function checkPassword(password, passwordHash) {
  return bcrypt.compareSync(password, passwordHash)
}

export function signToken(userId) {
  return jwt.sign({ userId }, tokenSecret, { expiresIn: '7d' })
}

export function requireUser(request, response, next) {
  const header = request.get('authorization') || ''
  const match = header.match(/^Bearer (.+)$/i)

  if (!match) {
    next(new ApiError(401, 'unauthorized', 'Zaloguj się'))
    return
  }

  let userId

  try {
    userId = jwt.verify(match[1], tokenSecret).userId
  } catch {
    next(new ApiError(401, 'unauthorized', 'Token jest nieprawidłowy'))
    return
  }

  const user = findPublicUserById(userId)

  if (!user) {
    next(new ApiError(401, 'unauthorized', 'Użytkownik nie istnieje'))
    return
  }

  request.user = user
  next()
}
