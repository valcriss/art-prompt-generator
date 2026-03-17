<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <span
    class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs tracking-wide text-slate-200"
  >
    {{ label }}
  </span>
</template>
