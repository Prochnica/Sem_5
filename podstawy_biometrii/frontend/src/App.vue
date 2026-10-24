<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { zbudujHistogramJasnosci } from './lib/histogram.js'
import { doSkaliSzarosci } from './lib/grayscale.js'
import { zastosujProgNiblacka } from './lib/niblack.js'
import { progOtsu } from './lib/otsu.js'
import { narysujHistogramJasnosci, namalujObrazBinarny } from './lib/paint.js'
import { zastosujProg } from './lib/threshold.js'

const maksymalnaDlugoscKrawedziObrazu = 1600

const metodyBinaryzacji = [
  { id: 'progowa', label: 'Progowa' },
  { id: 'otsu', label: 'Otsu' },
  { id: 'niblack', label: 'Niblack' },
]

const wybranaMetoda = ref('progowa')
const progReczny = ref(128)
const rozmiarOknaNiblacka = ref(15)
const wspolczynnikNiblacka = ref(-0.2)
const nazwaWybranegoPliku = ref('')
const komunikatBledu = ref('')
const czyJestObraz = ref(false)
const wyswietlanyProg = ref(null)

const elementWyboruPliku = ref(null)
const plotnoWejsciowe = ref(null)
const plotnoWynikowe = ref(null)
const plotnoHistogramu = ref(null)

let pikseleWSkaliSzarosci = null
let histogramJasnosci = null
let szerokoscObrazu = 0
let wysokoscObrazu = 0
let identyfikatorKlatkiRenderowania = 0

const etykietaWspolczynnikaNiblacka = computed(() => Number(wspolczynnikNiblacka.value).toFixed(2))

const opisHistogramu = computed(() => {
  if (!czyJestObraz.value) {
    return 'Rozkład jasności pojawi się po wczytaniu obrazu.'
  }
  if (wybranaMetoda.value === 'niblack') {
    return 'Niblack liczy próg osobno w każdym oknie: średnia + k * odchylenie. Histogram nie ma jednej kreski.'
  }
  if (wybranaMetoda.value === 'otsu') {
    return `Próg Otsu: ${wyswietlanyProg.value}. Piksel jaśniejszy lub równy progowi jest biały.`
  }
  return `Próg: ${progReczny.value}. Piksel jaśniejszy lub równy progowi jest biały.`
})

function otworzWyborPliku() {
  elementWyboruPliku.value?.click()
}

async function poWybraniuPliku(zdarzenie) {
  const wybranyPlik = zdarzenie.target.files?.[0]
  zdarzenie.target.value = ''
  if (!wybranyPlik) return

  komunikatBledu.value = ''
  try {
    const bitmapaObrazu = await utworzBitmapeZPliku(wybranyPlik)
    nazwaWybranegoPliku.value = wybranyPlik.name
    await wczytajBitmapeObrazu(bitmapaObrazu)
    bitmapaObrazu.close()
  }
  catch {
    komunikatBledu.value = 'Nie udało się odczytać tego pliku.'
  }
}

async function utworzBitmapeZPliku(wybranyPlik) {
  try {
    return await createImageBitmap(wybranyPlik, { imageOrientation: 'from-image' })
  }
  catch {
    return await createImageBitmap(wybranyPlik)
  }
}

async function wczytajBitmapeObrazu(bitmapaObrazu) {
  const wspolczynnikPomniejszenia = Math.min(1, maksymalnaDlugoscKrawedziObrazu / Math.max(bitmapaObrazu.width, bitmapaObrazu.height))
  szerokoscObrazu = Math.max(1, Math.round(bitmapaObrazu.width * wspolczynnikPomniejszenia))
  wysokoscObrazu = Math.max(1, Math.round(bitmapaObrazu.height * wspolczynnikPomniejszenia))
  czyJestObraz.value = true
  await nextTick()

  const plotnoZrodla = plotnoWejsciowe.value
  plotnoZrodla.width = szerokoscObrazu
  plotnoZrodla.height = wysokoscObrazu
  const kontekstRysowania = plotnoZrodla.getContext('2d', { willReadFrequently: true })
  kontekstRysowania.imageSmoothingEnabled = true
  kontekstRysowania.imageSmoothingQuality = 'high'
  kontekstRysowania.drawImage(bitmapaObrazu, 0, 0, szerokoscObrazu, wysokoscObrazu)

  pikseleWSkaliSzarosci = doSkaliSzarosci(kontekstRysowania.getImageData(0, 0, szerokoscObrazu, wysokoscObrazu))
  histogramJasnosci = zbudujHistogramJasnosci(pikseleWSkaliSzarosci)
  wyrenderujBinaryzacje()
}

