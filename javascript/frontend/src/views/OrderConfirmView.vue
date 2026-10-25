<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import EmptyState from '../components/EmptyState.vue'
import { formatDateFromIsoString, formatPriceFromCents } from '../lib/money.js'
import { statusLabel } from '../lib/orderStatus.js'
import { loadOrder } from '../state/orders.js'

const route = useRoute()
const order = ref(null)
const loading = ref(true)
const error = ref('')

watch(
  () => route.query.id,
  async (id) => {
    if (typeof id !== 'string' || id === '') {
      order.value = null
      error.value = ''
      loading.value = false
      return
    }
    loading.value = true
    error.value = ''
    try {
      order.value = await loadOrder(id)
    } catch (cause) {
      order.value = null
      error.value = cause instanceof Error ? cause.message : 'Nie udało się wczytać zamówienia.'
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)
</script>

<template>
  <p v-if="loading" class="text-muted">Wczytywanie...</p>

  <EmptyState
    v-else-if="!order"
    title="Brak potwierdzenia"
    :text="error || 'Złóż zamówienie z koszyka, a tutaj pojawi się jego podsumowanie.'"
  >
    <router-link to="/koszyk" class="font-semibold text-copper-dark underline">Koszyk</router-link>
  </EmptyState>

  <section v-else>
    <p class="text-sm tracking-wide text-muted uppercase">Zamówienie przyjęte</p>
    <h1 class="mt-2 font-display text-2xl tracking-tight">Zamówienie {{ order.id }}</h1>
    <p class="mt-3 text-lg">Status: {{ statusLabel(order.status) }}</p>

    <dl class="mt-8 grid gap-4 sm:grid-cols-2">
      <div>
        <dt class="text-sm text-muted">Odbiorca</dt>
        <dd class="break-all">{{ order.recipientName }}</dd>
      </div>
      <div>
        <dt class="text-sm text-muted">Adres</dt>
        <dd class="break-all">{{ order.addressLine }}, {{ order.postalCode }} {{ order.city }}</dd>
      </div>
      <div>
        <dt class="text-sm text-muted">Data</dt>
        <dd>{{ formatDateFromIsoString(order.createdAt) }}</dd>
      </div>
      <div>
        <dt class="text-sm text-muted">Razem</dt>
        <dd class="font-semibold tabular-nums">{{ formatPriceFromCents(order.totalCents) }}</dd>
      </div>
    </dl>

    <ul class="mt-8 divide-y divide-line border-y border-line">
      <li v-for="item in order.items" :key="item.id" class="flex justify-between gap-4 py-3">
        <span>{{ item.productName }} × {{ item.quantity }}</span>
        <span class="tabular-nums">{{ formatPriceFromCents(item.unitPriceCents * item.quantity) }}</span>
      </li>
    </ul>

    <router-link to="/konto/zamowienia" class="mt-6 inline-block font-semibold underline">
      Wszystkie zamówienia
    </router-link>
  </section>
</template>
