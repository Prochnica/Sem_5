<script setup>
import { useRoute } from 'vue-router'
import AppFooter from './components/AppFooter.vue'
import AppHeader from './components/AppHeader.vue'

const route = useRoute()
</script>

<template>
  <div class="flex min-h-screen flex-col bg-paper text-ink">
    <AppHeader />
    <div class="h-[3px] bg-copper"></div>
    <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <router-view :key="route.fullPath" />
    </main>
    <AppFooter />
  </div>
</template>
