<script setup lang="ts">
const props = defineProps<{
  code: 'en' | 'fr'
  label: string
  active?: boolean
}>()
</script>

<template>
  <button
    class="group flex items-center gap-3 rounded-full border px-3 py-2 transition duration-200"
    :class="
      props.active
        ? 'border-white/30 bg-white text-slate-950 shadow-lg shadow-white/20'
        : 'border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/10'
    "
  >
    <span
      class="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full ring-1"
      :class="props.active ? 'ring-slate-950/10' : 'ring-white/10'"
      aria-hidden="true"
    >
      <svg
        v-if="props.code === 'fr'"
        viewBox="0 0 24 24"
        class="h-full w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="8" height="24" fill="#1B4DB1" />
        <rect x="8" width="8" height="24" fill="#F8FAFC" />
        <rect x="16" width="8" height="24" fill="#D62839" />
      </svg>
      <svg
        v-else
        viewBox="0 0 24 24"
        class="h-full w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id="uk-clip">
            <rect width="24" height="24" rx="12" fill="white" />
          </clipPath>
        </defs>
        <g clip-path="url(#uk-clip)">
          <rect width="24" height="24" fill="#0A2B6B" />
          <path d="M-2 2L8.5 9.2V10.8L-2 18V22H0.8L11 15.1V24H13V15.1L23.2 22H26V18L15.5 10.8V9.2L26 2V-2H23.2L13 4.9V0H11V4.9L0.8-2H-2V2Z" fill="white" />
          <path d="M-2 0.5L9.8 8.6H11.7L-2 19.5V22L12.3 11.1H13.7L26 20.5V18.6L14.2 10.5H12.3L26 -0.5V-2L11.7 8.9H10.3L-2 -0.5V0.5Z" fill="#C8102E" />
          <path d="M9 0H15V24H9V0Z" fill="white" />
          <path d="M0 9H24V15H0V9Z" fill="white" />
          <path d="M10 0H14V24H10V0Z" fill="#C8102E" />
          <path d="M0 10H24V14H0V10Z" fill="#C8102E" />
        </g>
      </svg>
    </span>
    <span class="pr-1 text-xs font-semibold uppercase tracking-[0.24em]">
      {{ props.label }}
    </span>
  </button>
</template>
