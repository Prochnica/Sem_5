<script setup>
defineProps({
  title: { type: String, required: true },
  text: { type: String, default: '' },
})
</script>

<template>
  <section class="border border-line bg-card px-6 py-10">
    <h1 class="font-display text-4xl tracking-tight">{{ title }}</h1>
    <p v-if="text" class="mt-3 max-w-xl text-lg">{{ text }}</p>
    <div v-if="$slots.default" class="mt-6">
      <slot />
    </div>
  </section>
</template>
