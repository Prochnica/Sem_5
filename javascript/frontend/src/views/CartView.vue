<script setup>
import { computed } from 'vue'
import EmptyState from '../components/EmptyState.vue'
import PriceTag from '../components/PriceTag.vue'
import QtyStepper from '../components/QtyStepper.vue'
import { formatPrice } from '../lib/money.js'
import { cartLines, cartTotalCents, changeCartQuantity, removeCartItem } from '../state/cart.js'
import { session } from '../state/session.js'

const checkoutTo = computed(() => {
  if (session.user) {
    return '/zamowienie'
  }
  return { path: '/logowanie', query: { next: '/zamowienie' } }
})
</script>

<template>
  <EmptyState v-if="cartLines.length === 0" title="Koszyk jest pusty" text="Dodaj towar z katalogu, a potem złóż zamówienie.">
    <router-link to="/" class="font-semibold text-copper-dark underline">Przeglądaj towary</router-link>
  </EmptyState>

  <section v-else>
    <h1 class="font-display text-4xl tracking-tight">Koszyk</h1>
    <ul class="mt-8 divide-y divide-line border-y border-line">
      <li v-for="line in cartLines" :key="line.product.id" class="flex flex-wrap items-center gap-4 py-4">
        <div class="min-w-0 flex-1">
          <router-link :to="`/produkt/${line.product.slug}`" class="text-lg hover:text-copper-dark">
            {{ line.product.name }}
          </router-link>
          <p class="text-sm text-muted">{{ formatPrice(line.product.priceCents) }} za sztukę</p>
        </div>
        <QtyStepper
          :model-value="line.quantity"
          :max="line.product.stock"
          @update:model-value="changeCartQuantity(line.product.id, $event)"
        />
        <p class="w-28 text-right font-semibold tabular-nums">{{ formatPrice(line.lineCents) }}</p>
        <button type="button" class="text-sm underline" @click="removeCartItem(line.product.id)">Usuń</button>
      </li>
    </ul>

    <div class="mt-6 flex flex-wrap items-center justify-between gap-4">
      <p class="text-lg">
        Razem
        <PriceTag class="ml-2" :cents="cartTotalCents" />
      </p>
      <router-link :to="checkoutTo" class="bg-copper px-4 py-3 font-semibold text-paper hover:bg-copper-dark">
        Złóż zamówienie
      </router-link>
    </div>
    <p v-if="!session.user" class="mt-3 text-sm text-muted">Do złożenia zamówienia trzeba się zalogować.</p>
  </section>
</template>
