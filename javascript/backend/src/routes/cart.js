import { Router } from 'express'
import { notImplemented } from '../http.js'

export const cartRouter = Router()

cartRouter.get('/', notImplemented)
cartRouter.post('/items', notImplemented)
cartRouter.patch('/items/:id', notImplemented)
cartRouter.delete('/items/:id', notImplemented)
