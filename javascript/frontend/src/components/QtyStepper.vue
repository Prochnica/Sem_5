<script setup>
const props = defineProps({
  modelValue: { type: Number, required: true },
  min: { type: Number, default: 1 },
  max: { type: Number, required: true },
})

const emit = defineEmits(['update:modelValue'])

function setQuantity(next) {
  const value = Math.min(props.max, Math.max(props.min, next))
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="inline-flex items-center border border-line bg-card">
    <button
      type="button"
      class="px-3 py-2 text-lg leading-none"
      aria-label="Mniej"
      @click="setQuantity(modelValue - 1)"
    >
      −
    </button>
    <span class="min-w-8 text-center tabular-nums">{{ modelValue }}</span>
    <button
      type="button"
      class="px-3 py-2 text-lg leading-none"
      aria-label="Więcej"
      @click="setQuantity(modelValue + 1)"
    >
      +
    </button>
  </div>
</template>
