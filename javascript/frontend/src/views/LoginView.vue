<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { safeRedirectPath } from '../lib/safeRedirectPath.js'
import { auth, login } from '../state/auth.js'

const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

onMounted(() => {
  if (auth.user) {
    router.replace(safeRedirectPath(route.query.next))
  }
})

async function onSubmit() {
  error.value = ''
  submitting.value = true
  try {
    await login(email.value, password.value)
    router.push(safeRedirectPath(route.query.next))
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Nie udało się zalogować.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="grid gap-10 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]">
    <div>
      <h1 class="font-display text-4xl tracking-tight">Logowanie</h1>
    </div>

    <form class="border border-line bg-card p-6" @submit.prevent="onSubmit">
      <label class="block text-sm font-semibold" for="email">Email</label>
      <input id="email" v-model="email" type="email" required autocomplete="username" class="mt-1 w-full border border-line bg-paper px-3 py-2" />

      <label class="mt-4 block text-sm font-semibold" for="password">Hasło</label>
      <input id="password" v-model="password" type="password" required autocomplete="current-password" class="mt-1 w-full border border-line bg-paper px-3 py-2" />

      <p v-if="error" class="mt-3 text-sm text-danger" role="alert">{{ error }}</p>

      <button type="submit" class="mt-6 bg-copper px-4 py-2 font-semibold text-paper hover:bg-copper-dark" :disabled="submitting">
        Zaloguj
      </button>
      <p class="mt-4 text-sm">
        Nie masz konta?
        <router-link to="/rejestracja" class="font-semibold underline">Zarejestruj się</router-link>
      </p>
    </form>
  </section>
</template>
