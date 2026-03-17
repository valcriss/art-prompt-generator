<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import BasePanel from '../../../components/ui/BasePanel.vue'
import ChipTag from '../../../components/ui/ChipTag.vue'
import FieldBlock from '../../../components/ui/FieldBlock.vue'
import GuidedCombobox from '../../../components/ui/GuidedCombobox.vue'
import StudioSelect from '../../../components/ui/StudioSelect.vue'
import { usePromptStudio } from '../../../composables/usePromptStudio'
import { suggestCustomGuidedGroup } from '../../../domain/guidedVocabulary'
import { getLocalizedLibraryFieldOptions } from '../../../domain/libraryElementSchema'
import type {
  AppLocale,
  CustomGuidedOption,
  GuidedGroup,
  GuidedVocabularyKey,
} from '../../../types/models'

const studio = reactive(usePromptStudio())
const { t, locale } = useI18n()
const libraryFilterKeys = ['all', 'character', 'location', 'scene', 'composition', 'detail'] as const
const currentLocale = computed(() => locale.value as AppLocale)

const typeOptions = ['character', 'location', 'scene', 'composition', 'detail'] as const
const libraryTypeOptions = computed(() =>
  typeOptions.map((typeOption) => ({
    value: typeOption,
    label: t(`library.${typeOption}`),
  })),
)
const librarySortOptions = computed(() => [
  { value: 'recent', label: t('library.sortRecent') },
  { value: 'name', label: t('library.sortName') },
  { value: 'type', label: t('library.sortType') },
])
const libraryDraftDescriptionLabel = computed(() =>
  studio.libraryDraft.type === 'character'
    ? t('builder.fields.subjectDescription')
    : t('library.description'),
)
const libraryDraftDescriptionPlaceholder = computed(() =>
  studio.libraryDraft.type === 'character'
    ? t('library.structured.character.descriptionPlaceholder')
    : t('library.descriptionPlaceholder'),
)

const fieldOptions = computed(() =>
  Object.fromEntries(
    studio.libraryDraftSchema.map((field) => [
      field.key,
      getLocalizedLibraryFieldOptions(field, currentLocale.value, studio.customGuidedOptions),
    ]),
  ) as Record<string, { value: string; label: string; group?: string }[]>,
)

const addCustomHelperText = computed(() =>
  locale.value === 'fr'
    ? t('builder.guided.addHelperWithPrompt')
    : t('builder.guided.addHelper'),
)
const guidedGroupSortOrder: Record<GuidedGroup, number> = {
  core: 0,
  atmospheric: 1,
  cinematic: 2,
  narrative: 3,
  motion: 4,
}

const sortPersonalVocabulary = (
  options: CustomGuidedOption[],
  mode: 'smart' | 'recent' | 'field' | 'group' | 'name',
) =>
  [...options].sort((left, right) => {
    if (mode === 'recent') {
      return right.updatedAt.localeCompare(left.updatedAt)
    }

    if (mode === 'field') {
      const fieldDelta = guidedFieldLabel(left.key).localeCompare(guidedFieldLabel(right.key))
      if (fieldDelta !== 0) return fieldDelta
      return personalVocabularyLabel(left).localeCompare(personalVocabularyLabel(right))
    }

    if (mode === 'group') {
      const groupDelta = guidedGroupSortOrder[left.group] - guidedGroupSortOrder[right.group]
      if (groupDelta !== 0) return groupDelta
      return personalVocabularyLabel(left).localeCompare(personalVocabularyLabel(right))
    }

    if (mode === 'name') {
      return personalVocabularyLabel(left).localeCompare(personalVocabularyLabel(right))
    }

    const groupDelta = guidedGroupSortOrder[left.group] - guidedGroupSortOrder[right.group]
    if (groupDelta !== 0) return groupDelta

    const fieldDelta = guidedFieldLabel(left.key).localeCompare(guidedFieldLabel(right.key))
    if (fieldDelta !== 0) return fieldDelta

    const dateDelta = right.updatedAt.localeCompare(left.updatedAt)
    if (dateDelta !== 0) return dateDelta

    return personalVocabularyLabel(left).localeCompare(personalVocabularyLabel(right))
  })

