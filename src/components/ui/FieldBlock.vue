<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <label class="flex flex-col gap-2 text-sm text-slate-200">
    <span class="font-medium text-slate-100">{{ label }}</span>
    <slot />
  </label>
</template>
