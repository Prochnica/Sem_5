<script setup>
const props = defineProps({
  modelValue: { type: Number, required: true },
  minimumQuantity: { type: Number, default: 1 },
  maximumQuantity: { type: Number, required: true },
})

const emit = defineEmits(['update:modelValue'])

function setQuantity(nextQuantity) {
  const quantity = Math.min(props.maximumQuantity, Math.max(props.minimumQuantity, nextQuantity))
  emit('update:modelValue', quantity)
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
