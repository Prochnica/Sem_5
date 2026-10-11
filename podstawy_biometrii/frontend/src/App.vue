<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { histogram } from './lib/histogram.js'
import { toGrayscale } from './lib/grayscale.js'
import { niblack } from './lib/niblack.js'
import { otsuThreshold } from './lib/otsu.js'
import { drawHistogram, paintMask } from './lib/paint.js'
import { applyThreshold } from './lib/threshold.js'

const MAX_EDGE = 1600

const methods = [
  { id: 'threshold', label: 'Progowa' },
  { id: 'otsu', label: 'Otsu' },
  { id: 'niblack', label: 'Niblack' },
]

const method = ref('threshold')
const threshold = ref(128)
const windowSize = ref(15)
const k = ref(-0.2)
const fileName = ref('')
const errorMessage = ref('')
const hasImage = ref(false)
const shownThreshold = ref(null)

const fileInput = ref(null)
const sourceCanvas = ref(null)
const resultCanvas = ref(null)
const histogramCanvas = ref(null)

let gray = null
let bins = null
let width = 0
let height = 0
let paintFrame = 0

const kLabel = computed(() => Number(k.value).toFixed(2))

const histogramNote = computed(() => {
  if (!hasImage.value) {
    return 'Rozkład jasności pojawi się po wczytaniu obrazu.'
  }
  if (method.value === 'niblack') {
    return 'Niblack liczy próg osobno w każdym oknie: średnia + k * odchylenie. Histogram nie ma jednej kreski.'
  }
  if (method.value === 'otsu') {
    return `Próg Otsu: ${shownThreshold.value}. Piksel jaśniejszy lub równy progowi jest biały.`
  }
  return `Próg: ${threshold.value}. Piksel jaśniejszy lub równy progowi jest biały.`
})

function openFile() {
  fileInput.value?.click()
}

async function onFile(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return

  errorMessage.value = ''
  try {
    const bitmap = await openBitmap(file)
    fileName.value = file.name
    await loadBitmap(bitmap)
    bitmap.close()
  }
  catch {
    errorMessage.value = 'Nie udało się odczytać tego pliku.'
  }
}

async function openBitmap(file) {
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' })
  }
  catch {
    return await createImageBitmap(file)
  }
}

async function loadBitmap(bitmap) {
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  width = Math.max(1, Math.round(bitmap.width * scale))
  height = Math.max(1, Math.round(bitmap.height * scale))
  hasImage.value = true
  await nextTick()

  const canvas = sourceCanvas.value
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d', { willReadFrequently: true })
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(bitmap, 0, 0, width, height)

  gray = toGrayscale(context.getImageData(0, 0, width, height))
  bins = histogram(gray)
  render()
}

function render() {
  if (!gray || !bins || !resultCanvas.value || !histogramCanvas.value) return

  let binary
  let mark = null

  if (method.value === 'otsu') {
    mark = otsuThreshold(gray)
    binary = applyThreshold(gray, mark)
  }
  else if (method.value === 'niblack') {
    binary = niblack(gray, width, height, Number(windowSize.value), Number(k.value))
  }
  else {
    mark = Number(threshold.value)
    binary = applyThreshold(gray, mark)
  }

  shownThreshold.value = mark
  paintMask(resultCanvas.value, binary, width, height)

  if (!drawHistogram(histogramCanvas.value, bins, mark)) {
    requestAnimationFrame(() => {
      if (bins && histogramCanvas.value) {
        drawHistogram(histogramCanvas.value, bins, shownThreshold.value)
      }
    })
  }
}

function scheduleRender() {
  if (!gray) return
  cancelAnimationFrame(paintFrame)
  paintFrame = requestAnimationFrame(render)
}

function savePng() {
  const canvas = resultCanvas.value
  if (!canvas || !hasImage.value) return

  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'wynik.png'
    link.click()
    URL.revokeObjectURL(url)
  }, 'image/png')
}

