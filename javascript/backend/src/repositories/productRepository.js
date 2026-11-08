import { and, asc, desc, eq, like, or, sql } from 'drizzle-orm'
import { connection } from '../db/client.js'
import { categories, products } from '../db/schema.js'

const productColumns = {
  id: products.id,
  category_id: products.category_id,
  name: products.name,
  slug: products.slug,
  description: products.description,
  price_cents: products.price_cents,
  stock: products.stock,
  views: products.views,
  created_at: products.created_at,
}

function orderBySort(sort) {
  if (sort === 'name') {
    return [sql`${products.name} COLLATE NOCASE`]
  }

  if (sort === 'price_asc') {
    return [asc(products.price_cents)]
  }

  if (sort === 'price_desc') {
    return [desc(products.price_cents)]
  }

  if (sort === 'popularity') {
    return [desc(products.views), asc(products.id)]
  }

  return [asc(products.id)]
}

export function listProducts({ category, search, sort }, tx) {
  const filters = []

  if (category) {
    filters.push(eq(categories.slug, category))
  }

  if (search) {
    const pattern = `%${search.replace(/[%_]/g, '')}%`
    filters.push(or(like(products.name, pattern), like(products.description, pattern)))
  }

  let query = connection(tx)
    .select(productColumns)
    .from(products)
    .innerJoin(categories, eq(categories.id, products.category_id))

  if (filters.length > 0) {
    query = query.where(and(...filters))
  }

  return query.orderBy(...orderBySort(sort)).all()
}

export function findProductBySlug(slug, tx) {
  return connection(tx)
    .select(productColumns)
    .from(products)
    .where(eq(products.slug, slug))
    .get()
}

export function findProductById(productId, tx) {
  return connection(tx)
    .select({
      id: products.id,
      name: products.name,
      stock: products.stock,
    })
    .from(products)
    .where(eq(products.id, productId))
    .get()
}

export function incrementProductViews(productId, tx) {
  connection(tx)
    .update(products)
    .set({ views: sql`${products.views} + 1` })
    .where(eq(products.id, productId))
    .run()
}

export function decreaseProductStock(productId, quantity, tx) {
  connection(tx)
    .update(products)
    .set({ stock: sql`${products.stock} - ${quantity}` })
    .where(eq(products.id, productId))
    .run()
}
