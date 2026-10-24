import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getDatabase } from './db/database.js'
import { ApiError } from './errors.js'

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

export function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    is_admin: user.is_admin,
  }
}

export function requireUser(req, res, next) {
  const header = req.get('authorization') || ''
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

  const user = getDatabase()
    .prepare('SELECT id, email, name, is_admin FROM users WHERE id = ?')
    .get(userId)

  if (!user) {
    next(new ApiError(401, 'unauthorized', 'Użytkownik nie istnieje'))
    return
  }

  req.user = user
  next()
}
