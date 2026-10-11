<script setup>
import EmptyState from '../components/EmptyState.vue'
</script>

<template>
  <EmptyState title="Brak dostępu" text="Ten widok jest dla administratora. Flaga is_admin siedzi w kolumnie użytkownika.">
    <router-link to="/" class="font-semibold text-copper-dark underline">Wróć do katalogu</router-link>
  </EmptyState>
</template>
