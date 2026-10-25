<script setup>
import { onMounted, ref } from 'vue'
import EmptyState from '../components/EmptyState.vue'
import { formatDateFromIsoString, formatPriceFromCents } from '../lib/money.js'
import { statusLabel } from '../lib/orderStatus.js'
import { loadOrders } from '../state/orders.js'

const orders = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    orders.value = await loadOrders()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Nie udało się wczytać zamówień.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section>
    <h1 class="font-display text-4xl tracking-tight">Zamówienia</h1>

    <p v-if="loading" class="mt-8 text-muted">Wczytywanie...</p>
    <p v-else-if="error" class="mt-8 text-sm text-danger" role="alert">{{ error }}</p>

    <EmptyState v-else-if="orders.length === 0" class="mt-8" title="Nie masz jeszcze zamówień" text="Złóż pierwsze z koszyka.">
      <router-link to="/" class="font-semibold text-copper-dark underline">Katalog</router-link>
    </EmptyState>

    <ul v-else class="mt-8 space-y-4">
      <li v-for="order in orders" :key="order.id" class="border border-line bg-card p-4">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <h2 class="font-display text-xl break-all">Zamówienie {{ order.id }}</h2>
          <p class="text-sm text-muted">{{ formatDateFromIsoString(order.createdAt) }}</p>
        </div>
        <p class="mt-1">{{ statusLabel(order.status) }}</p>
        <p class="mt-1 text-sm text-muted">{{ order.addressLine }}, {{ order.postalCode }} {{ order.city }}</p>
        <ul class="mt-3 space-y-1 text-sm">
          <li v-for="item in order.items" :key="item.id">
            {{ item.productName }} × {{ item.quantity }}
          </li>
        </ul>
        <p class="mt-3 font-semibold tabular-nums">{{ formatPriceFromCents(order.totalCents) }}</p>
      </li>
    </ul>
  </section>
</template>
