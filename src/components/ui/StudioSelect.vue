<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

type SelectOption = {
  value: string
  label: string
  description?: string
  badge?: string
}

const props = withDefaults(
  defineProps<{
    modelValue?: string
    options: SelectOption[]
    placeholder?: string
    icon?: [string, string]
    clearable?: boolean
    clearLabel?: string
    compact?: boolean
  }>(),
  {
    modelValue: '',
    placeholder: '',
    clearable: false,
    clearLabel: 'Clear selection',
    compact: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const open = ref(false)
const highlightedIndex = ref(-1)
const triggerRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const menuStyle = ref<Record<string, string>>({})

const selectedOption = computed(
  () => props.options.find((option) => option.value === props.modelValue) ?? null,
)

const hasValue = computed(() => Boolean(props.modelValue))

const syncHighlightedIndex = () => {
  if (!props.options.length) {
    highlightedIndex.value = -1
    return
  }

  const selectedIndex = props.options.findIndex((option) => option.value === props.modelValue)
  highlightedIndex.value = selectedIndex >= 0 ? selectedIndex : 0
}

const syncMenuPosition = () => {
  if (!open.value || !triggerRef.value) return

  const rect = triggerRef.value.getBoundingClientRect()

  menuStyle.value = {
    top: `${Math.round(rect.bottom + 8)}px`,
    left: `${Math.round(rect.left)}px`,
    width: `${Math.round(rect.width)}px`,
  }
}

const scrollHighlightedOptionIntoView = () => {
  if (!menuRef.value || highlightedIndex.value < 0) return

  const option = menuRef.value.querySelector<HTMLElement>(
    `[data-option-index="${highlightedIndex.value}"]`,
  )

  if (option && typeof option.scrollIntoView === 'function') {
    option.scrollIntoView({ block: 'nearest' })
  }
}

const openDropdown = async () => {
  if (!props.options.length) return

  open.value = true
  syncHighlightedIndex()
  await nextTick()
  syncMenuPosition()
  scrollHighlightedOptionIntoView()
}

const closeDropdown = () => {
  open.value = false
}

const toggleDropdown = async () => {
  if (open.value) {
    closeDropdown()
    return
  }

  await openDropdown()
}

const selectOption = (option: SelectOption) => {
  emit('update:modelValue', option.value)
  closeDropdown()
}

const clearValue = async () => {
  emit('update:modelValue', '')
  closeDropdown()
  await nextTick()
  triggerRef.value?.focus()
}

const moveHighlight = (direction: -1 | 1) => {
  if (!props.options.length) return

  highlightedIndex.value =
    highlightedIndex.value < 0
      ? 0
      : (highlightedIndex.value + direction + props.options.length) % props.options.length

  nextTick(scrollHighlightedOptionIntoView)
}

const handleKeydown = async (event: KeyboardEvent) => {
  if (event.key === 'ArrowDown') {
    event.preventDefault()

    if (!open.value) {
      await openDropdown()
      return
    }

    moveHighlight(1)
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()

    if (!open.value) {
      await openDropdown()
      return
    }

    moveHighlight(-1)
    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()

    if (!open.value) {
      await openDropdown()
      return
    }

    const option = props.options[highlightedIndex.value]
    if (option) {
      selectOption(option)
    }
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    closeDropdown()
    return
  }

  if (event.key === 'Tab') {
    closeDropdown()
  }
}

const handleDocumentPointerDown = (event: PointerEvent) => {
  const target = event.target as Node | null

  if (!target) return

  if (triggerRef.value?.contains(target) || menuRef.value?.contains(target)) {
    return
  }

  closeDropdown()
}

watch(
  () => props.modelValue,
  () => {
    syncHighlightedIndex()
  },
  { immediate: true },
)

watch(open, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    syncMenuPosition()
    window.addEventListener('resize', syncMenuPosition)
    window.addEventListener('scroll', syncMenuPosition, true)
    document.addEventListener('pointerdown', handleDocumentPointerDown)
    return
  }

  window.removeEventListener('resize', syncMenuPosition)
  window.removeEventListener('scroll', syncMenuPosition, true)
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncMenuPosition)
  window.removeEventListener('scroll', syncMenuPosition, true)
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
})
</script>

<template>
  <div class="relative z-20">
    <button
      ref="triggerRef"
      type="button"
      data-testid="studio-select-trigger"
      class="group flex w-full items-center gap-3 rounded-[22px] border border-white/10 bg-slate-950/70 px-4 text-left text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition hover:bg-slate-950/85 focus:border-glow/40 focus:bg-slate-950/85 focus:outline-none"
      :class="compact ? 'min-h-[3.25rem] py-3' : 'min-h-[3.5rem] py-3'"
      :aria-expanded="open"
      @click="toggleDropdown"
      @keydown="handleKeydown"
    >
      <div
        v-if="icon"
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-300"
      >
        <FontAwesomeIcon :icon="icon" />
      </div>

      <div class="min-w-0 flex-1">
        <p class="truncate text-sm" :class="selectedOption ? 'text-white' : 'text-slate-400'">
          {{ selectedOption?.label || placeholder }}
        </p>
        <p v-if="selectedOption?.description" class="mt-1 truncate text-xs text-slate-500">
          {{ selectedOption.description }}
        </p>
      </div>

      <div class="flex shrink-0 items-center gap-2">
        <span
          v-if="selectedOption?.badge"
          class="rounded-full border border-glow/20 bg-glow/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-glow"
        >
          {{ selectedOption.badge }}
        </span>
        <button
          v-if="clearable && hasValue"
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400 transition hover:bg-white/10 hover:text-slate-200"
          :aria-label="clearLabel"
          @click.stop="clearValue"
        >
          <FontAwesomeIcon :icon="['fas', 'xmark']" />
        </button>
        <FontAwesomeIcon
          :icon="['fas', 'chevron-down']"
          class="text-xs text-slate-400 transition duration-200"
          :class="open ? 'rotate-180 text-slate-200' : ''"
        />
      </div>
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        ref="menuRef"
        data-testid="studio-select-menu"
        class="fixed z-[120] overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/96 p-2 shadow-haze backdrop-blur"
        :style="menuStyle"
      >
        <div class="max-h-72 space-y-1 overflow-auto">
          <button
            v-for="(option, index) in options"
            :key="option.value || `empty-${index}`"
            type="button"
            data-select-option="true"
            :data-option-index="index"
            class="flex w-full items-start justify-between gap-3 rounded-2xl px-3 py-3 text-left text-sm transition"
            :class="
              option.value === modelValue
                ? 'bg-glow/12 text-white'
                : index === highlightedIndex
                  ? 'bg-white/10 text-white'
                  : 'text-slate-300 hover:bg-white/10'
            "
            @mouseenter="highlightedIndex = index"
            @mousedown.prevent="selectOption(option)"
          >
            <div class="min-w-0">
              <p class="truncate">{{ option.label }}</p>
              <p v-if="option.description" class="mt-1 text-xs text-slate-500">
                {{ option.description }}
              </p>
            </div>

            <div class="flex shrink-0 items-center gap-2">
              <span
                v-if="option.badge"
                class="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-400"
              >
                {{ option.badge }}
              </span>
              <FontAwesomeIcon
                v-if="option.value === modelValue"
                :icon="['fas', 'check']"
                class="text-[11px] text-glow"
              />
            </div>
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
