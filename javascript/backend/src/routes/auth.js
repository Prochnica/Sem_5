import { Router } from 'express'
import { checkPassword, hashPassword, publicUser, requireUser, signToken } from '../auth.js'
import { getDatabase } from '../db/database.js'
import { ApiError, handle } from '../errors.js'
import { requiredEmail, requiredText } from '../validate.js'

export const authRouter = Router()

function readPassword(value) {
  if (typeof value !== 'string' || value.length < 6) {
    throw new ApiError(400, 'validation', 'Hasło musi mieć co najmniej 6 znaków')
  }

  return value
}

authRouter.post('/register', handle((req, res) => {
  const body = req.body ?? {}
  const email = requiredEmail(body.email)
  const password = readPassword(body.password)
  const name = requiredText(body.name, 'imię')
  const database = getDatabase()
  const taken = database.prepare('SELECT id FROM users WHERE email = ?').get(email)

  if (taken) {
    throw new ApiError(409, 'conflict', 'Ten email jest już zajęty')
  }

  const created = database.prepare(`
    INSERT INTO users (email, password_hash, name, is_admin, created_at)
    VALUES (?, ?, ?, 0, ?)
  `).run(email, hashPassword(password), name, new Date().toISOString())

  const user = database.prepare('SELECT id, email, name, is_admin FROM users WHERE id = ?').get(Number(created.lastInsertRowid))

  res.status(201).json({
    token: signToken(user.id),
    user: publicUser(user),
  })
}))

authRouter.post('/login', handle((req, res) => {
  const body = req.body ?? {}
  const email = requiredEmail(body.email)
  const password = readPassword(body.password)
  const user = getDatabase()
    .prepare('SELECT id, email, password_hash, name, is_admin FROM users WHERE email = ?')
    .get(email)

  if (!user || !checkPassword(password, user.password_hash)) {
    throw new ApiError(401, 'unauthorized', 'Zły email albo hasło')
  }

  res.json({
    token: signToken(user.id),
    user: publicUser(user),
  })
}))

authRouter.post('/logout', (req, res) => {
  res.status(204).end()
})

authRouter.get('/me', requireUser, (req, res) => {
  res.json(publicUser(req.user))
})
