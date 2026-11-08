import { asc, eq } from 'drizzle-orm'
import { connection } from '../db/client.js'
import { categories } from '../db/schema.js'

export function listCategories(tx) {
  return connection(tx)
    .select()
    .from(categories)
    .orderBy(asc(categories.name))
    .all()
}

export function findCategoryBySlug(slug, tx) {
  return connection(tx)
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .get()
}
