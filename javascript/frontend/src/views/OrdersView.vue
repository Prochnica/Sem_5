<script setup>
import { computed } from 'vue'
import EmptyState from '../components/EmptyState.vue'
import { formatDateFromIsoString, formatPriceFromCents } from '../lib/money.js'
import { statusLabel } from '../lib/orderStatus.js'
import { ordersForCurrentUser } from '../state/orders.js'

const orders = computed(() => ordersForCurrentUser())
</script>

<template>
  <section>
    <h1 class="font-display text-4xl tracking-tight">Zamówienia</h1>

    <EmptyState v-if="orders.length === 0" class="mt-8" title="Nie masz jeszcze zamówień" text="Złóż pierwsze z koszyka.">
      <router-link to="/" class="font-semibold text-copper-dark underline">Katalog</router-link>
    </EmptyState>

    <ul v-else class="mt-8 space-y-4">
      <li v-for="order in orders" :key="order.id" class="border border-line bg-card p-4">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <h2 class="font-display text-xl break-all">{{ order.id }}</h2>
          <p class="text-sm text-muted">{{ formatDateFromIsoString(order.createdAt) }}</p>
        </div>
        <p class="mt-1">{{ statusLabel(order.status) }}</p>
        <p class="mt-1 text-sm text-muted">{{ order.addressLine }}, {{ order.postalCode }} {{ order.city }}</p>
        <ul class="mt-3 space-y-1 text-sm">
          <li v-for="item in order.items" :key="`${order.id}-${item.productId}`">
            {{ item.productName }} × {{ item.quantity }}
          </li>
        </ul>
        <p class="mt-3 font-semibold tabular-nums">{{ formatPriceFromCents(order.totalCents) }}</p>
      </li>
    </ul>
  </section>
</template>
