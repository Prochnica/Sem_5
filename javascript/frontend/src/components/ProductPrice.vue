<script setup>
import { formatPriceFromCents } from '../lib/money.js'

defineProps({
  priceCents: { type: Number, required: true },
})
</script>

<template>
  <span class="font-display text-2xl leading-none tabular-nums">{{ formatPriceFromCents(priceCents) }}</span>
</template>
