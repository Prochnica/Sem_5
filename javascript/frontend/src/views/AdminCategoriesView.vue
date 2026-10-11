<script setup>
import { reactive, ref } from 'vue'
import ApiNotice from '../components/ApiNotice.vue'
import { callApi } from '../lib/api.js'
import { categories, slugify } from '../data/catalog.js'

const notice = ref('')
const pending = ref(false)
const fieldError = ref('')
const form = reactive({ name: '' })

async function onCreate() {
  fieldError.value = ''
  notice.value = ''
  if (form.name.trim().length < 2) {
    fieldError.value = 'Podaj nazwę kategorii.'
    return
  }

  pending.value = true
  const result = await callApi('/api/categories', {
    method: 'POST',
    body: JSON.stringify({
      name: form.name.trim(),
      slug: slugify(form.name),
    }),
  })
  notice.value = result.ok ? 'Zapisane.' : result.message
  pending.value = false
}

async function onDelete(category) {
  const agreed = window.confirm(`Usunąć kategorię „${category.name}”? Zapis i tak jeszcze nie działa.`)
  if (!agreed) {
    return
  }
  notice.value = ''
  const result = await callApi(`/api/categories/${category.id}`, { method: 'DELETE' })
  notice.value = result.ok ? 'Usunięte.' : result.message
}
</script>

<template>
  <section class="max-w-xl">
    <p class="text-sm">
      <router-link to="/admin/produkty" class="underline">Wróć do produktów</router-link>
    </p>
    <h1 class="mt-3 font-display text-4xl tracking-tight">Kategorie</h1>
    <p class="mt-2 text-sm text-muted">Lista jest przykładowa. Nowa kategoria woła puste API.</p>

    <ul class="mt-6 divide-y divide-line border-y border-line">
      <li v-for="category in categories" :key="category.id" class="flex items-center justify-between gap-3 py-3">
        <span>{{ category.name }}</span>
        <button type="button" class="text-sm underline" @click="onDelete(category)">Usuń</button>
      </li>
    </ul>

    <form class="mt-6" @submit.prevent="onCreate">
      <label class="block text-sm font-semibold" for="category-name">Nowa kategoria</label>
      <div class="mt-1 flex gap-2">
        <input id="category-name" v-model="form.name" required class="min-w-0 flex-1 border border-line bg-card px-3 py-2" />
        <button type="submit" class="bg-copper px-4 py-2 font-semibold text-paper hover:bg-copper-dark disabled:opacity-60" :disabled="pending">
          Dodaj
        </button>
      </div>
      <p v-if="fieldError" class="mt-3 text-sm text-danger" role="alert">{{ fieldError }}</p>
      <ApiNotice class="mt-3" :message="notice" />
    </form>
  </section>
</template>
