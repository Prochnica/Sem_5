<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { categories } from '../data/catalog.js'
import { cartCount } from '../state/cart.js'
import { logout, session } from '../state/session.js'

const route = useRoute()
const router = useRouter()
const query = ref(typeof route.query.q === 'string' ? route.query.q : '')

watch(
  () => route.query.q,
  (value) => {
    query.value = typeof value === 'string' ? value : ''
  },
)

const accountLabel = computed(() => session.user?.name ?? 'Logowanie')

function onSearch() {
  const q = query.value.trim()
  router.push({ path: '/', query: q ? { q } : {} })
}

function onLogout() {
  logout()
  router.push('/')
}
</script>

<template>
  <header class="sticky top-0 z-10 bg-ink text-paper">
    <div class="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4">
      <router-link to="/" class="font-display text-3xl leading-none tracking-tight">EMarket</router-link>

      <form class="order-last min-w-[16rem] flex-1 md:order-none" @submit.prevent="onSearch">
        <label class="sr-only" for="search">Szukaj towaru</label>
        <input
          id="search"
          v-model="query"
          type="search"
          name="q"
          placeholder="Szukaj towaru"
          class="w-full border border-paper/30 bg-paper px-3 py-2 text-ink placeholder:text-muted"
        />
      </form>

      <nav class="ml-auto flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold">
        <router-link to="/koszyk" class="hover:text-copper">Koszyk ({{ cartCount }})</router-link>
        <router-link v-if="session.user" to="/konto/zamowienia" class="hover:text-copper">Zamówienia</router-link>
        <router-link v-if="session.user?.isAdmin" to="/admin/produkty" class="hover:text-copper">Panel</router-link>
        <router-link v-if="!session.user" to="/logowanie" class="hover:text-copper">{{ accountLabel }}</router-link>
        <span v-else class="text-paper/80">{{ accountLabel }}</span>
        <button v-if="session.user" type="button" class="hover:text-copper" @click="onLogout">Wyloguj</button>
      </nav>
    </div>
    <nav class="border-t border-paper/15" aria-label="Kategorie">
      <ul class="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-2 text-sm">
        <li v-for="category in categories" :key="category.id">
          <router-link
            :to="`/kategoria/${category.slug}`"
            class="inline-block px-2 py-1 whitespace-nowrap hover:text-copper"
            active-class="text-copper"
          >
            {{ category.name }}
          </router-link>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