function wyrenderujBinaryzacje() {
  if (!pikseleWSkaliSzarosci || !histogramJasnosci || !plotnoWynikowe.value || !plotnoHistogramu.value) return

  let pikseleBinarne
  let poziomProgu = null

  if (wybranaMetoda.value === 'otsu') {
    poziomProgu = progOtsu(pikseleWSkaliSzarosci)
    pikseleBinarne = zastosujProg(pikseleWSkaliSzarosci, poziomProgu)
  }
  else if (wybranaMetoda.value === 'niblack') {
    pikseleBinarne = zastosujProgNiblacka(
      pikseleWSkaliSzarosci,
      szerokoscObrazu,
      wysokoscObrazu,
      Number(rozmiarOknaNiblacka.value),
      Number(wspolczynnikNiblacka.value),
    )
  }
  else {
    poziomProgu = Number(progReczny.value)
    pikseleBinarne = zastosujProg(pikseleWSkaliSzarosci, poziomProgu)
  }

  wyswietlanyProg.value = poziomProgu
  namalujObrazBinarny(plotnoWynikowe.value, pikseleBinarne, szerokoscObrazu, wysokoscObrazu)

  if (!narysujHistogramJasnosci(plotnoHistogramu.value, histogramJasnosci, poziomProgu)) {
    requestAnimationFrame(() => {
      if (histogramJasnosci && plotnoHistogramu.value) {
        narysujHistogramJasnosci(plotnoHistogramu.value, histogramJasnosci, wyswietlanyProg.value)
      }
    })
  }
}

function zaplanujRenderBinaryzacji() {
  if (!pikseleWSkaliSzarosci) return
  cancelAnimationFrame(identyfikatorKlatkiRenderowania)
  identyfikatorKlatkiRenderowania = requestAnimationFrame(wyrenderujBinaryzacje)
}

function zapiszWynikJakoPng() {
  const plotnoWyniku = plotnoWynikowe.value
  if (!plotnoWyniku || !czyJestObraz.value) return

  plotnoWyniku.toBlob((blobPng) => {
    if (!blobPng) return
    const adresPobrania = URL.createObjectURL(blobPng)
    const linkPobrania = document.createElement('a')
    linkPobrania.href = adresPobrania
    linkPobrania.download = 'wynik.png'
    linkPobrania.click()
    URL.revokeObjectURL(adresPobrania)
  }, 'image/png')
}

function przerysujHistogramPoZmianieRozmiaru() {
  if (!histogramJasnosci || !plotnoHistogramu.value) return
  narysujHistogramJasnosci(plotnoHistogramu.value, histogramJasnosci, wyswietlanyProg.value)
}

watch([wybranaMetoda, progReczny, rozmiarOknaNiblacka, wspolczynnikNiblacka], zaplanujRenderBinaryzacji)

onMounted(() => {
  window.addEventListener('resize', przerysujHistogramPoZmianieRozmiaru)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', przerysujHistogramPoZmianieRozmiaru)
  cancelAnimationFrame(identyfikatorKlatkiRenderowania)
})
</script>

