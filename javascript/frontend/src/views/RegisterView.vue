<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth, register } from '../state/auth.js'

const router = useRouter()
const error = ref('')
const submitting = ref(false)
const form = reactive({
  name: '',
  email: '',
  password: '',
})

onMounted(() => {
  if (auth.user) {
    router.replace('/')
  }
})

async function onSubmit() {
  error.value = ''
  if (form.name.trim().length < 2) {
    error.value = 'Podaj imię i nazwisko.'
    return
  }
  if (form.name.trim().length > 255 || form.email.trim().length > 255) {
    error.value = 'Imię i email mogą mieć najwyżej 255 znaków.'
    return
  }
  if (form.password.length < 6) {
    error.value = 'Hasło musi mieć co najmniej 6 znaków.'
    return
  }
  submitting.value = true
  try {
    await register(form)
    router.push('/')
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Nie udało się założyć konta.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="grid gap-10 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]">
    <div>
      <h1 class="font-display text-4xl tracking-tight">Rejestracja</h1>
      <p class="mt-3 max-w-sm text-lg">Nowe konto służy do składania zamówień.</p>
    </div>

    <form class="border border-line bg-card p-6" @submit.prevent="onSubmit">
      <label class="block text-sm font-semibold" for="name">Imię i nazwisko</label>
      <input id="name" v-model="form.name" type="text" required maxlength="255" autocomplete="name" class="mt-1 w-full border border-line bg-paper px-3 py-2" />

      <label class="mt-4 block text-sm font-semibold" for="email">Email</label>
      <input id="email" v-model="form.email" type="email" required maxlength="255" autocomplete="email" class="mt-1 w-full border border-line bg-paper px-3 py-2" />

      <label class="mt-4 block text-sm font-semibold" for="password">Hasło</label>
      <input id="password" v-model="form.password" type="password" required minlength="6" autocomplete="new-password" class="mt-1 w-full border border-line bg-paper px-3 py-2" />

      <p v-if="error" class="mt-3 text-sm text-danger" role="alert">{{ error }}</p>

      <button type="submit" class="mt-6 bg-copper px-4 py-2 font-semibold text-paper hover:bg-copper-dark" :disabled="submitting">
        Załóż konto
      </button>
      <p class="mt-4 text-sm">
        Masz już konto?
        <router-link to="/logowanie" class="font-semibold underline">Zaloguj się</router-link>
      </p>
    </form>
  </section>
</template>
