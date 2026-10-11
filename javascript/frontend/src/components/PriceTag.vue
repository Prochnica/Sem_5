<script setup>
import { formatPrice } from '../lib/money.js'

defineProps({
  cents: { type: Number, required: true },
})
</script>

<template>
  <span class="font-display text-2xl leading-none tabular-nums">{{ formatPrice(cents) }}</span>
</template>
