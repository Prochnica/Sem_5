import { Router } from 'express'
import { notImplemented } from '../http.js'

export const categoriesRouter = Router()

categoriesRouter.get('/', notImplemented)
categoriesRouter.get('/:slug', notImplemented)
categoriesRouter.post('/', notImplemented)
categoriesRouter.patch('/:id', notImplemented)
categoriesRouter.delete('/:id', notImplemented)
