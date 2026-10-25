import { reactive } from 'vue'
import { api } from '../lib/api.js'

const categoryColors = {
  kuchnia: '#8c3f24',
  elektronika: '#2f4a3c',
  dom: '#3d4c6b',
  sport: '#6b3d2a',
}

export const catalog = reactive({
  categories: [],
  products: [],
  loaded: false,
  error: '',
})

function categoryFromApi(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    backgroundColor: categoryColors[row.slug] ?? '#241c16',
  }
}

function productFromApi(row) {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    priceCents: row.price_cents,
    stock: row.stock,
    views: row.views,
  }
}

function rememberProduct(product) {
  const index = catalog.products.findIndex((item) => item.id === product.id)
  if (index >= 0) {
    catalog.products[index] = product
    return
  }
  catalog.products.push(product)
}

export async function loadCatalog() {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('emarket-views')
  }
  try {
    const [categories, products] = await Promise.all([
      api('/api/categories'),
      api('/api/products'),
    ])
    catalog.categories = categories.map(categoryFromApi)
    catalog.products = products.map(productFromApi)
    catalog.loaded = true
    catalog.error = ''
  } catch (cause) {
    catalog.error = cause instanceof Error ? cause.message : 'Nie udało się wczytać katalogu.'
  }
}

export async function loadProductList({ categorySlug, searchText, sort }) {
  const params = new URLSearchParams()
  if (categorySlug) {
    params.set('category', categorySlug)
  }
  if (searchText) {
    params.set('search', searchText)
  }
  if (sort) {
    params.set('sort', sort)
  }
  const query = params.toString()
  const rows = await api(`/api/products${query ? `?${query}` : ''}`)
  const products = rows.map(productFromApi)
  for (const product of products) {
    rememberProduct(product)
  }
  return products
}

export async function loadProductBySlug(slug) {
  const row = await api(`/api/products/${encodeURIComponent(slug)}`)
  const product = productFromApi(row)
  rememberProduct(product)
  return product
}

export function categoryById(id) {
  return catalog.categories.find((category) => category.id === id) ?? null
}

export function categoryBySlug(slug) {
  return catalog.categories.find((category) => category.slug === slug) ?? null
}

export function productById(id) {
  return catalog.products.find((product) => product.id === Number(id)) ?? null
}

export function productBySlug(slug) {
  return catalog.products.find((product) => product.slug === slug) ?? null
}
