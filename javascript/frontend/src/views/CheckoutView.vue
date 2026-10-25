<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import EmptyState from '../components/EmptyState.vue'
import { formatPriceFromCents } from '../lib/money.js'
import { cartLineItems, cartTotalCents } from '../state/cart.js'
import { placeOrder } from '../state/orders.js'
import { auth } from '../state/auth.js'

const router = useRouter()
const error = ref('')
const form = reactive({
  recipientName: auth.user?.name ?? '',
  addressLine: '',
  postalCode: '',
  city: '',
})

function onSubmit() {
  error.value = ''
  if (form.recipientName.trim().length < 2) {
    error.value = 'Podaj imię i nazwisko odbiorcy.'
    return
  }
  if (form.addressLine.trim().length < 3) {
    error.value = 'Podaj adres.'
    return
  }
  if (!/^\d{2}-\d{3}$/.test(form.postalCode.trim())) {
    error.value = 'Kod pocztowy zapisz jako 00-000.'
    return
  }
  if (form.city.trim().length < 2) {
    error.value = 'Podaj miejscowość.'
    return
  }

  const result = placeOrder(form)
  if (!result.ok) {
    error.value = result.message
    return
  }
  router.push('/zamowienie/potwierdzenie')
}
</script>

<template>
  <EmptyState v-if="cartLineItems.length === 0" title="Koszyk jest pusty" text="Nie ma czego zamawiać.">
    <router-link to="/" class="font-semibold text-copper-dark underline">Wróć do katalogu</router-link>
  </EmptyState>

  <section v-else class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
    <form @submit.prevent="onSubmit">
      <h1 class="font-display text-4xl tracking-tight">Adres dostawy</h1>
      <p class="mt-2 text-muted">Płatność jest oznaczona statusem zamówienia. Nie ma bramki płatniczej.</p>

      <label class="mt-6 block text-sm font-semibold" for="recipient">Odbiorca</label>
      <input id="recipient" v-model="form.recipientName" required class="mt-1 w-full border border-line bg-card px-3 py-2" />

      <label class="mt-4 block text-sm font-semibold" for="address">Ulica i numer</label>
      <input id="address" v-model="form.addressLine" required class="mt-1 w-full border border-line bg-card px-3 py-2" />

      <div class="mt-4 grid gap-4 sm:grid-cols-[8rem_minmax(0,1fr)]">
        <div>
          <label class="block text-sm font-semibold" for="postal">Kod pocztowy</label>
          <input id="postal" v-model="form.postalCode" required inputmode="numeric" placeholder="00-000" class="mt-1 w-full border border-line bg-card px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm font-semibold" for="city">Miejscowość</label>
          <input id="city" v-model="form.city" required class="mt-1 w-full border border-line bg-card px-3 py-2" />
        </div>
      </div>

      <p v-if="error" class="mt-4 text-sm text-danger" role="alert">{{ error }}</p>

      <button type="submit" class="mt-6 bg-copper px-4 py-3 font-semibold text-paper hover:bg-copper-dark">
        Potwierdź zamówienie
      </button>
    </form>

    <aside class="h-fit border border-line bg-card p-4">
      <h2 class="font-display text-2xl">Podsumowanie</h2>
      <ul class="mt-4 space-y-3 text-sm">
        <li v-for="cartLine in cartLineItems" :key="cartLine.product.id" class="flex justify-between gap-3">
          <span>{{ cartLine.product.name }} × {{ cartLine.quantity }}</span>
          <span class="tabular-nums">{{ formatPriceFromCents(cartLine.lineTotalCents) }}</span>
        </li>
      </ul>
      <p class="mt-4 flex justify-between border-t border-line pt-3 font-semibold">
        <span>Razem</span>
        <span class="tabular-nums">{{ formatPriceFromCents(cartTotalCents) }}</span>
      </p>
    </aside>
  </section>
</template>
