<script setup>
import { computed, ref } from 'vue'
import { categoryById } from '../state/catalog.js'
import { addCartItem } from '../state/cart.js'
import ProductPrice from './ProductPrice.vue'

const props = defineProps({
  product: { type: Object, required: true },
})

const category = computed(() => categoryById(props.product.categoryId))
const initial = computed(() => props.product.name.slice(0, 1))
const notice = ref('')

function onAdd() {
  const result = addCartItem(props.product.id, 1)
  notice.value = result.ok ? 'Dodane.' : result.message
}
</script>

<template>
  <article class="flex h-full flex-col border border-line bg-card">
    <router-link :to="`/produkt/${product.slug}`" class="block">
      <div
        class="relative flex aspect-[4/3] items-center justify-center overflow-hidden"
        :style="{ background: category?.backgroundColor ?? '#241c16' }"
      >
        <span class="emarket-stripe absolute inset-0"></span>
        <span class="font-display relative text-6xl text-paper">{{ initial }}</span>
      </div>
    </router-link>
    <div class="flex flex-1 flex-col gap-3 p-4">
      <p class="text-sm tracking-wide text-muted uppercase">{{ category?.name }}</p>
      <h2 class="text-xl leading-snug">
        <router-link :to="`/produkt/${product.slug}`" class="hover:text-copper-dark">
          {{ product.name }}
        </router-link>
      </h2>
      <p class="text-sm text-muted">Dostępne: {{ product.stock }} szt.</p>
      <p class="text-sm text-muted">Wyświetlenia: {{ product.views }}</p>
      <div class="mt-auto flex items-end justify-between gap-3 pt-2">
        <ProductPrice :price-cents="product.priceCents" />
        <button type="button" class="bg-copper px-3 py-2 text-sm font-semibold text-paper hover:bg-copper-dark" @click="onAdd">
          Do koszyka
        </button>
      </div>
      <p v-if="notice" class="text-sm" role="status">{{ notice }}</p>
    </div>
  </article>
</template>

<style scoped>
.emarket-stripe {
  background: repeating-linear-gradient(
    135deg,
    transparent,
    transparent 10px,
    rgb(255 255 255 / 0.22) 10px,
    rgb(255 255 255 / 0.22) 11px
  );
}
</style>
