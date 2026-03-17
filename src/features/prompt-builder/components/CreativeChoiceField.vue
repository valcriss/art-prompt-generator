<script setup lang="ts">
import GuidedCombobox from '../../../components/ui/GuidedCombobox.vue'
import type { AppLocale } from '../../../types/models'

type ChoiceOption = {
  value: string
  label: string
  group?: string
  featured?: boolean
}

const props = defineProps<{
  label: string
  helper: string
  placeholder: string
  icon: [string, string]
  modelValue?: string
  options: ChoiceOption[]
  featuredOptions: ChoiceOption[]
  suggestionLabel: string
  customLabel: string
  noResultsLabel: string
  canonicalLabel: string
  groupLabels: Record<string, string>
  locale: AppLocale
  allowCreate?: boolean
  addActionLabel?: string
  addPromptLabel?: string
  addPromptPlaceholder?: string
  addHelperText?: string
  personalLabel?: string
  defaultLabel?: string
  showPersonalFilter?: boolean
  allOptionsLabel?: string
  personalOnlyLabel?: string
  suggestedGroupLabel?: string
  resolveSuggestedGroup?: (payload: { label: string; value: string }) => string
  targetFieldLabel?: string
  targetFieldValueLabel?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'save-custom': [payload: { label: string; value: string }]
}>()

const applyFeaturedOption = (value: string) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="relative rounded-[26px] border border-white/10 bg-slate-950/35 p-4 focus-within:z-[60]">
    <div class="flex items-start gap-3">
      <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-glow/20 bg-glow/10 text-glow">
        <FontAwesomeIcon :icon="icon" />
      </div>
      <div class="min-w-0">
        <p class="font-medium text-white">{{ label }}</p>
        <p class="mt-1 text-sm leading-6 text-slate-400">{{ helper }}</p>
      </div>
    </div>
    <div v-if="featuredOptions.length" class="mt-4 flex flex-wrap gap-2">
      <button
        v-for="option in featuredOptions"
        :key="`${label}-${option.value}`"
        type="button"
        class="rounded-full border px-3 py-2 text-xs transition"
        :class="
          modelValue === option.value
            ? 'border-glow/30 bg-glow/15 text-glow'
            : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
        "
        @click="applyFeaturedOption(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
    <div class="mt-4">
      <GuidedCombobox
        :model-value="modelValue"
        :options="props.options"
        :placeholder="placeholder"
        :icon="icon"
        :suggestion-label="suggestionLabel"
        :custom-label="customLabel"
        :no-results-label="noResultsLabel"
        :canonical-label="canonicalLabel"
        :featured-options="featuredOptions"
        hide-featured-chips
        :group-labels="groupLabels"
        :helper-text="helper"
        :locale="locale"
        :allow-create="allowCreate"
        :add-action-label="addActionLabel"
        :add-prompt-label="addPromptLabel"
        :add-prompt-placeholder="addPromptPlaceholder"
        :add-helper-text="addHelperText"
        :personal-label="personalLabel"
        :default-label="defaultLabel"
        :show-personal-filter="showPersonalFilter"
        :all-options-label="allOptionsLabel"
        :personal-only-label="personalOnlyLabel"
        :suggested-group-label="suggestedGroupLabel"
        :resolve-suggested-group="resolveSuggestedGroup"
        :target-field-label="targetFieldLabel"
        :target-field-value-label="targetFieldValueLabel"
        @update:model-value="emit('update:modelValue', $event)"
        @save-custom="emit('save-custom', $event)"
      />
    </div>
  </div>
</template>
