<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import ApiNotice from '../components/ApiNotice.vue'
import EmptyState from '../components/EmptyState.vue'
import { callApi } from '../lib/api.js'
import { categories, productById } from '../data/catalog.js'

const route = useRoute()
const notice = ref('')
const pending = ref(false)
const fieldError = ref('')

const isNew = computed(() => route.name === 'admin-product-new')
const existing = computed(() => (isNew.value ? null : productById(route.params.id)))

const form = reactive({
  name: existing.value?.name ?? '',
  categoryId: existing.value?.categoryId ?? categories[0].id,
  description: existing.value?.description ?? '',
  price: existing.value ? (existing.value.priceCents / 100).toFixed(2) : '',
  stock: existing.value?.stock ?? 1,
})

async function onSubmit() {
  fieldError.value = ''
  notice.value = ''

  if (form.name.trim().length < 2) {
    fieldError.value = 'Podaj nazwę.'
    return
  }
  if (form.description.trim().length < 10) {
    fieldError.value = 'Opis musi mieć co najmniej 10 znaków.'
    return
  }
  const price = Number(String(form.price).replace(',', '.'))
  if (!Number.isFinite(price) || price <= 0) {
    fieldError.value = 'Podaj cenę większą od zera.'
    return
  }
  const stock = Number(form.stock)
  if (!Number.isInteger(stock) || stock < 0) {
    fieldError.value = 'Stan magazynowy musi być liczbą całkowitą od zera.'
    return
  }

  const payload = {
    name: form.name.trim(),
    category_id: Number(form.categoryId),
    description: form.description.trim(),
    price_cents: Math.round(price * 100),
    stock,
  }

  pending.value = true
  const path = isNew.value ? '/api/products' : `/api/products/${existing.value.id}`
  const result = await callApi(path, {
    method: isNew.value ? 'POST' : 'PATCH',
    body: JSON.stringify(payload),
  })
  notice.value = result.ok ? 'Zapisane.' : result.message
  pending.value = false
}
</script>

<template>
  <EmptyState v-if="!isNew && !existing" title="Nie ma takiego produktu" text="Wróć do listy w panelu.">
    <router-link to="/admin/produkty" class="font-semibold text-copper-dark underline">Lista produktów</router-link>
  </EmptyState>

  <section v-else class="max-w-xl">
    <p class="text-sm">
      <router-link to="/admin/produkty" class="underline">Wróć do listy</router-link>
    </p>
    <h1 class="mt-3 font-display text-4xl tracking-tight">
      {{ isNew ? 'Nowy produkt' : 'Edycja produktu' }}
    </h1>

    <form class="mt-6 space-y-4" @submit.prevent="onSubmit">
      <div>
        <label class="block text-sm font-semibold" for="name">Nazwa</label>
        <input id="name" v-model="form.name" required class="mt-1 w-full border border-line bg-card px-3 py-2" />
      </div>
      <div>
        <label class="block text-sm font-semibold" for="category">Kategoria</label>
        <select id="category" v-model="form.categoryId" class="mt-1 w-full border border-line bg-card px-3 py-2">
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-semibold" for="description">Opis</label>
        <textarea id="description" v-model="form.description" rows="4" required class="mt-1 w-full border border-line bg-card px-3 py-2"></textarea>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="block text-sm font-semibold" for="price">Cena (zł)</label>
          <input id="price" v-model="form.price" inputmode="decimal" required class="mt-1 w-full border border-line bg-card px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm font-semibold" for="stock">Stan</label>
          <input id="stock" v-model.number="form.stock" type="number" min="0" step="1" required class="mt-1 w-full border border-line bg-card px-3 py-2" />
        </div>
      </div>

      <p v-if="fieldError" class="text-sm text-danger" role="alert">{{ fieldError }}</p>
      <ApiNotice :message="notice" />

      <button type="submit" class="bg-copper px-4 py-2 font-semibold text-paper hover:bg-copper-dark disabled:opacity-60" :disabled="pending">
        {{ pending ? 'Wysyłam...' : 'Zapisz' }}
      </button>
    </form>
  </section>
</template>
