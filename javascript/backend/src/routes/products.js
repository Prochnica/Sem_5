import { Router } from 'express'
import { getDatabase } from '../db/database.js'
import { ApiError, handle } from '../errors.js'

export const productsRouter = Router()

const productColumns = `
  products.id,
  products.category_id,
  products.name,
  products.slug,
  products.description,
  products.price_cents,
  products.stock,
  products.views,
  products.created_at
`

const sortSql = {
  name: 'products.name COLLATE NOCASE',
  price_asc: 'products.price_cents ASC',
  price_desc: 'products.price_cents DESC',
  popularity: 'products.views DESC, products.id ASC',
}

function findBySlug(slug) {
  return getDatabase()
    .prepare(`SELECT ${productColumns} FROM products WHERE slug = ?`)
    .get(slug)
}

productsRouter.get('/', handle((req, res) => {
  const whereClauses = []
  const queryParameters = []
  const categorySlug = typeof req.query.category === 'string' ? req.query.category.trim() : ''
  const searchText = typeof req.query.search === 'string' ? req.query.search.trim() : ''
  const sort = typeof req.query.sort === 'string' ? req.query.sort : ''

  if (categorySlug) {
    whereClauses.push('categories.slug = ?')
    queryParameters.push(categorySlug)
  }

  if (searchText) {
    const searchPattern = `%${searchText.replace(/[%_]/g, '')}%`
    whereClauses.push('(products.name LIKE ? OR products.description LIKE ?)')
    queryParameters.push(searchPattern, searchPattern)
  }

  if (sort && !sortSql[sort]) {
    throw new ApiError(400, 'validation', 'Sortowanie to name, price_asc, price_desc albo popularity')
  }

  const products = getDatabase().prepare(`
    SELECT ${productColumns}
    FROM products
    JOIN categories ON categories.id = products.category_id
    ${whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : ''}
    ORDER BY ${sortSql[sort] || 'products.id ASC'}
  `).all(...queryParameters)

  res.json(products)
}))

productsRouter.get('/:slug', handle((req, res) => {
  const product = findBySlug(req.params.slug)

  if (!product) {
    throw new ApiError(404, 'not_found', 'Nie ma takiego produktu')
  }

  getDatabase().prepare('UPDATE products SET views = views + 1 WHERE id = ?').run(product.id)
  res.json(findBySlug(req.params.slug))
}))
