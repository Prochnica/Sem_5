<script setup>
import { computed } from 'vue'
import EmptyState from '../components/EmptyState.vue'
import ProductPrice from '../components/ProductPrice.vue'
import QuantityStepper from '../components/QuantityStepper.vue'
import { formatPriceFromCents } from '../lib/money.js'
import { cartLineItems, cartTotalCents, changeCartQuantity, removeCartItem } from '../state/cart.js'
import { session } from '../state/session.js'

const checkoutRoute = computed(() => {
  if (session.user) {
    return '/zamowienie'
  }
  return { path: '/logowanie', query: { next: '/zamowienie' } }
})
</script>

<template>
  <EmptyState v-if="cartLineItems.length === 0" title="Koszyk jest pusty" text="Dodaj produkt z katalogu, a potem złóż zamówienie.">
    <router-link to="/" class="font-semibold text-copper-dark underline">Przeglądaj produkty</router-link>
  </EmptyState>

  <section v-else>
    <h1 class="font-display text-4xl tracking-tight">Koszyk</h1>
    <ul class="mt-8 divide-y divide-line border-y border-line">
      <li v-for="cartLine in cartLineItems" :key="cartLine.product.id" class="flex flex-wrap items-center gap-4 py-4">
        <div class="min-w-0 flex-1">
          <router-link :to="`/produkt/${cartLine.product.slug}`" class="text-lg hover:text-copper-dark">
            {{ cartLine.product.name }}
          </router-link>
          <p class="text-sm text-muted">{{ formatPriceFromCents(cartLine.product.priceCents) }} za sztukę</p>
        </div>
        <QuantityStepper
          :model-value="cartLine.quantity"
          :maximum-quantity="cartLine.product.stock"
          @update:model-value="changeCartQuantity(cartLine.product.id, $event)"
        />
        <p class="w-28 text-right font-semibold tabular-nums">{{ formatPriceFromCents(cartLine.lineTotalCents) }}</p>
        <button type="button" class="text-sm underline" @click="removeCartItem(cartLine.product.id)">Usuń</button>
      </li>
    </ul>

    <div class="mt-6 flex flex-wrap items-center justify-between gap-4">
      <p class="text-lg">
        Razem
        <ProductPrice class="ml-2" :price-cents="cartTotalCents" />
      </p>
      <router-link :to="checkoutRoute" class="bg-copper px-4 py-3 font-semibold text-paper hover:bg-copper-dark">
        Złóż zamówienie
      </router-link>
    </div>
    <p v-if="!session.user" class="mt-3 text-sm text-muted">Do złożenia zamówienia trzeba się zalogować.</p>
  </section>
</template>
