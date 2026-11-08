import { sql } from 'drizzle-orm'
import { check, integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  name: text('name').notNull(),
  is_admin: integer('is_admin').notNull().default(0),
  created_at: text('created_at').notNull(),
}, (table) => [
  check('users_is_admin_flag', sql`${table.is_admin} in (0, 1)`),
])

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
})

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  category_id: integer('category_id').notNull().references(() => categories.id),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  price_cents: integer('price_cents').notNull(),
  stock: integer('stock').notNull(),
  views: integer('views').notNull().default(0),
  created_at: text('created_at').notNull(),
}, (table) => [
  check('products_price_non_negative', sql`${table.price_cents} >= 0`),
  check('products_stock_non_negative', sql`${table.stock} >= 0`),
])

export const carts = sqliteTable('carts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id').notNull().unique().references(() => users.id),
})

export const cartItems = sqliteTable('cart_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cart_id: integer('cart_id').notNull().references(() => carts.id),
  product_id: integer('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
}, (table) => [
  unique('cart_items_cart_product_unique').on(table.cart_id, table.product_id),
  check('cart_items_quantity_positive', sql`${table.quantity} > 0`),
])

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id').notNull().references(() => users.id),
  status: text('status').notNull(),
  recipient_name: text('recipient_name').notNull(),
  address_line: text('address_line').notNull(),
  postal_code: text('postal_code').notNull(),
  city: text('city').notNull(),
  total_cents: integer('total_cents').notNull(),
  created_at: text('created_at').notNull(),
}, (table) => [
  check('orders_status_known', sql`${table.status} in ('zlozone', 'w_realizacji', 'wyslane', 'anulowane')`),
  check('orders_total_non_negative', sql`${table.total_cents} >= 0`),
])

export const orderItems = sqliteTable('order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  order_id: integer('order_id').notNull().references(() => orders.id),
  product_id: integer('product_id').notNull().references(() => products.id),
  product_name: text('product_name').notNull(),
  unit_price_cents: integer('unit_price_cents').notNull(),
  quantity: integer('quantity').notNull(),
}, (table) => [
  check('order_items_price_non_negative', sql`${table.unit_price_cents} >= 0`),
  check('order_items_quantity_positive', sql`${table.quantity} > 0`),
])
