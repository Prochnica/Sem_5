import { Router } from 'express'
import { requireUser } from '../auth.js'
import { handle } from '../errors.js'
import { loginSchema, registerSchema } from '../schemas/auth.js'
import { loginUser, registerUser } from '../services/authService.js'
import { parse } from '../validate.js'

export const authRouter = Router()

authRouter.post('/register', handle((request, response) => {
  const body = parse(registerSchema, request.body)
  response.status(201).json(registerUser(body))
}))

authRouter.post('/login', handle((request, response) => {
  const body = parse(loginSchema, request.body)
  response.json(loginUser(body))
}))

authRouter.post('/logout', (request, response) => {
  response.status(204).end()
})

authRouter.get('/me', requireUser, (request, response) => {
  response.json(request.user)
})
