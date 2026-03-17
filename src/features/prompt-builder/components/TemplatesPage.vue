<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import BasePanel from '../../../components/ui/BasePanel.vue'
import ChipTag from '../../../components/ui/ChipTag.vue'
import FieldBlock from '../../../components/ui/FieldBlock.vue'
import GuidedCombobox from '../../../components/ui/GuidedCombobox.vue'
import { usePromptStudio } from '../../../composables/usePromptStudio'
import { suggestCustomGuidedGroup } from '../../../domain/guidedVocabulary'
import { getLocalizedTemplateFieldOptions } from '../../../domain/promptTemplateSchema'
import type { AppLocale, GuidedVocabularyKey } from '../../../types/models'

const studio = reactive(usePromptStudio())
const { t, locale } = useI18n()
const templateFilterKeys = ['all', 'image', 'video'] as const
const currentLocale = computed(() => locale.value as AppLocale)

const templateFieldOptions = computed(() =>
  Object.fromEntries(
    studio.templateDraftSchema.map((field) => [
      field.key,
      getLocalizedTemplateFieldOptions(
        field,
        currentLocale.value,
        studio.templateDraftMedium,
        studio.customGuidedOptions,
      ),
    ]),
  ) as Record<string, { value: string; label: string; group?: string }[]>,
)

const addCustomHelperText = computed(() =>
  locale.value === 'fr'
    ? t('builder.guided.addHelperWithPrompt')
    : t('builder.guided.addHelper'),
)

const resolveSuggestedGroupLabel = (key: GuidedVocabularyKey, value: string) =>
  t(`builder.guided.groups.${suggestCustomGuidedGroup(key, value)}`)

const resolveTemplateSuggestedGroup = (fieldKey?: GuidedVocabularyKey) =>
  fieldKey
    ? ({ value }: { label: string; value: string }) => resolveSuggestedGroupLabel(fieldKey, value)
    : undefined

const saveTemplateCustomGuidedValue = async (
  fieldKey: string,
  guidedKey: GuidedVocabularyKey,
  payload: { label: string; value: string },
) => {
  const savedValue = await studio.addCustomGuidedOption({
    key: guidedKey,
    label: payload.label,
    value: payload.value,
    locale: currentLocale.value,
    medium: studio.templateDraftMedium,
  })

  if (!savedValue) return

  studio.updateTemplateDraftProfileValue(fieldKey, savedValue)
}

if (
  !studio.templateDraft.id &&
  !studio.templateDraftProject.title &&
  !studio.templateDraftProject.description &&
  !studio.templateDraftProject.tags.length &&
  !studio.templateDraftProject.details.length
) {
  studio.initializeTemplateDraft()
}

const templateShowcaseCards = computed(() => [
  { label: t('templates.hero.total'), value: String(studio.templateCategories.all) },
  { label: t('templates.hero.image'), value: String(studio.templateCategories.image) },
  { label: t('templates.hero.video'), value: String(studio.templateCategories.video) },
])
</script>

