<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { catalog } from '../state/catalog.js'
import { cartCount } from '../state/cart.js'
import { auth, logout } from '../state/auth.js'

const route = useRoute()
const router = useRouter()
const searchText = ref(typeof route.query.search === 'string' ? route.query.search : '')

watch(
  () => route.query.search,
  (searchQuery) => {
    searchText.value = typeof searchQuery === 'string' ? searchQuery : ''
  },
)

const accountLabel = computed(() => auth.user?.name ?? 'Logowanie')

function onSearch() {
  const trimmedSearchText = searchText.value.trim()
  router.push({ path: '/', query: trimmedSearchText ? { search: trimmedSearchText } : {} })
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
        <label class="sr-only" for="search">Szukaj produktu</label>
        <input
          id="search"
          v-model="searchText"
          type="search"
          name="search"
          placeholder="Szukaj produktu"
          class="w-full border border-paper/30 bg-paper px-3 py-2 text-ink placeholder:text-muted"
        />
      </form>

      <nav class="ml-auto flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold">
        <router-link to="/koszyk" class="hover:text-copper">Koszyk ({{ cartCount }})</router-link>
        <router-link v-if="auth.user" to="/konto/zamowienia" class="hover:text-copper">Zamówienia</router-link>
        <router-link v-if="!auth.user" to="/logowanie" class="hover:text-copper">{{ accountLabel }}</router-link>
        <span v-else :class="auth.user.is_admin ? 'administrator-name' : 'text-paper/80'">{{ accountLabel }}</span>
        <button v-if="auth.user" type="button" class="hover:text-copper" @click="onLogout">Wyloguj</button>
      </nav>
    </div>
    <nav class="border-t border-paper/15" aria-label="Kategorie">
      <ul class="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-2 text-sm">
        <li v-for="category in catalog.categories" :key="category.id">
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
.administrator-name {
  color: #e23b3b;
}

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
