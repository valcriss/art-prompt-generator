<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
}>()
</script>

<template>
  <section class="glass-panel rounded-[28px] p-5 md:p-6">
    <header v-if="title || subtitle" class="mb-5 space-y-1">
      <h2 v-if="title" class="text-lg font-semibold text-white">{{ title }}</h2>
      <p v-if="subtitle" class="text-sm text-slate-300">{{ subtitle }}</p>
    </header>
    <slot />
  </section>
</template>
