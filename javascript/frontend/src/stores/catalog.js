import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../lib/api.js'

const categoryColors = {
  kuchnia: '#8c3f24',
  elektronika: '#2f4a3c',
  dom: '#3d4c6b',
  sport: '#6b3d2a',
}

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

export const useCatalogStore = defineStore('catalog', () => {
  const categories = ref([])
  const products = ref([])
  const loaded = ref(false)
  const error = ref('')

  function rememberProduct(product) {
    const index = products.value.findIndex((item) => item.id === product.id)
    if (index >= 0) {
      products.value[index] = product
      return
    }
    products.value.push(product)
  }

  async function loadCatalog() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('emarket-views')
    }
    try {
      const [categoryRows, productRows] = await Promise.all([
        api('/api/categories'),
        api('/api/products'),
      ])
      categories.value = categoryRows.map(categoryFromApi)
      products.value = productRows.map(productFromApi)
      loaded.value = true
      error.value = ''
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Nie udało się wczytać katalogu.'
    }
  }

  async function loadProductList({ categorySlug, searchText, sort }) {
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
    const nextProducts = rows.map(productFromApi)
    for (const product of nextProducts) {
      rememberProduct(product)
    }
    return nextProducts
  }

  async function loadProductBySlug(slug) {
    const row = await api(`/api/products/${encodeURIComponent(slug)}`)
    const product = productFromApi(row)
    rememberProduct(product)
    return product
  }

  function categoryById(id) {
    return categories.value.find((category) => category.id === id) ?? null
  }

  function categoryBySlug(slug) {
    return categories.value.find((category) => category.slug === slug) ?? null
  }

  function productById(id) {
    return products.value.find((product) => product.id === Number(id)) ?? null
  }

  function productBySlug(slug) {
    return products.value.find((product) => product.slug === slug) ?? null
  }

  return {
    categories,
    products,
    loaded,
    error,
    loadCatalog,
    loadProductList,
    loadProductBySlug,
    categoryById,
    categoryBySlug,
    productById,
    productBySlug,
  }
})
