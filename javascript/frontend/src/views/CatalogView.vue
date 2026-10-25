<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EmptyState from '../components/EmptyState.vue'
import ProductCard from '../components/ProductCard.vue'
import { catalog, categoryBySlug, loadProductList } from '../state/catalog.js'

const route = useRoute()
const router = useRouter()
const matchingProducts = ref([])
const loading = ref(false)
const error = ref('')
let requestId = 0

const category = computed(() => {
  const slug = route.params.slug
  return typeof slug === 'string' ? categoryBySlug(slug) : null
})

const missingCategory = computed(() => typeof route.params.slug === 'string' && catalog.loaded && !category.value)

const searchText = computed(() => (typeof route.query.search === 'string' ? route.query.search : ''))
const sort = computed(() => (typeof route.query.sort === 'string' ? route.query.sort : ''))

const productCountLabel = computed(() => {
  const productCount = matchingProducts.value.length
  const remainderWhenDividedByTen = productCount % 10
  const remainderWhenDividedByHundred = productCount % 100
  if (productCount === 1) {
    return '1 pozycja'
  }
  if (remainderWhenDividedByTen >= 2 && remainderWhenDividedByTen <= 4 && (remainderWhenDividedByHundred < 12 || remainderWhenDividedByHundred > 14)) {
    return `${productCount} pozycje`
  }
  return `${productCount} pozycji`
})

const heading = computed(() => {
  if (category.value) {
    return category.value.name
  }
  if (searchText.value) {
    return `Wyniki dla „${searchText.value}”`
  }
  return 'Produkty'
})

function onSort(event) {
  const value = event.target.value
  const nextQuery = { ...route.query }
  if (value) {
    nextQuery.sort = value
  } else {
    delete nextQuery.sort
  }
  router.replace({ query: nextQuery })
}

watch(
  () => [route.params.slug, route.query.search, route.query.sort, catalog.loaded],
  async () => {
    if (!catalog.loaded || missingCategory.value) {
      matchingProducts.value = []
      return
    }
    const currentRequest = requestId + 1
    requestId = currentRequest
    loading.value = true
    error.value = ''
    try {
      const products = await loadProductList({
        categorySlug: category.value?.slug,
        searchText: searchText.value,
        sort: sort.value,
      })
      if (currentRequest !== requestId) {
        return
      }
      matchingProducts.value = products
    } catch (cause) {
      if (currentRequest !== requestId) {
        return
      }
      error.value = cause instanceof Error ? cause.message : 'Nie udało się wczytać katalogu.'
      matchingProducts.value = []
    } finally {
      if (currentRequest === requestId) {
        loading.value = false
      }
    }
  },
  { immediate: true },
)
</script>

<template>
  <EmptyState
    v-if="catalog.error"
    title="Nie udało się wczytać katalogu"
    :text="catalog.error"
  />

  <EmptyState
    v-else-if="missingCategory"
    title="Nie ma takiej kategorii"
    text="Wybierz kategorię z paska u góry albo wróć do całego katalogu."
  >
    <router-link to="/" class="font-semibold text-copper-dark underline">Cały katalog</router-link>
  </EmptyState>

  <section v-else>
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="font-display text-4xl tracking-tight">{{ heading }}</h1>
        <p class="mt-2 text-muted">{{ productCountLabel }}</p>
      </div>
      <label class="text-sm">
        <span class="mr-2 text-muted">Sortowanie</span>
        <select :value="sort" class="border border-line bg-card px-3 py-2" @change="onSort">
          <option value="">Kolejność katalogu</option>
          <option value="price_asc">Cena rosnąco</option>
          <option value="price_desc">Cena malejąco</option>
          <option value="name">Nazwa</option>
          <option value="popularity">Popularność</option>
        </select>
      </label>
    </div>

    <p v-if="loading" class="mt-8 text-muted">Wczytywanie...</p>
    <p v-else-if="error" class="mt-8 text-sm text-danger" role="alert">{{ error }}</p>

    <EmptyState
      v-else-if="matchingProducts.length === 0"
      class="mt-8"
      title="Nic nie pasuje"
      text="Zmień frazę albo wyczyść wyszukiwanie."
    >
      <router-link to="/" class="font-semibold text-copper-dark underline">Wyczyść</router-link>
    </EmptyState>

    <ul v-else class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <li v-for="product in matchingProducts" :key="product.id">
        <ProductCard :product="product" />
      </li>
    </ul>
  </section>
</template>