function onResize() {
  if (!bins || !histogramCanvas.value) return
  drawHistogram(histogramCanvas.value, bins, shownThreshold.value)
}

watch([method, threshold, windowSize, k], scheduleRender)

onMounted(() => {
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  cancelAnimationFrame(paintFrame)
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
            @click="openFile"
          >
            Wczytaj obraz
          </button>
          <button
            type="button"
            class="border border-neutral-400 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!hasImage"
            @click="savePng"
          >
            Zapisz PNG
          </button>
          <span v-if="fileName" class="w-full text-sm text-neutral-600">{{ fileName }}</span>
          <span v-if="errorMessage" class="text-sm text-red-700">{{ errorMessage }}</span>
          <input
            ref="fileInput"
            class="hidden"
            type="file"
            accept="image/*"
            @change="onFile"
          >
        </div>

        <fieldset class="mt-4" :disabled="!hasImage">
          <legend class="text-sm">
            Metoda
          </legend>
          <div class="mt-2 flex flex-wrap gap-4">
            <label v-for="item in methods" :key="item.id" class="flex items-center gap-2 text-sm">
              <input v-model="method" type="radio" name="method" :value="item.id">
              {{ item.label }}
            </label>
          </div>
        </fieldset>

        <div class="mt-4">
          <label v-if="method === 'threshold'" class="flex flex-col gap-2 text-sm sm:flex-row sm:items-center">
            <span class="w-36">Próg: {{ threshold }}</span>
            <input
              v-model.number="threshold"
              class="w-full disabled:opacity-50"
              type="range"
              min="0"
              max="255"
              step="1"
              :disabled="!hasImage"
            >
          </label>

          <p v-else-if="method === 'otsu'" class="text-sm">
            Wyliczony próg: {{ shownThreshold ?? 'po wczytaniu obrazu' }}
          </p>

          <div v-else class="flex flex-col gap-3">
            <label class="flex flex-col gap-2 text-sm sm:flex-row sm:items-center">
              <span class="w-36">Okno: {{ windowSize }} px</span>
              <input
                v-model.number="windowSize"
                class="w-full disabled:opacity-50"
                type="range"
                min="3"
                max="51"
                step="2"
                :disabled="!hasImage"
              >
            </label>
            <label class="flex flex-col gap-2 text-sm sm:flex-row sm:items-center">
              <span class="w-36">k: {{ kLabel }}</span>
              <input
                v-model.number="k"
                class="w-full disabled:opacity-50"
                type="range"
                min="-1"
                max="1"
                step="0.05"
                :disabled="!hasImage"
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
            <canvas v-show="hasImage" ref="sourceCanvas" class="block h-auto w-full" />
            <div v-if="!hasImage" class="flex min-h-64 items-center justify-center px-4 text-center text-sm text-neutral-500">
              Tu pojawi się obraz wejściowy
            </div>
          </div>
        </figure>

        <figure>
          <figcaption class="mb-1 text-sm">
            Wynik
          </figcaption>
          <div class="border border-neutral-300 bg-white">
            <canvas v-show="hasImage" ref="resultCanvas" class="block h-auto w-full" />
            <div v-if="!hasImage" class="flex min-h-64 items-center justify-center px-4 text-center text-sm text-neutral-500">
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
          <canvas v-show="hasImage" ref="histogramCanvas" class="block h-40 w-full" />
          <div v-if="!hasImage" class="flex h-40 items-center justify-center px-4 text-center text-sm text-neutral-500">
            Histogram pojawi się po wczytaniu obrazu
          </div>
        </div>
        <p class="mt-2 text-sm text-neutral-600">
          {{ histogramNote }}
        </p>
      </section>

      <p class="mt-6 text-sm text-neutral-500">
        Skala szarości: 0.299 R + 0.587 G + 0.114 B.
      </p>
    </main>
  </div>
</template>
