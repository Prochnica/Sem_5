<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EmptyState from '../components/EmptyState.vue'
import ProductCard from '../components/ProductCard.vue'
import { categoryBySlug, filterProducts } from '../data/catalog.js'

const route = useRoute()
const router = useRouter()

const category = computed(() => {
  const slug = route.params.slug
  return typeof slug === 'string' ? categoryBySlug(slug) : null
})

const missingCategory = computed(() => typeof route.params.slug === 'string' && !category.value)

const query = computed(() => (typeof route.query.q === 'string' ? route.query.q : ''))
const sort = computed(() => (typeof route.query.sort === 'string' ? route.query.sort : ''))

const list = computed(() => {
  if (missingCategory.value) {
    return []
  }
  return filterProducts({
    categorySlug: category.value?.slug,
    query: query.value,
    sort: sort.value,
  })
})

const countLabel = computed(() => {
  const count = list.value.length
  const mod10 = count % 10
  const mod100 = count % 100
  if (count === 1) {
    return '1 pozycja'
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} pozycje`
  }
  return `${count} pozycji`
})

const heading = computed(() => {
  if (category.value) {
    return category.value.name
  }
  if (query.value) {
    return `Wyniki dla „${query.value}”`
  }
  return 'Towary'
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
</script>

<template>
  <EmptyState
    v-if="missingCategory"
    title="Nie ma takiej kategorii"
    text="Wybierz kategorię z paska u góry albo wróć do całego katalogu."
  >
    <router-link to="/" class="font-semibold text-copper-dark underline">Cały katalog</router-link>
  </EmptyState>

  <section v-else>
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="font-display text-4xl tracking-tight">{{ heading }}</h1>
        <p class="mt-2 text-muted">{{ countLabel }}</p>
      </div>
      <label class="text-sm">
        <span class="mr-2 text-muted">Sortowanie</span>
        <select :value="sort" class="border border-line bg-card px-3 py-2" @change="onSort">
          <option value="">Kolejność katalogu</option>
          <option value="price_asc">Cena rosnąco</option>
          <option value="price_desc">Cena malejąco</option>
          <option value="name">Nazwa</option>
        </select>
      </label>
    </div>

    <EmptyState
      v-if="list.length === 0"
      class="mt-8"
      title="Nic nie pasuje"
      text="Zmień frazę albo wyczyść wyszukiwanie."
    >
      <router-link to="/" class="font-semibold text-copper-dark underline">Wyczyść</router-link>
    </EmptyState>

    <ul v-else class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <li v-for="product in list" :key="product.id">
        <ProductCard :product="product" />
      </li>
    </ul>
  </section>
</template>
