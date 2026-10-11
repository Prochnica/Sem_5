<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { safeNext } from '../lib/safeNext.js'
import { loginWithPassword, session } from '../state/session.js'

const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')

onMounted(() => {
  if (session.user) {
    router.replace(safeNext(route.query.next))
  }
})

function onSubmit() {
  error.value = ''
  const result = loginWithPassword(email.value, password.value)
  if (!result.ok) {
    error.value = result.message
    return
  }
  router.push(safeNext(route.query.next))
}
</script>

<template>
  <section class="grid gap-10 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]">
    <div>
      <h1 class="font-display text-4xl tracking-tight">Logowanie</h1>
      <p class="mt-3 max-w-sm text-lg">Zamówienie i historia zakupów są dostępne po zalogowaniu.</p>
      <p class="mt-6 text-sm text-muted">
        Konta przykładowe: klient@emarket.test / klient123 oraz admin@emarket.test / admin123.
        To lokalna makieta, nie prawdziwe hasła w bazie.
      </p>
    </div>

    <form class="border border-line bg-card p-6" @submit.prevent="onSubmit">
      <label class="block text-sm font-semibold" for="email">Email</label>
      <input id="email" v-model="email" type="email" required autocomplete="username" class="mt-1 w-full border border-line bg-paper px-3 py-2" />

      <label class="mt-4 block text-sm font-semibold" for="password">Hasło</label>
      <input id="password" v-model="password" type="password" required autocomplete="current-password" class="mt-1 w-full border border-line bg-paper px-3 py-2" />

      <p v-if="error" class="mt-3 text-sm text-danger" role="alert">{{ error }}</p>

      <button type="submit" class="mt-6 bg-copper px-4 py-2 font-semibold text-paper hover:bg-copper-dark">
        Zaloguj
      </button>
      <p class="mt-4 text-sm">
        Nie masz konta?
        <router-link to="/rejestracja" class="font-semibold underline">Zarejestruj się</router-link>
      </p>
    </form>
  </section>
</template>
