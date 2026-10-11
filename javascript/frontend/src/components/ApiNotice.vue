<script setup>
defineProps({
  message: { type: String, default: '' },
})
</script>

<template>
  <p v-if="message" class="border border-copper bg-card px-3 py-2 text-sm" role="status">
    {{ message }}
  </p>
</template>