<template>
  <div class="space-y-6">
    <section class="glass-panel overflow-hidden rounded-[32px] px-6 py-6 md:px-7">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-3xl space-y-3">
          <p class="text-xs uppercase tracking-[0.28em] text-glow">{{ t('templates.hero.kicker') }}</p>
          <h2 class="font-display text-3xl text-white md:text-4xl">{{ t('templates.hero.title') }}</h2>
          <p class="text-sm leading-7 text-slate-300">{{ t('templates.hero.subtitle') }}</p>
        </div>
        <div class="grid gap-3 sm:grid-cols-3">
          <div v-for="card in templateShowcaseCards" :key="card.label" class="rounded-[24px] border border-white/10 bg-white/[0.05] px-4 py-4">
            <p class="text-[10px] uppercase tracking-[0.22em] text-slate-500">{{ card.label }}</p>
            <p class="mt-3 font-display text-2xl text-white">{{ card.value }}</p>
          </div>
        </div>
      </div>
    </section>

    <div class="grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
    <BasePanel :title="t('templates.editMeta')" :subtitle="t('templates.subtitle')">
      <div class="space-y-4">
        <div class="rounded-[28px] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-5 shadow-haze">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div>
              <p class="text-xs uppercase tracking-[0.28em] text-glow">{{ t('templates.browse') }}</p>
              <p class="mt-2 font-medium text-white">{{ t('templates.saveCurrent') }}</p>
            </div>
            <button v-if="studio.templateDraft.id" class="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 transition hover:bg-white/10" @click="studio.resetTemplateDraft">
              <FontAwesomeIcon :icon="['fas', 'xmark']" class="mr-2" />
              {{ t('templates.cancel') }}
            </button>
          </div>
          <div class="grid gap-3">
            <FieldBlock :label="t('templates.title')"><input v-model="studio.templateDraft.title" class="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-glow/40" /></FieldBlock>
            <FieldBlock :label="t('templates.description')"><textarea v-model="studio.templateDraft.description" rows="3" class="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-glow/40" /></FieldBlock>
            <div class="rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
              <span class="text-slate-500">{{ t('app.medium') }}:</span>
              <span class="ml-2 rounded-full border border-glow/20 bg-glow/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-glow">
                {{ studio.templateDraftMedium }}
              </span>
            </div>
            <div class="grid gap-3 md:grid-cols-2">
              <div
                v-for="field in studio.templateDraftSchema"
                :key="`${studio.templateDraftMedium}-${field.key}`"
              >
                <FieldBlock :label="t(field.labelKey)">
                  <GuidedCombobox
                    :model-value="studio.templateDraft.profileValues[field.key]"
                    :options="templateFieldOptions[field.key] ?? []"
                    :placeholder="t(field.placeholderKey)"
                    :icon="field.icon"
                    :suggestion-label="t('builder.guided.suggested')"
                    :custom-label="t('builder.guided.custom')"
                    :no-results-label="t('builder.guided.noResults')"
                    :canonical-label="t('templates.structured.token')"
                    :group-labels="{
                      core: t('builder.guided.groups.core'),
                      atmospheric: t('builder.guided.groups.atmospheric'),
                      cinematic: t('builder.guided.groups.cinematic'),
                      narrative: t('builder.guided.groups.narrative'),
                      motion: t('builder.guided.groups.motion'),
                    }"
                    :helper-text="t('templates.structured.helper')"
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
                    :resolve-suggested-group="resolveTemplateSuggestedGroup(field.guidedKey)"
                    @update:model-value="studio.updateTemplateDraftProfileValue(field.key, $event)"
                    @save-custom="field.guidedKey && saveTemplateCustomGuidedValue(field.key, field.guidedKey, $event)"
                  />
                </FieldBlock>
              </div>
            </div>
          </div>
          <div class="mt-4 rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
            <div class="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-glow">
              <FontAwesomeIcon :icon="['fas', 'wand-magic-sparkles']" />
              {{ t('templates.miniBuilder.title') }}
            </div>
            <div class="grid gap-3 md:grid-cols-2">
              <FieldBlock :label="t('builder.fields.tags')">
                <input
                  :value="studio.templateDraftProject.tags.join(', ')"
                  :placeholder="t('builder.placeholders.tags')"
                  class="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-glow/40"
                  @input="studio.updateTemplateDraftProjectTags(($event.target as HTMLInputElement).value)"
                />
              </FieldBlock>
              <FieldBlock :label="t('builder.fields.location')">
                <input
                  v-model="studio.templateDraftProject.environment.location"
                  class="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-glow/40"
                />
              </FieldBlock>
              <FieldBlock :label="t('builder.fields.subjectDescription')">
                <input
                  v-model="studio.templateDraftProject.subject.description"
                  class="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-glow/40"
                />
              </FieldBlock>
              <FieldBlock :label="t('builder.fields.subjectAppearance')">
                <input
                  v-model="studio.templateDraftProject.subject.appearance"
                  class="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-glow/40"
                />
              </FieldBlock>
              <FieldBlock :label="t('builder.fields.subjectAction')">
                <input
                  v-model="studio.templateDraftProject.subject.action"
                  class="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-glow/40"
                />
              </FieldBlock>
              <FieldBlock :label="t('builder.fields.description')">
                <textarea
                  v-model="studio.templateDraftProject.description"
                  rows="3"
                  class="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-glow/40"
                />
              </FieldBlock>
              <div class="md:col-span-2">
                <FieldBlock :label="t('builder.fields.details')">
                  <textarea
                    :value="studio.templateDraftProject.details.join('\n')"
                    :placeholder="t('templates.miniBuilder.detailsPlaceholder')"
                    rows="4"
                    class="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-glow/40"
                    @input="studio.updateTemplateDraftProjectDetails(($event.target as HTMLTextAreaElement).value)"
                  />
                </FieldBlock>
              </div>
            </div>
          </div>
          <div v-if="studio.templateDraftProfileEntries.length" class="mt-4 rounded-[24px] border border-glow/15 bg-glow/[0.07] p-4">
            <p class="text-xs uppercase tracking-[0.24em] text-glow">{{ t('templates.structured.preview') }}</p>
            <div class="mt-3 flex flex-wrap gap-2">
              <ChipTag
                v-for="[key, value] in studio.templateDraftProfileEntries"
                :key="`${key}-${value}`"
                :label="`${t(`templates.structured.${key}`)}: ${value}`"
              />
            </div>
          </div>
          <div class="mt-4 grid gap-3">
            <div class="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
              <p class="text-xs uppercase tracking-[0.24em] text-slate-500">{{ t('preview.positive') }}</p>
              <p class="mt-3 text-sm leading-7 text-slate-100">{{ studio.templateDraftPositivePrompt || t('preview.empty') }}</p>
            </div>
            <div class="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
              <p class="text-xs uppercase tracking-[0.24em] text-slate-500">{{ t('preview.negative') }}</p>
              <p class="mt-3 text-sm leading-7 text-slate-300">{{ studio.templateDraftNegativePrompt }}</p>
            </div>
          </div>
          <div class="mt-4 flex flex-wrap gap-3">
            <button class="rounded-full border border-white/15 bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5" @click="studio.saveTemplateFromCurrentProject">
              <FontAwesomeIcon :icon="['fas', 'object-group']" class="mr-2" />
              {{ studio.templateDraft.id ? t('templates.save') : t('templates.create') }}
            </button>
            <button v-if="studio.templateDraft.id" class="rounded-full border border-rose-300/20 bg-rose-300/5 px-4 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-300/10" @click="studio.deleteTemplate(studio.templateDraft.id)">
              <FontAwesomeIcon :icon="['fas', 'trash-can']" class="mr-2" />
              {{ t('templates.delete') }}
            </button>
          </div>
        </div>

        <div v-if="studio.selectedTemplate" class="rounded-[30px] border border-glow/20 bg-gradient-to-br from-glow/12 via-white/5 to-peach/10 p-5">
          <div class="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-glow">
            <FontAwesomeIcon :icon="['fas', 'sliders']" />
            {{ t('templates.spotlight') }}
          </div>
            <div class="space-y-4">
              <div class="flex flex-wrap items-center gap-2">
                <span class="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white">{{ studio.selectedTemplate.project.medium }}</span>
                <span v-for="tag in studio.selectedTemplate.project.tags.slice(0, 3)" :key="`spotlight-${tag}`" class="rounded-full border border-glow/20 bg-glow/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-glow">{{ tag }}</span>
              </div>
              <div>
                <h3 class="font-display text-2xl text-white">{{ studio.selectedTemplate.title }}</h3>
                <p class="mt-3 text-sm leading-7 text-slate-200">{{ studio.selectedTemplate.description }}</p>
              </div>
              <div
                v-if="studio.renderTemplateProfileEntries(studio.selectedTemplate).length"
                class="flex flex-wrap gap-2"
              >
                <ChipTag
                  v-for="[key, value] in studio.renderTemplateProfileEntries(studio.selectedTemplate)"
                  :key="`spotlight-profile-${key}-${value}`"
                  :label="`${t(`templates.structured.${key}`)}: ${value}`"
                />
              </div>
              <div
                v-if="studio.selectedTemplateApplicationComparisons.length"
                class="grid gap-3"
              >
                <div
                  v-for="comparison in studio.selectedTemplateApplicationComparisons"
                  :key="`template-compare-${comparison.id}`"
                  class="rounded-[20px] border p-4"
                  :class="
                    comparison.changed
                      ? 'border-glow/20 bg-white/[0.04]'
                      : 'border-white/10 bg-slate-950/25'
                  "
                >
                  <p class="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    {{ t(comparison.labelKey) }}
                  </p>
                  <div class="mt-3 grid gap-3 md:grid-cols-2">
                    <div class="rounded-2xl border border-white/10 bg-slate-950/35 p-3">
                      <p class="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                        {{ t('templates.before') }}
                      </p>
                      <p class="mt-2 text-sm leading-6 text-slate-300">
                        {{ comparison.before || t('templates.emptyValue') }}
                      </p>
                    </div>
                    <div class="rounded-2xl border border-glow/15 bg-glow/[0.08] p-3">
                      <p class="text-[10px] uppercase tracking-[0.2em] text-glow">
                        {{ t('templates.after') }}
                      </p>
                      <p class="mt-2 text-sm leading-6 text-white">
                        {{ comparison.after || t('templates.emptyValue') }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div
                v-if="studio.selectedTemplatePositivePromptAfter"
                class="grid gap-3 md:grid-cols-2"
              >
                <div class="rounded-[20px] border border-white/10 bg-slate-950/35 p-4">
                  <p class="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    {{ t('templates.promptBefore') }}
                  </p>
                  <p class="mt-3 text-sm leading-7 text-slate-300">
                    {{ studio.selectedTemplatePositivePromptBefore || t('preview.empty') }}
                  </p>
                </div>
                <div class="rounded-[20px] border border-glow/15 bg-glow/[0.08] p-4">
                  <p class="text-[10px] uppercase tracking-[0.2em] text-glow">
                    {{ t('templates.promptAfter') }}
                  </p>
                  <p class="mt-3 text-sm leading-7 text-white">
                    {{ studio.selectedTemplatePositivePromptAfter }}
                  </p>
                </div>
              </div>
              <button class="rounded-full border border-white/15 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5" @click="studio.applyTemplate(studio.selectedTemplate.id)">
                <FontAwesomeIcon :icon="['fas', 'wand-magic-sparkles']" class="mr-2" />
                {{ t('templates.edit') }}
            </button>
          </div>
        </div>
      </div>
    </BasePanel>

    <BasePanel :title="t('templates.browse')" :subtitle="t('studio.templatesSubtitle')">
      <div class="space-y-4">
        <div class="rounded-[28px] border border-white/10 bg-white/5 p-4">
          <div class="space-y-3">
            <div class="relative">
              <FontAwesomeIcon :icon="['fas', 'magnifying-glass']" class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input v-model="studio.templateSearch" :placeholder="t('templates.search')" class="w-full rounded-2xl border border-white/10 bg-slate-950/70 py-3 pl-11 pr-4 text-white placeholder:text-slate-500 outline-none transition focus:border-glow/40" />
            </div>
            <div class="flex flex-wrap gap-2">
              <button v-for="filterKey in templateFilterKeys" :key="filterKey" class="rounded-full border px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] transition" :class="studio.templateFilter === filterKey ? 'border-glow/40 bg-glow/15 text-glow' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'" @click="studio.templateFilter = filterKey">
                {{ filterKey === 'all' ? t('templates.all') : filterKey === 'image' ? t('templates.image') : t('templates.video') }}
                <span class="ml-2 text-[10px] opacity-70">{{ studio.templateCategories[filterKey] }}</span>
              </button>
            </div>
          </div>
        </div>

        <div v-if="studio.filteredTemplates.length" class="space-y-3">
          <button v-for="template in studio.filteredTemplates" :key="template.id" class="group w-full rounded-[28px] border p-5 text-left transition duration-200 hover:-translate-y-0.5" :class="studio.selectedTemplateId === template.id ? 'border-glow/30 bg-gradient-to-br from-glow/10 to-white/5' : 'border-white/10 bg-gradient-to-br from-white/10 to-white/5 hover:border-white/20 hover:bg-white/10'" @click="studio.selectedTemplateId = template.id">
            <div class="flex items-start justify-between gap-4">
              <div class="space-y-3">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-slate-300">{{ template.project.medium }}</span>
                  <span v-for="tag in template.project.tags.slice(0, 2)" :key="`${template.id}-${tag}`" class="rounded-full border border-glow/20 bg-glow/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-glow">{{ tag }}</span>
                </div>
                <div>
                  <p class="font-medium text-white">{{ template.title }}</p>
                  <p class="mt-2 max-w-md text-sm leading-6 text-slate-300">{{ template.description }}</p>
                </div>
                <div
                  v-if="studio.renderTemplateProfileEntries(template).length"
                  class="flex max-w-md flex-wrap gap-2"
                >
                  <ChipTag
                    v-for="[key, value] in studio.renderTemplateProfileEntries(template).slice(0, 4)"
                    :key="`${template.id}-${key}-${value}`"
                    :label="`${t(`templates.structured.${key}`)}: ${value}`"
                  />
                </div>
              </div>
              <span class="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-glow transition group-hover:bg-white/10">{{ t('templates.use') }}</span>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
              <button class="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs transition hover:bg-white/10" @click.stop="studio.editTemplate(template)"><FontAwesomeIcon :icon="['fas', 'pen']" class="mr-2" />{{ t('library.edit') }}</button>
              <button class="rounded-full border border-rose-300/20 bg-rose-300/5 px-3 py-2 text-xs text-rose-200 transition hover:bg-rose-300/10" @click.stop="studio.deleteTemplate(template.id)"><FontAwesomeIcon :icon="['fas', 'trash-can']" class="mr-2" />{{ t('templates.delete') }}</button>
            </div>
          </button>
        </div>
        <div
          v-else
          class="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] px-5 py-8 text-center"
        >
          <p class="text-xs uppercase tracking-[0.24em] text-slate-500">{{ t('templates.noResultsTitle') }}</p>
          <p class="mt-3 text-sm leading-7 text-slate-300">{{ t('templates.noResults') }}</p>
        </div>
      </div>
    </BasePanel>
    </div>
  </div>
</template>