const personalVocabulary = computed(() => {
  const query = studio.personalVocabularySearch.trim().toLowerCase()

  const filtered = studio.customGuidedOptions.filter((option) => {
    const matchesGroup =
      studio.personalVocabularyGroupFilter === 'all'
        ? true
        : option.group === studio.personalVocabularyGroupFilter

    const matchesQuery = query
      ? [
          personalVocabularyLabel(option),
          option.value,
          guidedFieldLabel(option.key),
          t(`builder.guided.groups.${option.group}`),
        ].some((value) => value.toLowerCase().includes(query))
      : true

    return matchesGroup && matchesQuery
  })

  return sortPersonalVocabulary(filtered, studio.personalVocabularySort)
})
const editingVocabularyId = ref<string | null>(null)
const editingVocabularyLabel = ref('')
const editingVocabularyValue = ref('')
const editingVocabularyGroup = ref<GuidedGroup>('core')

const guidedGroupOptions = computed(() => [
  { value: 'core', label: t('builder.guided.groups.core') },
  { value: 'atmospheric', label: t('builder.guided.groups.atmospheric') },
  { value: 'cinematic', label: t('builder.guided.groups.cinematic') },
  { value: 'narrative', label: t('builder.guided.groups.narrative') },
  { value: 'motion', label: t('builder.guided.groups.motion') },
])
const personalVocabularyGroupOptions = computed(() => [
  { value: 'all', label: t('library.personalVocabulary.filterAllGroups') },
  ...guidedGroupOptions.value,
])
const personalVocabularySortOptions = computed(() => [
  { value: 'smart', label: t('library.personalVocabulary.sortSmart') },
  { value: 'recent', label: t('library.personalVocabulary.sortRecent') },
  { value: 'field', label: t('library.personalVocabulary.sortField') },
  { value: 'group', label: t('library.personalVocabulary.sortGroup') },
  { value: 'name', label: t('library.personalVocabulary.sortName') },
])

const resolveSuggestedGroupLabel = (key: GuidedVocabularyKey, value: string) =>
  t(`builder.guided.groups.${suggestCustomGuidedGroup(key, value)}`)

const resolveLibrarySuggestedGroup = (fieldKey?: GuidedVocabularyKey) =>
  fieldKey
    ? ({ value }: { label: string; value: string }) => resolveSuggestedGroupLabel(fieldKey, value)
    : undefined

const guidedFieldLabel = (key: GuidedVocabularyKey) => {
  switch (key) {
    case 'subjectType':
      return t('builder.fields.subjectType')
    case 'era':
      return t('builder.fields.era')
    case 'season':
      return t('builder.fields.season')
    case 'weather':
      return t('builder.fields.weather')
    case 'timeOfDay':
      return t('builder.fields.timeOfDay')
    case 'mood':
      return t('builder.fields.mood')
    case 'style':
      return t('builder.fields.style')
    case 'lighting':
      return t('builder.fields.lighting')
    case 'composition':
      return t('builder.fields.composition')
    case 'scenePosition':
      return t('builder.fields.subjectPosition')
    case 'spatialRelation':
      return t('builder.characters.spatialRelation')
    case 'captureDevice':
      return t('builder.fields.captureDevice')
    case 'subjectMotion':
      return t('builder.fields.subjectMotion')
    case 'environmentMotion':
      return t('builder.fields.environmentMotion')
    case 'shotType':
      return t('builder.fields.shotType')
    case 'angle':
      return t('builder.fields.angle')
    case 'movement':
      return t('builder.fields.movement')
    case 'lensFeel':
      return t('builder.fields.lensFeel')
  }
}

