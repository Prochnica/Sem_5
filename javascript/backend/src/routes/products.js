import { Router } from 'express'
import { notImplemented } from '../http.js'

export const productsRouter = Router()

productsRouter.get('/', notImplemented)
productsRouter.get('/:slug', notImplemented)
productsRouter.post('/', notImplemented)
productsRouter.patch('/:id', notImplemented)
productsRouter.delete('/:id', notImplemented)
