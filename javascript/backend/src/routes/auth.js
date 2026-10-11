import { Router } from 'express'
import { notImplemented } from '../http.js'

export const authRouter = Router()

authRouter.post('/register', notImplemented)
authRouter.post('/login', notImplemented)
authRouter.post('/logout', notImplemented)
authRouter.get('/me', notImplemented)