const personalVocabularyLabel = (option: CustomGuidedOption) => option.labels[currentLocale.value]

const startEditingVocabularyOption = (option: CustomGuidedOption) => {
  editingVocabularyId.value = option.id
  editingVocabularyLabel.value = personalVocabularyLabel(option)
  editingVocabularyValue.value = option.value
  editingVocabularyGroup.value = option.group
}

const cancelEditingVocabularyOption = () => {
  editingVocabularyId.value = null
  editingVocabularyLabel.value = ''
  editingVocabularyValue.value = ''
  editingVocabularyGroup.value = 'core'
}

const saveEditingVocabularyOption = async () => {
  if (!editingVocabularyId.value) return

  const savedValue = await studio.updateCustomGuidedOption({
    id: editingVocabularyId.value,
    label: editingVocabularyLabel.value,
    value: editingVocabularyValue.value,
    locale: currentLocale.value,
    group: editingVocabularyGroup.value,
  })

  if (!savedValue) return

  cancelEditingVocabularyOption()
}

const saveLibraryCustomGuidedValue = async (
  fieldKey: string,
  guidedKey: GuidedVocabularyKey,
  payload: { label: string; value: string },
) => {
  const savedValue = await studio.addCustomGuidedOption({
    key: guidedKey,
    label: payload.label,
    value: payload.value,
    locale: currentLocale.value,
  })

  if (!savedValue) return

  studio.updateLibraryDraftStructuredValue(fieldKey, savedValue)
}

const libraryShowcaseCards = computed(() => [
  { label: t('library.hero.total'), value: String(studio.libraryCategories.all) },
  { label: t('library.hero.characters'), value: String(studio.libraryCategories.character) },
  { label: t('library.hero.compositions'), value: String(studio.libraryCategories.composition) },
])
</script>

