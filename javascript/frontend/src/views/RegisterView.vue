<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { registerAccount, session } from '../state/session.js'

const router = useRouter()
const error = ref('')
const form = reactive({
  name: '',
  email: '',
  password: '',
})

onMounted(() => {
  if (session.user) {
    router.replace('/')
  }
})

function onSubmit() {
  error.value = ''
  if (form.name.trim().length < 2) {
    error.value = 'Podaj imię i nazwisko.'
    return
  }
  if (form.password.length < 6) {
    error.value = 'Hasło musi mieć co najmniej 6 znaków.'
    return
  }
  const result = registerAccount(form)
  if (!result.ok) {
    error.value = result.message
    return
  }
  router.push('/')
}
</script>

<template>
  <section class="grid gap-10 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]">
    <div>
      <h1 class="font-display text-4xl tracking-tight">Rejestracja</h1>
      <p class="mt-3 max-w-sm text-lg">Nowe konto jest zwykłym klientem. Uprawnienie administratora ustawia się kolumną w bazie.</p>
    </div>

    <form class="border border-line bg-card p-6" @submit.prevent="onSubmit">
      <label class="block text-sm font-semibold" for="name">Imię i nazwisko</label>
      <input id="name" v-model="form.name" type="text" required autocomplete="name" class="mt-1 w-full border border-line bg-paper px-3 py-2" />

      <label class="mt-4 block text-sm font-semibold" for="email">Email</label>
      <input id="email" v-model="form.email" type="email" required autocomplete="email" class="mt-1 w-full border border-line bg-paper px-3 py-2" />

      <label class="mt-4 block text-sm font-semibold" for="password">Hasło</label>
      <input id="password" v-model="form.password" type="password" required minlength="6" autocomplete="new-password" class="mt-1 w-full border border-line bg-paper px-3 py-2" />

      <p v-if="error" class="mt-3 text-sm text-danger" role="alert">{{ error }}</p>

      <button type="submit" class="mt-6 bg-copper px-4 py-2 font-semibold text-paper hover:bg-copper-dark">
        Załóż konto
      </button>
      <p class="mt-4 text-sm">
        Masz już konto?
        <router-link to="/logowanie" class="font-semibold underline">Zaloguj się</router-link>
      </p>
    </form>
  </section>
</template>
