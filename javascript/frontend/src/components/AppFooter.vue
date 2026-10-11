<script setup>
import { onMounted, ref } from 'vue'

const apiLabel = ref('sprawdzam')

onMounted(async () => {
  try {
    const response = await fetch('/api/health')
    const body = await response.json()
    apiLabel.value = response.ok && body.ok ? 'działa' : 'niedostępne'
  } catch {
    apiLabel.value = 'niedostępne'
  }
})
</script>

<template>
  <footer class="border-t border-line">
    <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-sm text-muted">
      <p>EMarket. Zamówienie składa zalogowany klient.</p>
      <p>Połączenie z API: {{ apiLabel }}</p>
    </div>
  </footer>
</template>