<template>
  <div class="space-y-6">
    <section class="glass-panel overflow-hidden rounded-[32px] px-6 py-6 md:px-7">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-3xl space-y-3">
          <p class="text-xs uppercase tracking-[0.28em] text-glow">{{ t('library.hero.kicker') }}</p>
          <h2 class="font-display text-3xl text-white md:text-4xl">{{ t('library.hero.title') }}</h2>
          <p class="text-sm leading-7 text-slate-300">{{ t('library.hero.subtitle') }}</p>
        </div>
        <div class="grid gap-3 sm:grid-cols-3">
          <div v-for="card in libraryShowcaseCards" :key="card.label" class="rounded-[24px] border border-white/10 bg-white/[0.05] px-4 py-4">
            <p class="text-[10px] uppercase tracking-[0.22em] text-slate-500">{{ card.label }}</p>
            <p class="mt-3 font-display text-2xl text-white">{{ card.value }}</p>
          </div>
        </div>
      </div>
    </section>

    <div class="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
    <BasePanel :title="t('app.library')" :subtitle="t('library.subtitle')">
      <div class="space-y-4">
        <div class="rounded-[28px] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-5 shadow-haze">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div>
              <p class="text-xs uppercase tracking-[0.28em] text-glow">{{ t('app.library') }}</p>
              <p class="mt-2 font-medium text-white">
                {{ studio.libraryDraft.id ? t('library.formEditing') : t('library.formTitle') }}
              </p>
            </div>
            <button v-if="studio.libraryDraft.id" class="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 transition hover:bg-white/10" @click="studio.resetLibraryDraft">
              <FontAwesomeIcon :icon="['fas', 'xmark']" class="mr-2" />
              {{ t('library.cancel') }}
            </button>
          </div>
          <div
            class="grid gap-3"
            :class="studio.libraryDraft.type === 'character' ? '' : 'md:grid-cols-2'"
          >
            <FieldBlock
              :label="t('library.type')"
              :class="studio.libraryDraft.type === 'character' ? 'md:col-span-1' : ''"
            >
              <StudioSelect
                :model-value="studio.libraryDraft.type"
                :options="libraryTypeOptions"
                :icon="['fas', 'layer-group']"
                :placeholder="t('library.type')"
                @update:model-value="
                  studio.setLibraryDraftType($event as (typeof typeOptions)[number])
                "
              />
            </FieldBlock>
            <FieldBlock
              :label="t('library.name')"
              :class="studio.libraryDraft.type === 'character' ? 'md:col-span-1' : ''"
            ><input v-model="studio.libraryDraft.name" class="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-glow/40" /></FieldBlock>
            <div
              v-for="field in studio.libraryDraftSchema"
              :key="`${studio.libraryDraft.type}-${field.key}`"
              :class="studio.libraryDraft.type === 'character' ? 'md:col-span-1' : ''"
            >
              <FieldBlock :label="t(field.labelKey)">
                <GuidedCombobox
                  v-if="fieldOptions[field.key]?.length"
                  :model-value="studio.libraryDraft.structuredValues[field.key]"
                  :options="fieldOptions[field.key]"
                  :placeholder="t(field.placeholderKey)"
                  :icon="field.icon"
                  :suggestion-label="t('builder.guided.suggested')"
                  :custom-label="t('builder.guided.custom')"
                  :no-results-label="t('builder.guided.noResults')"
                  :canonical-label="t('library.structured.token')"
                  :group-labels="{
                    core: t('library.structured.groups.curated'),
                    atmospheric: t('builder.guided.groups.atmospheric'),
                    cinematic: t('builder.guided.groups.cinematic'),
                    narrative: t('builder.guided.groups.narrative'),
                    motion: t('builder.guided.groups.motion'),
                  }"
                  :helper-text="field.helperKey ? t(field.helperKey) : t('library.structured.helper')"
                  :locale="currentLocale"
                  :allow-create="Boolean(field.guidedKey)"
                  :add-action-label="t('builder.guided.addAction')"
                  :add-prompt-label="t('builder.guided.promptLabel')"
                  :add-prompt-placeholder="t('builder.guided.promptPlaceholder')"
                  :add-helper-text="addCustomHelperText"
                  :personal-label="t('builder.guided.personalOption')"
                  :default-label="t('builder.guided.defaultOption')"
                  show-personal-filter
                  :all-options-label="t('builder.guided.allOptions')"
                  :personal-only-label="t('builder.guided.personalOnly')"
                  :suggested-group-label="t('builder.guided.suggestedGroup')"
                  :target-field-label="t(field.labelKey)"
                  :target-field-value-label="t('builder.guided.targetField')"
                  :resolve-suggested-group="resolveLibrarySuggestedGroup(field.guidedKey)"
                  @update:model-value="studio.updateLibraryDraftStructuredValue(field.key, $event)"
                  @save-custom="field.guidedKey && saveLibraryCustomGuidedValue(field.key, field.guidedKey, $event)"
                />
                <textarea
                  v-else-if="studio.libraryDraft.type === 'character' && field.key === 'appearance'"
                  :value="studio.libraryDraft.structuredValues[field.key]"
                  :placeholder="t(field.placeholderKey)"
                  rows="3"
                  class="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-glow/40"
                  @input="studio.updateLibraryDraftStructuredValue(field.key, ($event.target as HTMLTextAreaElement).value)"
                />
                <input
                  v-else
                  :value="studio.libraryDraft.structuredValues[field.key]"
                  :placeholder="t(field.placeholderKey)"
                  class="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-glow/40"
                  @input="studio.updateLibraryDraftStructuredValue(field.key, ($event.target as HTMLInputElement).value)"
                />
              </FieldBlock>
            </div>
            <div :class="studio.libraryDraft.type === 'character' ? '' : 'md:col-span-2'">
              <FieldBlock :label="libraryDraftDescriptionLabel"><textarea v-model="studio.libraryDraft.description" :placeholder="libraryDraftDescriptionPlaceholder" rows="3" class="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-glow/40" /></FieldBlock>
            </div>
            <div :class="studio.libraryDraft.type === 'character' ? '' : 'md:col-span-2'">
              <FieldBlock :label="t('library.tags')"><input v-model="studio.libraryDraft.tagsText" :placeholder="t('library.tagsPlaceholder')" class="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-glow/40" /></FieldBlock>
            </div>
          </div>
          <div v-if="studio.libraryDraftStructuredEntries.length" class="mt-4 rounded-[24px] border border-glow/15 bg-glow/[0.07] p-4">
            <p class="text-xs uppercase tracking-[0.24em] text-glow">{{ t('library.structured.preview') }}</p>
            <div class="mt-3 flex flex-wrap gap-2">
              <ChipTag
                v-for="[key, value] in studio.libraryDraftStructuredEntries"
                :key="`${key}-${value}`"
                :label="`${t(`library.structured.${studio.libraryDraft.type}.${key}`)}: ${value}`"
              />
            </div>
          </div>
          <div class="mt-4 flex flex-wrap gap-3">
            <button class="rounded-full border border-white/15 bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5" @click="studio.saveLibraryElement">
              <FontAwesomeIcon :icon="['fas', 'plus']" class="mr-2" />
              {{ studio.libraryDraft.id ? t('library.save') : t('library.create') }}
            </button>
          </div>
        </div>
      </div>
    </BasePanel>

    <BasePanel :title="t('studio.libraryTitle')" :subtitle="t('studio.librarySubtitle')">
      <div class="space-y-4">
        <div class="rounded-[28px] border border-white/10 bg-white/5 p-4">
          <div class="grid gap-3 md:grid-cols-[1.2fr_0.7fr]">
            <div class="relative">
              <FontAwesomeIcon :icon="['fas', 'magnifying-glass']" class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input v-model="studio.librarySearch" :placeholder="t('library.search')" class="w-full rounded-2xl border border-white/10 bg-slate-950/70 py-3 pl-11 pr-4 text-white placeholder:text-slate-500 outline-none transition focus:border-glow/40" />
            </div>
            <StudioSelect
              v-model="studio.librarySort"
              :options="librarySortOptions"
              :icon="['fas', 'sliders']"
              :placeholder="t('library.sort')"
              compact
            />
          </div>
          <div class="mt-3 flex flex-wrap gap-2">
            <button v-for="filterKey in libraryFilterKeys" :key="filterKey" class="rounded-full border px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] transition" :class="studio.libraryFilter === filterKey ? 'border-glow/40 bg-glow/15 text-glow' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'" @click="studio.libraryFilter = filterKey">
              {{ t(`library.${filterKey}`) }}
              <span class="ml-2 text-[10px] opacity-70">{{ filterKey === 'all' ? studio.libraryCategories.all : studio.libraryCategories[filterKey] }}</span>
            </button>
          </div>
        </div>

        <div v-for="element in studio.filteredLibraryElements" :key="element.id" class="rounded-[28px] border border-white/10 bg-gradient-to-br from-white/8 to-white/4 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10">
          <div class="mb-2 flex items-start justify-between gap-4">
            <div>
              <div class="flex flex-wrap items-center gap-3">
                <p class="font-medium text-white">{{ element.name }}</p>
                <span class="rounded-full border border-glow/20 bg-glow/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-glow">{{ t(`library.${element.type}`) }}</span>
              </div>
              <p class="mt-3 text-sm leading-6 text-slate-300">{{ studio.renderLibraryElementDescription(element) }}</p>
            </div>
            <div class="flex flex-wrap justify-end gap-2">
              <button data-testid="library-use-button" class="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs transition hover:bg-white/10" @click="studio.insertLibraryElement(element)"><FontAwesomeIcon :icon="['fas', 'wand-magic-sparkles']" class="mr-2" />{{ t('library.use') }}</button>
              <button class="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs transition hover:bg-white/10" @click="studio.editLibraryElement(element)"><FontAwesomeIcon :icon="['fas', 'pen']" class="mr-2" />{{ t('library.edit') }}</button>
              <button class="rounded-full border border-rose-300/20 bg-rose-300/5 px-3 py-2 text-xs text-rose-200 transition hover:bg-rose-300/10" @click="studio.deleteLibraryElement(element.id)"><FontAwesomeIcon :icon="['fas', 'trash-can']" class="mr-2" />{{ t('library.delete') }}</button>
            </div>
          </div>
          <div
            v-if="element.structuredValues && Object.values(element.structuredValues).some(Boolean)"
            class="mt-3 flex flex-wrap gap-2"
          >
            <ChipTag
              v-for="[key, value] in Object.entries(element.structuredValues).filter(([, value]) => value)"
              :key="`${element.id}-${key}-${value}`"
              :label="`${t(`library.structured.${element.type}.${key}`)}: ${value}`"
            />
          </div>
          <div
            v-if="studio.previewLibraryElementMappings(element).length"
            class="mt-4 rounded-[22px] border border-white/10 bg-slate-950/35 p-4"
          >
            <p class="text-xs uppercase tracking-[0.24em] text-slate-500">{{ t('library.mappingPreview') }}</p>
            <div class="mt-3 flex flex-wrap gap-2">
              <ChipTag
                v-for="mapping in studio.previewLibraryElementMappings(element)"
                :key="`${element.id}-${mapping.id}`"
                :label="`${t(mapping.labelKey)} -> ${mapping.value}`"
              />
            </div>
          </div>
          <div
            v-if="studio.pendingLibraryInsertElement?.id === element.id"
            data-testid="library-confirm-panel"
            class="mt-4 rounded-[24px] border border-glow/20 bg-glow/[0.08] p-4"
          >
            <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p class="text-xs uppercase tracking-[0.24em] text-glow">{{ t('library.confirmTitle') }}</p>
                <p class="mt-2 text-sm leading-6 text-slate-200">{{ t('library.confirmSubtitle') }}</p>
              </div>
              <div class="flex flex-wrap gap-2">
                <button
                  class="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 transition hover:bg-white/10"
                  @click="studio.cancelLibraryInsert"
                >
                  {{ t('library.cancel') }}
                </button>
                <button
                  class="rounded-full border border-white/15 bg-white px-3 py-2 text-xs font-semibold text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="!studio.pendingLibraryInsert.selectedMappingIds.length"
                  @click="studio.confirmLibraryInsert"
                >
                  {{ t('library.confirmApply') }}
                </button>
              </div>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
              <button
                v-for="mapping in studio.pendingLibraryInsertMappings"
                :key="`pending-${mapping.id}`"
                type="button"
                class="rounded-full border px-3 py-2 text-xs transition"
                :class="
                  studio.pendingLibraryInsert.selectedMappingIds.includes(mapping.id)
                    ? 'border-glow/30 bg-glow/15 text-glow'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                "
                @click="studio.toggleLibraryInsertMapping(mapping.id)"
              >
                {{ t(mapping.labelKey) }}: {{ mapping.value }}
              </button>
            </div>
            <div v-if="studio.pendingLibraryInsertComparisons.length" class="mt-4 grid gap-3">
              <div
                v-for="comparison in studio.pendingLibraryInsertComparisons"
                :key="`comparison-${comparison.id}`"
                class="rounded-[20px] border p-4"
                :class="
                  comparison.changed
                    ? 'border-glow/20 bg-white/[0.04]'
                    : 'border-white/10 bg-slate-950/30'
                "
              >
                <p class="text-xs uppercase tracking-[0.22em] text-slate-500">{{ t(comparison.labelKey) }}</p>
                <div class="mt-3 grid gap-3 md:grid-cols-2">
                  <div class="rounded-2xl border border-white/10 bg-slate-950/35 p-3">
                    <p class="text-[10px] uppercase tracking-[0.2em] text-slate-500">{{ t('library.before') }}</p>
                    <p class="mt-2 text-sm leading-6 text-slate-300">
                      {{ comparison.before || t('library.emptyValue') }}
                    </p>
                  </div>
                  <div class="rounded-2xl border border-glow/15 bg-glow/[0.08] p-3">
                    <p class="text-[10px] uppercase tracking-[0.2em] text-glow">{{ t('library.after') }}</p>
                    <p class="mt-2 text-sm leading-6 text-white">
                      {{ comparison.after || t('library.emptyValue') }}
                    </p>
                  </div>
                </div>
                <p
                  class="mt-3 text-xs"
                  :class="comparison.changed ? 'text-glow' : 'text-slate-500'"
                >
                  {{
                    comparison.changed
                      ? t('library.changeDetected')
                      : t('library.changeUnchanged')
                  }}
                </p>
              </div>
            </div>
            <div
              v-if="studio.pendingLibraryInsertPositivePromptAfter"
              class="mt-4 grid gap-3 md:grid-cols-2"
            >
              <div class="rounded-[20px] border border-white/10 bg-slate-950/35 p-4">
                <p class="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  {{ t('library.promptBefore') }}
                </p>
                <p class="mt-3 text-sm leading-7 text-slate-300">
                  {{ studio.pendingLibraryInsertPositivePromptBefore || t('preview.empty') }}
                </p>
              </div>
              <div class="rounded-[20px] border border-glow/15 bg-glow/[0.08] p-4">
                <p class="text-[10px] uppercase tracking-[0.2em] text-glow">
                  {{ t('library.promptAfter') }}
                </p>
                <p class="mt-3 text-sm leading-7 text-white">
                  {{ studio.pendingLibraryInsertPositivePromptAfter }}
                </p>
              </div>
            </div>
          </div>
          <div class="mt-3 flex flex-wrap gap-2">
            <ChipTag v-for="tag in element.tags" :key="`${element.id}-${tag}`" :label="tag" />
          </div>
        </div>

        <div
          v-if="!studio.libraryElements.length"
          class="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] px-5 py-8 text-center"
        >
          <p class="text-xs uppercase tracking-[0.24em] text-slate-500">{{ t('library.emptyTitle') }}</p>
          <p class="mt-3 text-sm leading-7 text-slate-300">{{ t('library.empty') }}</p>
        </div>
        <div
          v-else-if="!studio.filteredLibraryElements.length"
          class="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] px-5 py-8 text-center"
        >
          <p class="text-xs uppercase tracking-[0.24em] text-slate-500">{{ t('library.noResultsTitle') }}</p>
          <p class="mt-3 text-sm leading-7 text-slate-300">{{ t('library.noResults') }}</p>
        </div>
      </div>
    </BasePanel>
    </div>

    <BasePanel :title="t('library.personalVocabulary.title')" :subtitle="t('library.personalVocabulary.subtitle')">
      <div class="mb-4 rounded-[28px] border border-white/10 bg-white/5 p-4">
        <div class="grid gap-3 md:grid-cols-[1.3fr_0.85fr_0.85fr]">
          <div class="relative">
            <FontAwesomeIcon :icon="['fas', 'magnifying-glass']" class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              v-model="studio.personalVocabularySearch"
              :placeholder="t('library.personalVocabulary.search')"
              class="w-full rounded-2xl border border-white/10 bg-slate-950/70 py-3 pl-11 pr-4 text-white placeholder:text-slate-500 outline-none transition focus:border-glow/40"
            />
          </div>
          <StudioSelect
            v-model="studio.personalVocabularyGroupFilter"
            :options="personalVocabularyGroupOptions"
            :icon="['fas', 'layer-group']"
            :placeholder="t('library.personalVocabulary.filterGroup')"
            compact
          />
          <StudioSelect
            v-model="studio.personalVocabularySort"
            :options="personalVocabularySortOptions"
            :icon="['fas', 'sliders']"
            :placeholder="t('library.personalVocabulary.sort')"
            compact
          />
        </div>
      </div>
      <div v-if="personalVocabulary.length" class="grid gap-4 md:grid-cols-2">
        <article
          v-for="option in personalVocabulary"
          :key="option.id"
          class="rounded-[26px] border border-white/10 bg-gradient-to-br from-white/8 to-white/4 p-5"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="font-medium text-white">{{ personalVocabularyLabel(option) }}</p>
              <p class="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500">
                {{ guidedFieldLabel(option.key) }}
              </p>
            </div>
            <button
              type="button"
              class="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 transition hover:bg-white/10"
              @click="startEditingVocabularyOption(option)"
            >
              <FontAwesomeIcon :icon="['fas', 'pen']" class="mr-2" />
              {{ t('library.personalVocabulary.edit') }}
            </button>
            <button
              type="button"
              class="rounded-full border border-rose-300/20 bg-rose-300/5 px-3 py-2 text-xs text-rose-200 transition hover:bg-rose-300/10"
              @click="studio.deleteCustomGuidedOption(option.id)"
            >
              <FontAwesomeIcon :icon="['fas', 'trash-can']" class="mr-2" />
              {{ t('library.personalVocabulary.delete') }}
            </button>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <ChipTag :label="`${t('library.personalVocabulary.localLabel')}: ${personalVocabularyLabel(option)}`" />
            <ChipTag :label="`${t('library.personalVocabulary.promptValue')}: ${option.value}`" />
            <ChipTag :label="`${t('library.personalVocabulary.group')}: ${t(`builder.guided.groups.${option.group}`)}`" />
            <ChipTag
              v-for="medium in option.mediums ?? []"
              :key="`${option.id}-${medium}`"
              :label="medium === 'image' ? t('app.mediumImage') : t('app.mediumVideo')"
            />
          </div>
          <div
            v-if="editingVocabularyId === option.id"
            class="mt-4 rounded-[22px] border border-glow/15 bg-glow/[0.06] p-4"
          >
            <div class="grid gap-3 md:grid-cols-2">
              <FieldBlock :label="t('library.personalVocabulary.localLabel')">
                <input
                  v-model="editingVocabularyLabel"
                  class="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-glow/40"
                />
              </FieldBlock>
              <FieldBlock :label="t('library.personalVocabulary.promptValue')">
                <input
                  v-model="editingVocabularyValue"
                  class="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-glow/40"
                />
              </FieldBlock>
              <div class="md:col-span-2">
                <FieldBlock :label="t('library.personalVocabulary.group')">
                  <StudioSelect
                    :model-value="editingVocabularyGroup"
                    :options="guidedGroupOptions"
                    :icon="['fas', 'wand-magic-sparkles']"
                    :placeholder="t('library.personalVocabulary.group')"
                    @update:model-value="editingVocabularyGroup = $event as GuidedGroup"
                  />
                </FieldBlock>
              </div>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                class="rounded-full border border-white/15 bg-white px-4 py-2 text-xs font-semibold text-slate-950 transition hover:-translate-y-0.5"
                @click="saveEditingVocabularyOption"
              >
                {{ t('library.personalVocabulary.save') }}
              </button>
              <button
                type="button"
                class="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200 transition hover:bg-white/10"
                @click="cancelEditingVocabularyOption"
              >
                {{ t('library.cancel') }}
              </button>
            </div>
          </div>
        </article>
      </div>
      <div
        v-else
        class="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] px-5 py-8 text-center"
      >
        <p class="text-xs uppercase tracking-[0.24em] text-slate-500">{{ t('library.personalVocabulary.emptyTitle') }}</p>
        <p class="mt-3 text-sm leading-7 text-slate-300">
          {{ studio.customGuidedOptions.length ? t('library.personalVocabulary.noResults') : t('library.personalVocabulary.empty') }}
        </p>
      </div>
    </BasePanel>
  </div>
</template>
