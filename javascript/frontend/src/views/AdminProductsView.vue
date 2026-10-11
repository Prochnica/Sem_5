<script setup>
import { categoryById, products } from '../data/catalog.js'
import { formatPrice } from '../lib/money.js'
import { callApi } from '../lib/api.js'
import { ref } from 'vue'
import ApiNotice from '../components/ApiNotice.vue'

const notice = ref('')
const pendingId = ref(null)

async function onDelete(product) {
  const agreed = window.confirm(`Usunąć „${product.name}”? Zapis i tak jeszcze nie działa.`)
  if (!agreed) {
    return
  }
  pendingId.value = product.id
  notice.value = ''
  const result = await callApi(`/api/products/${product.id}`, { method: 'DELETE' })
  notice.value = result.ok ? 'Usunięte.' : result.message
  pendingId.value = null
}
</script>

<template>
  <section>
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="font-display text-4xl tracking-tight">Produkty</h1>
        <p class="mt-2 text-sm text-muted">Lista jest z katalogu przykładowego. Zapis idzie na puste API.</p>
      </div>
      <div class="flex gap-4 text-sm font-semibold">
        <router-link to="/admin/kategorie" class="underline">Kategorie</router-link>
        <router-link to="/admin/produkty/nowy" class="bg-copper px-3 py-2 text-paper hover:bg-copper-dark">
          Nowy produkt
        </router-link>
      </div>
    </div>

    <ApiNotice class="mt-4" :message="notice" />

    <ul class="mt-6 divide-y divide-line border-y border-line">
      <li v-for="product in products" :key="product.id" class="flex flex-wrap items-center gap-3 py-3">
        <div class="min-w-0 flex-1">
          <p class="font-semibold">{{ product.name }}</p>
          <p class="text-sm text-muted">{{ categoryById(product.categoryId)?.name }} · {{ product.stock }} szt.</p>
        </div>
        <p class="tabular-nums">{{ formatPrice(product.priceCents) }}</p>
        <router-link :to="`/admin/produkty/${product.id}`" class="text-sm font-semibold underline">Edytuj</router-link>
        <button
          type="button"
          class="text-sm underline"
          :disabled="pendingId === product.id"
          @click="onDelete(product)"
        >
          Usuń
        </button>
      </li>
    </ul>
  </section>
</template>
