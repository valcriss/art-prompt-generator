<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

interface Option {
  value: string
  label: string
  group?: string
}

const props = defineProps<{
  modelValue?: string
  options: Option[]
  placeholder?: string
  icon?: [string, string]
  suggestionLabel?: string
  customLabel?: string
  noResultsLabel?: string
  canonicalLabel?: string
  helperText?: string
  featuredCount?: number
  groupLabels?: Partial<Record<string, string>>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const open = ref(false)
const inputValue = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

const selectedOption = computed(() =>
  props.options.find((option) => option.value === (props.modelValue ?? '').trim()),
)

const syncFromModel = () => {
  inputValue.value = selectedOption.value?.label ?? (props.modelValue ?? '')
}

watch(() => props.modelValue, syncFromModel, { immediate: true })
watch(() => props.options, syncFromModel, { deep: true })

const filteredOptions = computed(() => {
  const query = inputValue.value.trim().toLowerCase()
  if (!query) return props.options
  return props.options.filter(
    (option) =>
      option.label.toLowerCase().includes(query) ||
      option.value.toLowerCase().includes(query),
  )
})

const featuredOptions = computed(() => props.options.slice(0, props.featuredCount ?? 4))
const hasCustomValue = computed(() => Boolean(props.modelValue) && !selectedOption.value)
const groupedOptions = computed(() => {
  const groups = new Map<string, Option[]>()

  for (const option of filteredOptions.value) {
    const key = option.group ?? 'default'
    const existing = groups.get(key) ?? []
    existing.push(option)
    groups.set(key, existing)
  }

  return Array.from(groups.entries()).map(([key, options]) => ({
    key,
    label: props.groupLabels?.[key] ?? key,
    options,
  }))
})

const handleBlur = () => {
  if (typeof window === 'undefined') {
    commitTypedValue()
    return
  }
  window.setTimeout(commitTypedValue, 120)
}

const commitTypedValue = () => {
  const typed = inputValue.value.trim()
  const exact = props.options.find(
    (option) =>
      option.label.toLowerCase() === typed.toLowerCase() ||
      option.value.toLowerCase() === typed.toLowerCase(),
  )

  emit('update:modelValue', exact?.value ?? typed)
  syncFromModel()
  open.value = false
}

const selectOption = (option: Option) => {
  emit('update:modelValue', option.value)
  inputValue.value = option.label
  open.value = false
}

const clearValue = () => {
  emit('update:modelValue', '')
  inputValue.value = ''
  open.value = false
  inputRef.value?.focus()
}

const openDropdown = () => {
  open.value = true
  inputRef.value?.focus()
}
</script>

<template>
  <div class="relative z-20 space-y-3 focus-within:z-[70]">
    <div class="relative">
      <div
        class="flex min-h-[3.5rem] items-center gap-3 rounded-[22px] border border-white/10 bg-slate-950/70 px-4 py-3 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition focus-within:border-glow/40 focus-within:bg-slate-950/85"
        @mousedown.prevent="openDropdown"
      >
        <div
          v-if="icon"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-300"
        >
          <FontAwesomeIcon :icon="icon" />
        </div>
        <div class="min-w-0 flex-1">
          <input
            ref="inputRef"
            v-model="inputValue"
            :placeholder="placeholder"
            class="w-full bg-transparent text-white placeholder:text-slate-500 outline-none"
            @focus="openDropdown"
            @input="open = true"
            @blur="handleBlur"
            @keyup.enter.prevent="commitTypedValue"
          />
          <p v-if="helperText" class="mt-1 text-xs text-slate-500">{{ helperText }}</p>
        </div>
        <div v-if="selectedOption || hasCustomValue" class="flex shrink-0 items-center gap-2">
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400 transition hover:bg-white/10 hover:text-slate-200"
            @mousedown.prevent.stop="clearValue"
          >
            <FontAwesomeIcon :icon="['fas', 'xmark']" />
          </button>
          <span
            class="rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.22em]"
            :class="
              selectedOption
                ? 'border-glow/20 bg-glow/10 text-glow'
                : 'border-white/10 bg-white/[0.04] text-slate-300'
            "
          >
            {{ selectedOption ? canonicalLabel : customLabel }}
          </span>
        </div>
      </div>

      <div
        v-if="open"
        class="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[80] rounded-[24px] border border-white/10 bg-slate-950/95 p-2 shadow-haze backdrop-blur"
      >
        <div class="px-3 pb-2 pt-1 text-[10px] uppercase tracking-[0.26em] text-slate-500">
          {{ suggestionLabel }}
        </div>
        <div v-if="groupedOptions.length" class="max-h-64 space-y-3 overflow-auto px-1 pb-1">
          <section v-for="group in groupedOptions" :key="group.key" class="space-y-1">
            <div class="px-3 pt-2 text-[10px] uppercase tracking-[0.24em] text-slate-500">
              {{ group.label }}
            </div>
            <button
              v-for="option in group.options"
              :key="option.value"
              type="button"
              class="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm text-slate-200 transition hover:bg-white/10"
              @mousedown.prevent="selectOption(option)"
            >
              <div class="min-w-0">
                <p class="truncate">{{ option.label }}</p>
                <p class="mt-1 truncate text-xs text-slate-500">{{ option.value }}</p>
              </div>
              <span class="ml-3 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                EN
              </span>
            </button>
          </section>
        </div>
        <div
          v-else
          class="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-slate-400"
        >
          {{ noResultsLabel }}
        </div>
      </div>
    </div>

    <div v-if="featuredOptions.length" class="flex flex-wrap gap-2">
      <button
        v-for="option in featuredOptions"
        :key="option.value"
        type="button"
        class="rounded-full border px-3 py-1.5 text-xs transition"
        :class="
          modelValue === option.value
            ? 'border-glow/20 bg-glow/10 text-glow'
            : 'border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/10'
        "
        @click="selectOption(option)"
      >
        {{ option.label }}
      </button>
    </div>

    <div v-if="selectedOption" class="rounded-2xl border border-glow/15 bg-glow/[0.07] px-3 py-2 text-xs text-slate-300">
      <span class="text-glow">{{ canonicalLabel }}:</span> {{ selectedOption.value }}
    </div>
  </div>
</template>
