<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import EmptyState from '../components/EmptyState.vue'
import ProductPrice from '../components/ProductPrice.vue'
import QuantityStepper from '../components/QuantityStepper.vue'
import { categoryById, loadProductBySlug } from '../state/catalog.js'
import { addCartItem } from '../state/cart.js'

const route = useRoute()
const quantity = ref(1)
const notice = ref('')
const product = ref(null)
const loading = ref(true)
const error = ref('')
let requestId = 0

const category = computed(() => (product.value ? categoryById(product.value.categoryId) : null))
const initial = computed(() => product.value?.name.slice(0, 1) ?? '')

watch(
  () => route.params.slug,
  async (slug) => {
    quantity.value = 1
    notice.value = ''
    const currentRequest = requestId + 1
    requestId = currentRequest
    loading.value = true
    error.value = ''
    product.value = null
    try {
      const loaded = await loadProductBySlug(String(slug ?? ''))
      if (currentRequest !== requestId) {
        return
      }
      product.value = loaded
    } catch (cause) {
      if (currentRequest !== requestId) {
        return
      }
      error.value = cause instanceof Error ? cause.message : 'Nie udało się wczytać produktu.'
    } finally {
      if (currentRequest === requestId) {
        loading.value = false
      }
    }
  },
  { immediate: true },
)

function onAdd() {
  if (!product.value) {
    return
  }
  const result = addCartItem(product.value.id, quantity.value)
  notice.value = result.ok ? 'Dodane do koszyka.' : result.message
}
</script>

<template>
  <p v-if="loading" class="text-muted">Wczytywanie...</p>

  <EmptyState v-else-if="!product" title="Nie ma takiego produktu" :text="error || 'Wróć do katalogu i wybierz inną pozycję.'">
    <router-link to="/" class="font-semibold text-copper-dark underline">Katalog</router-link>
  </EmptyState>

  <article v-else class="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
    <div
      class="relative flex min-h-80 items-center justify-center overflow-hidden"
      :style="{ background: category?.backgroundColor ?? '#241c16' }"
    >
      <span class="emarket-stripe absolute inset-0"></span>
      <span class="font-display relative text-8xl text-paper">{{ initial }}</span>
    </div>

    <div>
      <p class="text-sm tracking-wide text-muted uppercase">{{ category?.name }}</p>
      <h1 class="mt-2 font-display text-4xl tracking-tight">{{ product.name }}</h1>
      <div class="mt-4">
        <ProductPrice :price-cents="product.priceCents" />
      </div>
      <p class="mt-4 max-w-prose text-lg leading-relaxed">{{ product.description }}</p>
      <p class="mt-3 text-sm text-muted">Dostępne: {{ product.stock }} szt.</p>
      <p class="mt-1 text-sm text-muted">Wyświetlenia: {{ product.views }}</p>

      <div class="mt-6 flex flex-wrap items-center gap-3">
        <QuantityStepper v-model="quantity" :maximum-quantity="product.stock" />
        <button type="button" class="bg-copper px-4 py-2 font-semibold text-paper hover:bg-copper-dark" @click="onAdd">
          Dodaj do koszyka
        </button>
      </div>
      <p v-if="notice" class="mt-4 text-sm" role="status">{{ notice }}</p>
    </div>
  </article>
</template>

<style scoped>
.emarket-stripe {
  background: repeating-linear-gradient(
    135deg,
    transparent,
    transparent 12px,
    rgb(255 255 255 / 0.22) 12px,
    rgb(255 255 255 / 0.22) 13px
  );
}
</style>