<template>
  <div class="min-h-screen bg-neutral-100 text-neutral-900">
    <main class="mx-auto max-w-5xl px-4 py-6">
      <h1 class="text-2xl">
        Podstawy biometrii
      </h1>
      <p class="mt-1 text-neutral-600">
        Binaryzacja
      </p>

      <section class="mt-6 border border-neutral-300 bg-white p-4">
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            class="border border-neutral-400 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50"
            @click="otworzWyborPliku"
          >
            Wczytaj obraz
          </button>
          <button
            type="button"
            class="border border-neutral-400 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!czyJestObraz"
            @click="zapiszWynikJakoPng"
          >
            Zapisz PNG
          </button>
          <span v-if="nazwaWybranegoPliku" class="w-full text-sm text-neutral-600">{{ nazwaWybranegoPliku }}</span>
          <span v-if="komunikatBledu" class="text-sm text-red-700">{{ komunikatBledu }}</span>
          <input
            ref="elementWyboruPliku"
            class="hidden"
            type="file"
            accept="image/*"
            @change="poWybraniuPliku"
          >
        </div>

        <fieldset class="mt-4" :disabled="!czyJestObraz">
          <legend class="text-sm">
            Metoda
          </legend>
          <div class="mt-2 flex flex-wrap gap-4">
            <label v-for="metodaBinaryzacji in metodyBinaryzacji" :key="metodaBinaryzacji.id" class="flex items-center gap-2 text-sm">
              <input v-model="wybranaMetoda" type="radio" name="method" :value="metodaBinaryzacji.id">
              {{ metodaBinaryzacji.label }}
            </label>
          </div>
        </fieldset>

        <div class="mt-4">
          <label v-if="wybranaMetoda === 'progowa'" class="flex flex-col gap-2 text-sm sm:flex-row sm:items-center">
            <span class="w-36">Próg: {{ progReczny }}</span>
            <input
              v-model.number="progReczny"
              class="w-full disabled:opacity-50"
              type="range"
              min="0"
              max="255"
              step="1"
              :disabled="!czyJestObraz"
            >
          </label>

          <p v-else-if="wybranaMetoda === 'otsu'" class="text-sm">
            Wyliczony próg: {{ wyswietlanyProg ?? 'po wczytaniu obrazu' }}
          </p>

          <div v-else class="flex flex-col gap-3">
            <label class="flex flex-col gap-2 text-sm sm:flex-row sm:items-center">
              <span class="w-36">Okno: {{ rozmiarOknaNiblacka }} px</span>
              <input
                v-model.number="rozmiarOknaNiblacka"
                class="w-full disabled:opacity-50"
                type="range"
                min="3"
                max="51"
                step="2"
                :disabled="!czyJestObraz"
              >
            </label>
            <label class="flex flex-col gap-2 text-sm sm:flex-row sm:items-center">
              <span class="w-36">k: {{ etykietaWspolczynnikaNiblacka }}</span>
              <input
                v-model.number="wspolczynnikNiblacka"
                class="w-full disabled:opacity-50"
                type="range"
                min="-1"
                max="1"
                step="0.05"
                :disabled="!czyJestObraz"
              >
            </label>
          </div>
        </div>
      </section>

      <section class="mt-6 grid gap-4 md:grid-cols-2">
        <figure>
          <figcaption class="mb-1 text-sm">
            Wejście
          </figcaption>
          <div class="border border-neutral-300 bg-white">
            <canvas v-show="czyJestObraz" ref="plotnoWejsciowe" class="block h-auto w-full" />
            <div v-if="!czyJestObraz" class="flex min-h-64 items-center justify-center px-4 text-center text-sm text-neutral-500">
              Tu pojawi się obraz wejściowy
            </div>
          </div>
        </figure>

        <figure>
          <figcaption class="mb-1 text-sm">
            Wynik
          </figcaption>
          <div class="border border-neutral-300 bg-white">
            <canvas v-show="czyJestObraz" ref="plotnoWynikowe" class="block h-auto w-full" />
            <div v-if="!czyJestObraz" class="flex min-h-64 items-center justify-center px-4 text-center text-sm text-neutral-500">
              Tu pojawi się obraz po binaryzacji
            </div>
          </div>
        </figure>
      </section>

      <section class="mt-6">
        <h2 class="mb-1 text-sm">
          Histogram skali szarości
        </h2>
        <div class="border border-neutral-300 bg-white">
          <canvas v-show="czyJestObraz" ref="plotnoHistogramu" class="block h-40 w-full" />
          <div v-if="!czyJestObraz" class="flex h-40 items-center justify-center px-4 text-center text-sm text-neutral-500">
            Histogram pojawi się po wczytaniu obrazu
          </div>
        </div>
        <p class="mt-2 text-sm text-neutral-600">
          {{ opisHistogramu }}
        </p>
      </section>

      <p class="mt-6 text-sm text-neutral-500">
        Skala szarości: 0.299 R + 0.587 G + 0.114 B.
      </p>
    </main>
  </div>
</template>
