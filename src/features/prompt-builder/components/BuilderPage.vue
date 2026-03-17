<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import BasePanel from '../../../components/ui/BasePanel.vue'
import ChipTag from '../../../components/ui/ChipTag.vue'
import FieldBlock from '../../../components/ui/FieldBlock.vue'
import GuidedCombobox from '../../../components/ui/GuidedCombobox.vue'
import StudioSelect from '../../../components/ui/StudioSelect.vue'
import { usePromptStudio } from '../../../composables/usePromptStudio'
import { createEmptySceneCharacter } from '../../../domain/promptFactory'
import CreativeChoiceField from './CreativeChoiceField.vue'
import WorkspaceStageStepper from './WorkspaceStageStepper.vue'
import type { ContextualBundleItem } from '../../../domain/contextualBundles'
import { getLocalizedGuidedOptions } from '../../../domain/guidedVocabulary'
import { suggestCustomGuidedGroup } from '../../../domain/guidedVocabulary'
import type {
  AppLocale,
  GuidedVocabularyKey,
  PromptMedium,
  SceneCharacter,
  SceneCharacterRole,
} from '../../../types/models'

type WorkspaceStageId =
  | 'project'
  | 'subject'
  | 'world'
  | 'scene'
  | 'composition'
  | 'details'
type WorkspaceToolTab = 'inspire' | 'reuse' | 'project'
interface StudioSelectOption {
  value: string
  label: string
  description?: string
  badge?: string
}

interface SaveCustomGuidedPayload {
  label: string
  value: string
}

type ProjectGuidedFieldPath =
  | 'subject.type'
  | 'subject.position'
  | 'environment.era'
  | 'environment.season'
  | 'environment.weather'
  | 'environment.timeOfDay'
  | 'motion.subjectMotion'
  | 'motion.environmentMotion'
  | 'camera.shotType'
  | 'camera.angle'
  | 'camera.movement'
  | 'camera.lensFeel'
  | 'mood'
  | 'style'
  | 'lighting'
  | 'composition'
  | 'camera.captureDevice'
  | 'sceneCharacter.type'
  | 'sceneCharacter.position'
  | 'sceneCharacter.spatialRelation'

const studio = reactive(usePromptStudio())
const { t, locale } = useI18n()
const router = useRouter()
const activeStage = ref<WorkspaceStageId>('project')
const activeToolTab = ref<WorkspaceToolTab>('inspire')
const subjectLibraryDialogOpen = ref(false)
const subjectLibraryDialogMode = ref<'subject' | 'secondary'>('subject')
const subjectLibraryDialogCharacterId = ref<string | null>(null)

const stageOrder: WorkspaceStageId[] = [
  'project',
  'subject',
  'world',
  'scene',
  'composition',
  'details',
]

const manageLinks = [
  { to: '/studio/templates', labelKey: 'studio.quick.manageTemplates', icon: ['fas', 'object-group'] },
  { to: '/studio/library', labelKey: 'studio.quick.manageLibrary', icon: ['fas', 'layer-group'] },
  { to: '/studio/history', labelKey: 'studio.quick.manageHistory', icon: ['fas', 'clock-rotate-left'] },
]

const currentMedium = computed(() => studio.currentProject.medium as PromptMedium)
const optionLocale = computed(() => locale.value as 'en' | 'fr')
const localizedOptions = (key: Parameters<typeof getLocalizedGuidedOptions>[0]) =>
  computed(() =>
    getLocalizedGuidedOptions(
      key,
      optionLocale.value,
      currentMedium.value,
      studio.currentProject,
      studio.customGuidedOptions,
    ),
  )

const subjectTypeOptions = localizedOptions('subjectType')
const eraOptions = localizedOptions('era')
const seasonOptions = localizedOptions('season')
const weatherOptions = localizedOptions('weather')
const timeOfDayOptions = localizedOptions('timeOfDay')
const moodOptions = localizedOptions('mood')
const styleOptions = localizedOptions('style')
const lightingOptions = localizedOptions('lighting')
const compositionOptions = localizedOptions('composition')
const scenePositionOptions = localizedOptions('scenePosition')
const spatialRelationOptions = localizedOptions('spatialRelation')
const captureDeviceOptions = localizedOptions('captureDevice')
const subjectMotionOptions = localizedOptions('subjectMotion')
const environmentMotionOptions = localizedOptions('environmentMotion')
const shotTypeOptions = localizedOptions('shotType')
const angleOptions = localizedOptions('angle')
const movementOptions = localizedOptions('movement')
const lensFeelOptions = localizedOptions('lensFeel')
const groupLabels = computed(() => ({
  core: t('builder.guided.groups.core'),
  atmospheric: t('builder.guided.groups.atmospheric'),
  cinematic: t('builder.guided.groups.cinematic'),
  narrative: t('builder.guided.groups.narrative'),
  motion: t('builder.guided.groups.motion'),
}))

const addCustomHelperText = computed(() =>
  optionLocale.value === 'fr'
    ? t('builder.guided.addHelperWithPrompt')
    : t('builder.guided.addHelper'),
)

const resolveSuggestedGroupLabel = (key: GuidedVocabularyKey, value: string) =>
  t(`builder.guided.groups.${suggestCustomGuidedGroup(key, value)}`)

const guidedProps = (helperText: string, targetFieldLabel?: string) => ({
  suggestionLabel: t('builder.guided.suggested'),
  customLabel: t('builder.guided.custom'),
  noResultsLabel: t('builder.guided.noResults'),
  canonicalLabel: t('builder.guided.canonical'),
  helperText,
  groupLabels: groupLabels.value,
  locale: optionLocale.value,
  allowCreate: true,
  addActionLabel: t('builder.guided.addAction'),
  addPromptLabel: t('builder.guided.promptLabel'),
  addPromptPlaceholder: t('builder.guided.promptPlaceholder'),
  addHelperText: addCustomHelperText.value,
  personalLabel: t('builder.guided.personalOption'),
  defaultLabel: t('builder.guided.defaultOption'),
  showPersonalFilter: true,
  allOptionsLabel: t('builder.guided.allOptions'),
  personalOnlyLabel: t('builder.guided.personalOnly'),
  suggestedGroupLabel: t('builder.guided.suggestedGroup'),
  targetFieldLabel,
  targetFieldValueLabel: t('builder.guided.targetField'),
})

const ensureSceneCharacters = () => {
  if (!studio.currentProject.sceneCharacters) {
    studio.currentProject.sceneCharacters = []
  }
  return studio.currentProject.sceneCharacters
}

const addSceneCharacter = () => {
  ensureSceneCharacters().push(createEmptySceneCharacter())
}

const removeSceneCharacter = (characterId: string) => {
  studio.currentProject.sceneCharacters = (studio.currentProject.sceneCharacters ?? []).filter(
    (character) => character.id !== characterId,
  )
}

const updateSceneCharacter = (
  characterId: string,
  key: keyof SceneCharacter,
  value: string | SceneCharacterRole,
) => {
  const sceneCharacters = ensureSceneCharacters()
  const character = sceneCharacters.find((entry) => entry.id === characterId)
  if (!character) return
  ;(character[key] as string | SceneCharacterRole | undefined) = value
}

const applyProjectGuidedValue = (
  path: ProjectGuidedFieldPath,
  value: string,
  characterId?: string,
) => {
  switch (path) {
    case 'subject.type':
      studio.currentProject.subject.type = value
      break
    case 'subject.position':
      studio.currentProject.subject.position = value
      break
    case 'environment.era':
      studio.currentProject.environment.era = value
      break
    case 'environment.season':
      studio.currentProject.environment.season = value
      break
    case 'environment.weather':
      studio.currentProject.environment.weather = value
      break
    case 'environment.timeOfDay':
      studio.currentProject.environment.timeOfDay = value
      break
    case 'motion.subjectMotion':
      studio.currentProject.motion!.subjectMotion = value
      break
    case 'motion.environmentMotion':
      studio.currentProject.motion!.environmentMotion = value
      break
    case 'camera.shotType':
      studio.currentProject.camera!.shotType = value
      break
    case 'camera.angle':
      studio.currentProject.camera!.angle = value
      break
    case 'camera.movement':
      studio.currentProject.camera!.movement = value
      break
    case 'camera.lensFeel':
      studio.currentProject.camera!.lensFeel = value
      break
    case 'mood':
      studio.currentProject.mood = value
      break
    case 'style':
      studio.currentProject.style = value
      break
    case 'lighting':
      studio.currentProject.lighting = value
      break
    case 'composition':
      studio.currentProject.composition = value
      break
    case 'camera.captureDevice':
      studio.currentProject.camera!.captureDevice = value
      break
    case 'sceneCharacter.type':
      if (characterId) updateSceneCharacter(characterId, 'type', value)
      break
    case 'sceneCharacter.position':
      if (characterId) updateSceneCharacter(characterId, 'position', value)
      break
    case 'sceneCharacter.spatialRelation':
      if (characterId) updateSceneCharacter(characterId, 'spatialRelation', value)
      break
  }
}

const saveProjectCustomGuidedValue = async (
  key: GuidedVocabularyKey,
  path: ProjectGuidedFieldPath,
  payload: SaveCustomGuidedPayload,
  characterId?: string,
) => {
  const savedValue = await studio.addCustomGuidedOption({
    key,
    label: payload.label,
    value: payload.value,
    locale: optionLocale.value as AppLocale,
    medium: currentMedium.value,
  })

  if (!savedValue) return

  applyProjectGuidedValue(path, savedValue, characterId)
}

const characterReferenceLabel = (
  character: Pick<SceneCharacter, 'label' | 'description' | 'type'>,
  index: number,
) =>
  character.label?.trim() ||
  character.description?.trim() ||
  character.type?.trim() ||
  t('builder.characters.fallbackLabel', { index: index + 1 })

const sceneCharacterReferenceOptions = (characterId: string): StudioSelectOption[] => [
  {
    value: '__main__',
    label: t('builder.characters.mainSubjectReference'),
    description:
      [
        studio.currentProject.subject.type
          ? getOptionLabel(subjectTypeOptions.value, studio.currentProject.subject.type)
          : '',
        studio.currentProject.subject.position
          ? getOptionLabel(scenePositionOptions.value, studio.currentProject.subject.position)
          : '',
        studio.currentProject.subject.description?.trim(),
      ]
        .filter(Boolean)
        .join(' · ') ||
      t('builder.characters.mainSubjectReference'),
  },
  ...(studio.currentProject.sceneCharacters ?? [])
    .filter((character) => character.id !== characterId)
    .map((character, index) => ({
      value: character.id,
      label: characterReferenceLabel(character, index),
      description: [
        character.description?.trim(),
        character.position
          ? getOptionLabel(scenePositionOptions.value, character.position)
          : '',
        character.appearance?.trim(),
        character.action?.trim(),
      ]
        .filter(Boolean)
        .join(' · '),
      badge: t(`builder.characters.roles.${character.role}`),
    })),
]

const getOptionLabel = (options: { value: string; label: string }[], value: string) =>
  options.find((option) => option.value === value)?.label ?? value

const getFeaturedOptions = (
  options: { value: string; label: string; featured?: boolean }[],
  limit = 5,
) => {
  const curated = options.filter((option) => option.featured)
  return (curated.length ? curated : options).slice(0, limit)
}

const subjectLibraryCharacters = computed(() => {
  const query = studio.subjectLibrarySearch.trim().toLowerCase()

  return studio.libraryElements
    .filter((element) => {
      if (element.type !== 'character') return false
      if (!query) return true

      return [element.name, element.description, ...element.tags].some((value) =>
        value.toLowerCase().includes(query),
      )
    })
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 4)
})

const openSubjectLibraryDialog = () => {
  subjectLibraryDialogMode.value = 'subject'
  subjectLibraryDialogCharacterId.value = null
  subjectLibraryDialogOpen.value = true
}

const openSecondaryCharacterLibraryDialog = (characterId: string) => {
  subjectLibraryDialogMode.value = 'secondary'
  subjectLibraryDialogCharacterId.value = characterId
  subjectLibraryDialogOpen.value = true
}

const closeSubjectLibraryDialog = () => {
  subjectLibraryDialogOpen.value = false
  subjectLibraryDialogCharacterId.value = null
}

const applySubjectLibraryCharacter = (elementId: string) => {
  if (subjectLibraryDialogMode.value === 'secondary') {
    if (subjectLibraryDialogCharacterId.value) {
      studio.applyLibraryCharacterToSceneCharacter(
        subjectLibraryDialogCharacterId.value,
        elementId,
      )
    }
  } else {
    studio.applyLibraryCharacterAsSubject(elementId)
  }
  closeSubjectLibraryDialog()
}

const bundleItemLabel = (item: ContextualBundleItem) => {
  switch (item.field) {
    case 'environment.weather':
      return getOptionLabel(weatherOptions.value, item.value)
    case 'environment.timeOfDay':
      return getOptionLabel(timeOfDayOptions.value, item.value)
    case 'mood':
      return getOptionLabel(moodOptions.value, item.value)
    case 'style':
      return getOptionLabel(styleOptions.value, item.value)
    case 'lighting':
      return getOptionLabel(lightingOptions.value, item.value)
    case 'composition':
      return getOptionLabel(compositionOptions.value, item.value)
    case 'camera.shotType':
      return getOptionLabel(shotTypeOptions.value, item.value)
    case 'camera.movement':
      return getOptionLabel(movementOptions.value, item.value)
    case 'camera.lensFeel':
      return getOptionLabel(lensFeelOptions.value, item.value)
  }
}

const bundleToneClass = (tone: 'glow' | 'peach' | 'mist') => {
  switch (tone) {
    case 'glow':
      return 'border-glow/20 bg-glow/[0.08]'
    case 'peach':
      return 'border-peach/20 bg-peach/[0.08]'
    default:
      return 'border-white/10 bg-white/[0.05]'
  }
}

const bundleIcon = (icon: 'wand-magic-sparkles' | 'sliders' | 'film') =>
  ['fas', icon] as [string, string]

const stageHasContent = computed<Record<WorkspaceStageId, boolean>>(() => ({
  project: Boolean(
    studio.currentProject.title ||
      studio.currentProject.description ||
      studio.currentProject.tags.length,
  ),
  subject: Boolean(
    studio.currentProject.subject.type ||
      studio.currentProject.subject.description ||
      studio.currentProject.subject.action ||
      studio.currentProject.subject.position,
  ),
  world: Boolean(
    studio.currentProject.environment.location ||
      studio.currentProject.environment.weather ||
      studio.currentProject.environment.timeOfDay ||
      studio.currentProject.environment.season ||
      studio.currentProject.environment.era ||
      (studio.currentProject.medium === 'video' &&
        (studio.currentProject.motion?.subjectMotion ||
          studio.currentProject.motion?.environmentMotion ||
          studio.currentProject.camera?.shotType ||
          studio.currentProject.camera?.movement)),
  ),
  scene: Boolean(studio.currentProject.mood),
  composition: Boolean(
    studio.currentProject.style ||
      studio.currentProject.lighting ||
      studio.currentProject.composition ||
      studio.currentProject.camera?.captureDevice,
  ),
  details: Boolean(
    studio.currentProject.details.length || studio.linkedLibraryElements.length,
  ),
}))

const workspaceStages = computed<
  { id: WorkspaceStageId; title: string; caption: string; status: 'active' | 'complete' | 'idle' }[]
>(() =>
  stageOrder.map((stageId) => ({
    id: stageId,
    title: t(`studio.stages.${stageId}.title`),
    caption: t(`studio.stages.${stageId}.caption`),
    status:
      activeStage.value === stageId
        ? 'active'
        : stageHasContent.value[stageId]
          ? 'complete'
          : 'idle',
  })),
)

const activeStageMeta = computed(() => ({
  title: t(`studio.stages.${activeStage.value}.title`),
  description: t(`studio.stages.${activeStage.value}.description`),
}))

const toolTabs = computed(() => [
  { id: 'inspire', label: t('studio.toolsTabs.inspire') },
  { id: 'reuse', label: t('studio.toolsTabs.reuse') },
  { id: 'project', label: t('studio.toolsTabs.project') },
])

const quickTemplates = computed(() => {
  const search = studio.quickTemplateSearch.trim().toLowerCase()

  return [...studio.templates]
    .filter((template) => {
      const matchesFilter =
        studio.quickTemplateFilter === 'all'
          ? true
          : template.project.medium === studio.quickTemplateFilter
      const matchesSearch = search
        ? template.title.toLowerCase().includes(search)
        : true

      return matchesFilter && matchesSearch
    })
    .sort((left, right) => {
      if (left.project.medium === studio.currentProject.medium && right.project.medium !== studio.currentProject.medium) return -1
      if (left.project.medium !== studio.currentProject.medium && right.project.medium === studio.currentProject.medium) return 1
      return left.title.localeCompare(right.title)
    })
    .slice(0, 3)
})

const quickLibraryElements = computed(() => {
  const search = studio.quickLibrarySearch.trim().toLowerCase()

  return studio.libraryElements
    .filter((element) => {
      const matchesFilter =
        studio.quickLibraryFilter === 'all'
          ? true
          : element.type === studio.quickLibraryFilter
      const matchesSearch = search
        ? element.name.toLowerCase().includes(search)
        : true

      return matchesFilter && matchesSearch
    })
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 4)
})

const quickTemplateFilterKeys = ['all', 'image', 'video'] as const
const quickLibraryFilterKeys = ['all', 'character', 'location', 'scene', 'composition', 'detail'] as const
const mediumCards = computed(() => [
  {
    id: 'image',
    label: t('app.mediumImage'),
    description: t('studio.mediumCards.image'),
    icon: ['fas', 'image'] as [string, string],
  },
  {
    id: 'video',
    label: t('app.mediumVideo'),
    description: t('studio.mediumCards.video'),
    icon: ['fas', 'film'] as [string, string],
  },
])
const mediumLabel = computed(() =>
  studio.currentProject.medium === 'image' ? t('app.mediumImage') : t('app.mediumVideo'),
)
const projectStats = computed(() => [
  {
    label: t('studio.metrics.medium'),
    value: mediumLabel.value,
    tone: 'border-white/10 bg-white/[0.06] text-white',
  },
  {
    label: t('studio.metrics.linked'),
    value: String(studio.linkedLibraryElements.length),
    tone: 'border-glow/20 bg-glow/[0.08] text-glow',
  },
  {
    label: t('studio.metrics.details'),
    value: String(studio.currentProject.details.length),
    tone: 'border-peach/20 bg-peach/[0.08] text-peach',
  },
  {
    label: t('studio.metrics.smart'),
    value: String(studio.contextualBundles.length),
    tone: 'border-white/10 bg-white/[0.06] text-slate-200',
  },
])

const projectCompositionCards = computed(() => {
  const worldParts = [
    studio.currentProject.environment.location,
    studio.currentProject.environment.weather,
    studio.currentProject.environment.timeOfDay,
    studio.currentProject.environment.era,
  ].filter(Boolean)

  const lookParts = [
    studio.currentProject.mood,
    studio.currentProject.style,
    studio.currentProject.camera?.captureDevice,
  ].filter(Boolean)
  const motionParts =
    studio.currentProject.medium === 'video'
      ? [
          studio.currentProject.motion?.subjectMotion,
          studio.currentProject.camera?.movement,
          studio.currentProject.camera?.shotType,
        ].filter(Boolean)
      : []

  return [
    {
      id: 'subject',
      label: t('studio.composition.subject'),
      value:
        [
          studio.currentProject.subject.type,
          studio.currentProject.subject.description,
          studio.currentProject.subject.action,
          studio.currentProject.subject.position,
          (studio.currentProject.sceneCharacters?.length ?? 0) > 0
            ? `${studio.currentProject.sceneCharacters?.length} ${t('builder.characters.additionalCount')}`
            : '',
        ]
          .filter(Boolean)
          .join(', ') || t('studio.composition.emptySubject'),
      icon: ['fas', 'object-group'] as [string, string],
    },
    {
      id: 'world',
      label: t('studio.composition.world'),
      value: worldParts.join(' • ') || t('studio.composition.emptyWorld'),
      icon: ['fas', 'layer-group'] as [string, string],
    },
    {
      id: 'look',
      label: t('studio.composition.look'),
      value: lookParts.join(' • ') || t('studio.composition.emptyLook'),
      icon: ['fas', 'sliders'] as [string, string],
    },
    {
      id: 'light',
      label: t('studio.composition.light'),
      value:
        [
          studio.currentProject.lighting,
          studio.currentProject.composition,
          studio.currentProject.camera?.captureDevice,
        ]
          .filter(Boolean)
          .join(' • ') || t('studio.composition.emptyLight'),
      icon: ['fas', 'image'] as [string, string],
    },
    {
      id: 'library',
      label: t('studio.composition.library'),
      value:
        studio.linkedLibraryElements.map((element) => element.name).join(' • ') ||
        t('studio.composition.emptyLibrary'),
      icon: ['fas', 'wand-magic-sparkles'] as [string, string],
    },
    {
      id: 'details',
      label:
        studio.currentProject.medium === 'video'
          ? t('studio.composition.motion')
          : t('studio.composition.details'),
      value:
        (studio.currentProject.medium === 'video'
          ? motionParts.join(' • ')
          : studio.currentProject.details.slice(0, 3).join(' • ')) ||
        (studio.currentProject.medium === 'video'
          ? t('studio.composition.emptyMotion')
          : t('studio.composition.emptyDetails')),
      icon:
        studio.currentProject.medium === 'video'
          ? (['fas', 'film'] as [string, string])
          : (['fas', 'wand-magic-sparkles'] as [string, string]),
    },
  ]
})

const promptOutline = computed(() => {
  const items = [
    {
      id: 'subject',
      label: t('preview.outline.subject'),
      value:
        [studio.currentProject.subject.type, studio.currentProject.subject.description]
          .filter(Boolean)
          .join(', '),
    },
    {
      id: 'world',
      label: t('preview.outline.world'),
      value:
        [
          studio.currentProject.environment.location,
          studio.currentProject.environment.weather,
          studio.currentProject.environment.timeOfDay,
        ]
          .filter(Boolean)
          .join(', '),
    },
    {
      id: 'look',
      label: t('preview.outline.look'),
      value:
        [studio.currentProject.mood, studio.currentProject.style]
          .filter(Boolean)
          .join(', '),
    },
    {
      id: 'camera',
      label:
        studio.currentProject.medium === 'video'
          ? t('preview.outline.camera')
          : t('preview.outline.light'),
      value:
        studio.currentProject.medium === 'video'
          ? [
              studio.currentProject.camera?.captureDevice,
              studio.currentProject.camera?.shotType,
              studio.currentProject.camera?.movement,
            ]
              .filter(Boolean)
              .join(', ')
          : [
              studio.currentProject.lighting,
              studio.currentProject.composition,
              studio.currentProject.camera?.captureDevice,
            ]
              .filter(Boolean)
              .join(', '),
    },
    {
      id: 'details',
      label: t('preview.outline.details'),
      value: studio.currentProject.details.slice(0, 2).join(', '),
    },
  ]

  return items.filter((item) => item.value)
})

const positivePromptWordCount = computed(() =>
  studio.currentPositivePrompt.trim()
    ? studio.currentPositivePrompt.trim().split(/\s+/).length
    : 0,
)

const outputSummaryCards = computed(() => [
  { label: t('studio.output.promptWords'), value: String(positivePromptWordCount.value) },
  { label: t('studio.output.linked'), value: String(studio.linkedLibraryElements.length) },
  { label: t('studio.output.details'), value: String(studio.currentProject.details.length) },
  { label: t('studio.output.tags'), value: String(studio.currentProject.tags.length) },
])

const selectStage = (stageId: string) => {
  activeStage.value = stageId as WorkspaceStageId

  if (stageId === 'details') {
    activeToolTab.value = 'inspire'
  }
}

const goToAdjacentStage = (direction: -1 | 1) => {
  const currentIndex = stageOrder.indexOf(activeStage.value)
  const nextStage = stageOrder[currentIndex + direction]

  if (nextStage) {
    selectStage(nextStage)
  }
}

const openTemplateWorkshop = async () => {
  studio.resetTemplateDraft()
  await router.push('/studio/templates')
}
</script>

<template>
  <div class="grid gap-6 xl:grid-cols-[1.32fr_0.68fr] 2xl:grid-cols-[1.4fr_0.6fr]">
    <div class="space-y-6">
      <section class="glass-panel rounded-[34px] px-6 py-6 md:px-8">
        <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
          <div class="max-w-2xl space-y-2">
            <p class="text-xs uppercase tracking-[0.28em] text-glow">{{ t('studio.builderKicker') }}</p>
            <h2 class="max-w-[14ch] font-display text-3xl leading-[1.02] text-white md:text-4xl">
              {{ studio.currentProject.title || t('builder.placeholders.title') }}
            </h2>
            <p class="max-w-2xl text-sm leading-7 text-slate-300 md:text-base md:leading-7">
              {{ studio.currentProject.description || t('studio.builderSubtitle') }}
            </p>
          </div>
          <div class="flex w-full max-w-xl flex-col gap-3 xl:items-end">
            <div class="flex w-full flex-wrap gap-2 xl:justify-end">
              <button
                v-for="card in mediumCards"
                :key="card.id"
                type="button"
                class="inline-flex items-center gap-3 rounded-full border px-4 py-3 text-left transition"
                :class="
                  studio.currentProject.medium === card.id
                    ? 'border-glow/35 bg-glow/12'
                    : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08]'
                "
                @click="studio.currentProject.medium = card.id as PromptMedium"
              >
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/50 text-glow">
                  <FontAwesomeIcon :icon="card.icon" />
                </div>
                <span class="font-medium text-white">{{ card.label }}</span>
              </button>
            </div>
            <div class="flex flex-wrap gap-2 xl:justify-end">
              <button class="rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5" @click="studio.saveProject">
                <FontAwesomeIcon :icon="['far', 'floppy-disk']" class="mr-2" />
                {{ t('app.saveProject') }}
              </button>
              <button class="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10" @click="studio.newProject()">
                <FontAwesomeIcon :icon="['fas', 'wand-magic-sparkles']" class="mr-2" />
                {{ t('app.startFresh') }}
              </button>
              <button class="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10" @click="studio.exportJson">
                <FontAwesomeIcon :icon="['fas', 'file-arrow-down']" class="mr-2" />
                {{ t('app.exportJson') }}
              </button>
            </div>
          </div>
        </div>

        <div data-testid="builder-hero-stats" class="mt-5 flex flex-wrap gap-2">
          <div
            v-for="stat in projectStats"
            :key="stat.label"
            class="inline-flex items-center gap-3 rounded-full border px-4 py-2.5"
            :class="stat.tone"
          >
            <span class="text-[10px] uppercase tracking-[0.24em] opacity-75">{{ stat.label }}</span>
            <span class="font-display text-xl leading-none">{{ stat.value }}</span>
          </div>
        </div>

        <div class="mt-5">
          <WorkspaceStageStepper
            :stages="workspaceStages"
            :active-stage="activeStage"
            @select="selectStage"
          />
        </div>
      </section>

      <BasePanel class="relative z-30" :title="activeStageMeta.title" :subtitle="activeStageMeta.description">
        <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div class="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.22em] text-slate-400">
            {{ t(`studio.stages.${activeStage}.caption`) }}
          </div>
          <div class="flex gap-2">
            <button
              type="button"
              class="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="stageOrder.indexOf(activeStage) === 0"
              @click="goToAdjacentStage(-1)"
            >
              {{ t('studio.stageBack') }}
            </button>
            <button
              type="button"
              class="rounded-full border border-glow/20 bg-glow/10 px-4 py-2 text-sm text-glow transition hover:bg-glow/15 disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="stageOrder.indexOf(activeStage) === stageOrder.length - 1"
              @click="goToAdjacentStage(1)"
            >
              {{ t('studio.stageNext') }}
            </button>
          </div>
        </div>

        <div v-if="activeStage === 'project'" class="space-y-6">
          <section class="space-y-3 rounded-[26px] border border-white/8 bg-white/[0.03] p-4 md:p-5">
            <h3 class="text-lg font-semibold text-white">{{ t('studio.workspace.projectMetaTitle') }}</h3>
            <p class="text-sm leading-7 text-slate-400">{{ t('studio.workspace.projectMetaSubtitle') }}</p>
            <div class="grid gap-4 md:grid-cols-2">
              <FieldBlock :label="t('builder.fields.title')">
                <input v-model="studio.currentProject.title" :placeholder="t('builder.placeholders.title')" class="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-glow/40 focus:bg-slate-950/80" />
              </FieldBlock>
              <FieldBlock :label="t('builder.fields.tags')">
                <input :value="studio.currentProject.tags.join(', ')" :placeholder="t('builder.placeholders.tags')" class="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-glow/40 focus:bg-slate-950/80" @input="studio.updateTags(($event.target as HTMLInputElement).value)" />
              </FieldBlock>
              <div class="md:col-span-2">
                <FieldBlock :label="t('builder.fields.description')">
                  <textarea v-model="studio.currentProject.description" :placeholder="t('builder.placeholders.description')" rows="3" class="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-glow/40 focus:bg-slate-950/80" />
                </FieldBlock>
              </div>
            </div>
          </section>
        </div>

        <div v-else-if="activeStage === 'subject'" class="space-y-6">
          <section class="space-y-3 rounded-[26px] border border-white/8 bg-white/[0.03] p-4 md:p-5">
            <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 class="text-lg font-semibold text-white">{{ t('builder.sections.subject') }}</h3>
                <p class="text-sm leading-7 text-slate-400">{{ t('studio.workspace.subjectSubtitle') }}</p>
              </div>
              <button
                type="button"
                data-testid="subject-library-open"
                class="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                @click="openSubjectLibraryDialog"
              >
                <FontAwesomeIcon :icon="['fas', 'layer-group']" class="mr-2 text-glow" />
                {{ t('builder.characters.loadFromLibrary') }}
              </button>
            </div>
            <div class="grid gap-4 md:grid-cols-2">
              <FieldBlock :label="t('builder.fields.subjectType')"><GuidedCombobox v-model="studio.currentProject.subject.type" :options="subjectTypeOptions" :placeholder="t('builder.fields.subjectType')" :icon="['fas', 'object-group']" v-bind="guidedProps(t('builder.guided.subjectHint'), t('builder.fields.subjectType'))" @save-custom="saveProjectCustomGuidedValue('subjectType', 'subject.type', $event)" /></FieldBlock>
              <FieldBlock :label="t('builder.fields.subjectDescription')"><textarea v-model="studio.currentProject.subject.description" rows="3" class="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none transition focus:border-glow/40" /></FieldBlock>
              <FieldBlock :label="t('builder.fields.subjectAppearance')"><textarea v-model="studio.currentProject.subject.appearance" rows="3" class="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none transition focus:border-glow/40" /></FieldBlock>
              <FieldBlock :label="t('builder.fields.subjectAction')"><textarea v-model="studio.currentProject.subject.action" rows="3" class="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none transition focus:border-glow/40" /></FieldBlock>
              <FieldBlock :label="t('builder.fields.subjectPosition')"><GuidedCombobox v-model="studio.currentProject.subject.position" :options="scenePositionOptions" :placeholder="t('builder.fields.subjectPosition')" :icon="['fas', 'layer-group']" v-bind="guidedProps(t('builder.characters.positionHint'), t('builder.fields.subjectPosition'))" @save-custom="saveProjectCustomGuidedValue('scenePosition', 'subject.position', $event)" /></FieldBlock>
            </div>
          </section>

          <div
            v-if="subjectLibraryDialogOpen"
            data-testid="subject-library-dialog"
            class="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm"
            @click.self="closeSubjectLibraryDialog"
          >
            <div class="w-full max-w-3xl rounded-[30px] border border-white/10 bg-[#0b1020]/95 p-5 shadow-haze md:p-6">
              <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p class="text-xs uppercase tracking-[0.28em] text-glow">{{ t('builder.characters.libraryTitle') }}</p>
                  <h4 class="mt-2 text-xl font-semibold text-white">
                    {{
                      subjectLibraryDialogMode === 'subject'
                        ? t('builder.characters.dialogTitle')
                        : t('builder.characters.secondaryDialogTitle')
                    }}
                  </h4>
                  <p class="mt-2 text-sm leading-7 text-slate-400">
                    {{
                      subjectLibraryDialogMode === 'subject'
                        ? t('builder.characters.dialogSubtitle')
                        : t('builder.characters.secondaryDialogSubtitle')
                    }}
                  </p>
                </div>
                <div class="flex flex-wrap gap-2">
                  <RouterLink
                    to="/studio/library"
                    class="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                    @click="closeSubjectLibraryDialog"
                  >
                    <FontAwesomeIcon :icon="['fas', 'layer-group']" class="mr-2 text-glow" />
                    {{ t('builder.characters.manageLibrary') }}
                  </RouterLink>
                  <button
                    type="button"
                    class="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                    @click="closeSubjectLibraryDialog"
                  >
                    <FontAwesomeIcon :icon="['fas', 'xmark']" class="mr-2" />
                    {{ t('builder.characters.closeLibraryDialog') }}
                  </button>
                </div>
              </div>

              <div class="relative mt-5">
                <FontAwesomeIcon :icon="['fas', 'magnifying-glass']" class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  v-model="studio.subjectLibrarySearch"
                  :placeholder="t('builder.characters.librarySearch')"
                  class="w-full rounded-2xl border border-white/10 bg-slate-950/70 py-3 pl-11 pr-4 text-white placeholder:text-slate-500 outline-none transition focus:border-glow/40"
                />
              </div>

              <div v-if="subjectLibraryCharacters.length" class="mt-5 grid gap-3 md:grid-cols-2">
                <button
                  v-for="element in subjectLibraryCharacters"
                  :key="`subject-library-${element.id}`"
                  type="button"
                  data-testid="subject-library-card"
                  class="rounded-[24px] border border-white/10 bg-slate-950/40 p-4 text-left transition hover:border-glow/25 hover:bg-white/[0.06]"
                  @click="applySubjectLibraryCharacter(element.id)"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <p class="font-medium text-white">{{ element.name }}</p>
                      <p class="mt-2 text-sm leading-6 text-slate-300">{{ studio.renderLibraryElementDescription(element) }}</p>
                    </div>
                    <span class="rounded-full border border-glow/20 bg-glow/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-glow">
                      {{ t('library.character') }}
                    </span>
                  </div>
                  <div class="mt-3 flex flex-wrap gap-2">
                    <ChipTag v-for="tag in element.tags.slice(0, 2)" :key="`${element.id}-${tag}`" :label="tag" />
                  </div>
                </button>
              </div>
              <p
                v-else
                class="mt-5 rounded-[22px] border border-dashed border-white/10 bg-white/[0.04] px-4 py-4 text-sm leading-6 text-slate-400"
              >
                {{ t('builder.characters.libraryEmpty') }}
              </p>
            </div>
          </div>

          <section class="space-y-4 rounded-[26px] border border-white/8 bg-white/[0.03] p-4 md:p-5">
            <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 class="text-lg font-semibold text-white">{{ t('builder.characters.title') }}</h3>
                <p class="text-sm leading-7 text-slate-400">{{ t('builder.characters.subtitle') }}</p>
              </div>
              <button
                type="button"
                class="rounded-full border border-glow/20 bg-glow/10 px-4 py-2 text-sm text-glow transition hover:bg-glow/15"
                @click="addSceneCharacter"
              >
                <FontAwesomeIcon :icon="['fas', 'plus']" class="mr-2" />
                {{ t('builder.characters.add') }}
              </button>
            </div>

            <div v-if="studio.currentProject.sceneCharacters?.length" class="space-y-4">
              <article
                v-for="(character, index) in studio.currentProject.sceneCharacters"
                :key="character.id"
                class="rounded-[24px] border border-white/10 bg-slate-950/35 p-4"
              >
                <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p class="text-xs uppercase tracking-[0.22em] text-slate-500">
                      {{ t('builder.characters.cardLabel', { index: index + 1 }) }}
                    </p>
                    <p class="mt-2 font-medium text-white">
                      {{ characterReferenceLabel(character, index) }}
                    </p>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <button
                      type="button"
                      :data-testid="`secondary-library-open-${index}`"
                      class="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 transition hover:bg-white/10"
                      @click="openSecondaryCharacterLibraryDialog(character.id)"
                    >
                      <FontAwesomeIcon :icon="['fas', 'layer-group']" class="mr-2 text-glow" />
                      {{ t('builder.characters.loadFromLibrary') }}
                    </button>
                    <button
                      type="button"
                      :aria-label="t('builder.characters.remove')"
                      class="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10"
                      @click="removeSceneCharacter(character.id)"
                    >
                      <FontAwesomeIcon :icon="['fas', 'xmark']" />
                    </button>
                  </div>
                </div>

                <div class="mt-4 grid gap-4 md:grid-cols-2">
                  <FieldBlock :label="t('builder.characters.label')">
                    <input
                      :value="character.label"
                      class="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-glow/40"
                      :placeholder="t('builder.characters.labelPlaceholder')"
                      @input="updateSceneCharacter(character.id, 'label', ($event.target as HTMLInputElement).value)"
                    />
                  </FieldBlock>

                  <FieldBlock :label="t('builder.characters.role')">
                    <div class="flex flex-wrap gap-2">
                      <button
                        type="button"
                        class="rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em] transition"
                        :class="character.role === 'secondary' ? 'border-glow/30 bg-glow/15 text-glow' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'"
                        @click="updateSceneCharacter(character.id, 'role', 'secondary')"
                      >
                        {{ t('builder.characters.roles.secondary') }}
                      </button>
                      <button
                        type="button"
                        class="rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em] transition"
                        :class="character.role === 'background' ? 'border-glow/30 bg-glow/15 text-glow' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'"
                        @click="updateSceneCharacter(character.id, 'role', 'background')"
                      >
                        {{ t('builder.characters.roles.background') }}
                      </button>
                    </div>
                  </FieldBlock>

                  <FieldBlock :label="t('builder.fields.subjectType')">
                    <GuidedCombobox
                      :model-value="character.type"
                      :options="subjectTypeOptions"
                      :placeholder="t('builder.fields.subjectType')"
                      :icon="['fas', 'object-group']"
                      v-bind="guidedProps(t('builder.guided.subjectHint'), t('builder.fields.subjectType'))"
                      @update:model-value="updateSceneCharacter(character.id, 'type', $event)"
                      @save-custom="saveProjectCustomGuidedValue('subjectType', 'sceneCharacter.type', $event, character.id)"
                    />
                  </FieldBlock>

                  <FieldBlock :label="t('builder.fields.subjectDescription')">
                    <textarea
                      :value="character.description"
                      rows="3"
                      class="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none transition focus:border-glow/40"
                      @input="updateSceneCharacter(character.id, 'description', ($event.target as HTMLTextAreaElement).value)"
                    />
                  </FieldBlock>

                  <FieldBlock :label="t('builder.fields.subjectAppearance')">
                    <textarea
                      :value="character.appearance"
                      rows="3"
                      class="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none transition focus:border-glow/40"
                      @input="updateSceneCharacter(character.id, 'appearance', ($event.target as HTMLTextAreaElement).value)"
                    />
                  </FieldBlock>

                  <FieldBlock :label="t('builder.fields.subjectAction')">
                    <textarea
                      :value="character.action"
                      rows="3"
                      class="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none transition focus:border-glow/40"
                      @input="updateSceneCharacter(character.id, 'action', ($event.target as HTMLTextAreaElement).value)"
                    />
                  </FieldBlock>

                  <FieldBlock :label="t('builder.characters.position')">
                    <GuidedCombobox
                      :model-value="character.position"
                      :options="scenePositionOptions"
                      :placeholder="t('builder.characters.position')"
                      :icon="['fas', 'layer-group']"
                      v-bind="guidedProps(t('builder.characters.positionHint'), t('builder.fields.subjectPosition'))"
                      @update:model-value="updateSceneCharacter(character.id, 'position', $event)"
                      @save-custom="saveProjectCustomGuidedValue('scenePosition', 'sceneCharacter.position', $event, character.id)"
                    />
                  </FieldBlock>

                  <FieldBlock :label="t('builder.characters.spatialRelation')">
                    <GuidedCombobox
                      :model-value="character.spatialRelation"
                      :options="spatialRelationOptions"
                      :placeholder="t('builder.characters.spatialRelation')"
                      :icon="['fas', 'sliders']"
                      v-bind="guidedProps(t('builder.characters.spatialRelationHint'), t('builder.characters.spatialRelation'))"
                      @update:model-value="updateSceneCharacter(character.id, 'spatialRelation', $event)"
                      @save-custom="saveProjectCustomGuidedValue('spatialRelation', 'sceneCharacter.spatialRelation', $event, character.id)"
                    />
                  </FieldBlock>

                  <div class="md:col-span-2">
                    <FieldBlock :label="t('builder.characters.relativeTo')">
                      <StudioSelect
                        :model-value="character.relatedCharacterId || ''"
                        :options="sceneCharacterReferenceOptions(character.id)"
                        :placeholder="t('builder.characters.noRelationTarget')"
                        :icon="['fas', 'object-group']"
                        :clearable="true"
                        :clear-label="t('app.clearSelection')"
                        @update:model-value="
                          updateSceneCharacter(character.id, 'relatedCharacterId', $event)
                        "
                      />
                    </FieldBlock>
                  </div>
                </div>
              </article>
            </div>

            <p
              v-else
              class="rounded-[22px] border border-dashed border-white/10 bg-white/[0.04] px-4 py-4 text-sm leading-6 text-slate-400"
            >
              {{ t('builder.characters.empty') }}
            </p>
          </section>
        </div>

        <div v-else-if="activeStage === 'world'" class="space-y-6">
          <section class="space-y-3 rounded-[26px] border border-white/8 bg-white/[0.03] p-4 md:p-5">
            <h3 class="text-lg font-semibold text-white">{{ t('builder.sections.environment') }}</h3>
            <p class="text-sm leading-7 text-slate-400">{{ t('studio.workspace.worldSubtitle') }}</p>
            <div class="grid gap-4 md:grid-cols-2">
              <FieldBlock :label="t('builder.fields.location')"><input v-model="studio.currentProject.environment.location" class="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none transition focus:border-glow/40" /></FieldBlock>
              <div class="md:col-span-2">
                <FieldBlock :label="t('builder.fields.worldDescription')"><textarea v-model="studio.currentProject.environment.description" rows="3" class="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none transition focus:border-glow/40" /></FieldBlock>
              </div>
              <FieldBlock :label="t('builder.fields.era')"><GuidedCombobox v-model="studio.currentProject.environment.era" :options="eraOptions" :placeholder="t('builder.fields.era')" :icon="['fas', 'layer-group']" v-bind="guidedProps(t('builder.guided.environmentHint'), t('builder.fields.era'))" @save-custom="saveProjectCustomGuidedValue('era', 'environment.era', $event)" /></FieldBlock>
              <FieldBlock :label="t('builder.fields.season')"><GuidedCombobox v-model="studio.currentProject.environment.season" :options="seasonOptions" :placeholder="t('builder.fields.season')" :icon="['fas', 'layer-group']" v-bind="guidedProps(t('builder.guided.environmentHint'), t('builder.fields.season'))" @save-custom="saveProjectCustomGuidedValue('season', 'environment.season', $event)" /></FieldBlock>
              <FieldBlock :label="t('builder.fields.weather')"><GuidedCombobox v-model="studio.currentProject.environment.weather" :options="weatherOptions" :placeholder="t('builder.fields.weather')" :icon="['fas', 'layer-group']" v-bind="guidedProps(t('builder.guided.environmentHint'), t('builder.fields.weather'))" @save-custom="saveProjectCustomGuidedValue('weather', 'environment.weather', $event)" /></FieldBlock>
              <FieldBlock :label="t('builder.fields.timeOfDay')"><GuidedCombobox v-model="studio.currentProject.environment.timeOfDay" :options="timeOfDayOptions" :placeholder="t('builder.fields.timeOfDay')" :icon="['fas', 'layer-group']" v-bind="guidedProps(t('builder.guided.environmentHint'), t('builder.fields.timeOfDay'))" @save-custom="saveProjectCustomGuidedValue('timeOfDay', 'environment.timeOfDay', $event)" /></FieldBlock>
            </div>
          </section>

          <section v-if="studio.currentProject.medium === 'video'" class="space-y-3 rounded-[26px] border border-glow/12 bg-glow/[0.05] p-4 md:p-5">
            <h3 class="text-lg font-semibold text-white">{{ t('builder.sections.motion') }}</h3>
            <p class="text-sm leading-7 text-slate-300">{{ t('studio.workspace.motionSubtitle') }}</p>
            <div class="grid gap-4 md:grid-cols-2">
              <FieldBlock :label="t('builder.fields.subjectMotion')"><GuidedCombobox v-model="studio.currentProject.motion!.subjectMotion" :options="subjectMotionOptions" :placeholder="t('builder.fields.subjectMotion')" :icon="['fas', 'film']" v-bind="guidedProps(t('builder.guided.motionHint'), t('builder.fields.subjectMotion'))" @save-custom="saveProjectCustomGuidedValue('subjectMotion', 'motion.subjectMotion', $event)" /></FieldBlock>
              <FieldBlock :label="t('builder.fields.environmentMotion')"><GuidedCombobox v-model="studio.currentProject.motion!.environmentMotion" :options="environmentMotionOptions" :placeholder="t('builder.fields.environmentMotion')" :icon="['fas', 'film']" v-bind="guidedProps(t('builder.guided.motionHint'), t('builder.fields.environmentMotion'))" @save-custom="saveProjectCustomGuidedValue('environmentMotion', 'motion.environmentMotion', $event)" /></FieldBlock>
              <FieldBlock :label="t('builder.fields.shotType')"><GuidedCombobox v-model="studio.currentProject.camera!.shotType" :options="shotTypeOptions" :placeholder="t('builder.fields.shotType')" :icon="['fas', 'film']" v-bind="guidedProps(t('builder.guided.motionHint'), t('builder.fields.shotType'))" @save-custom="saveProjectCustomGuidedValue('shotType', 'camera.shotType', $event)" /></FieldBlock>
              <FieldBlock :label="t('builder.fields.angle')"><GuidedCombobox v-model="studio.currentProject.camera!.angle" :options="angleOptions" :placeholder="t('builder.fields.angle')" :icon="['fas', 'film']" v-bind="guidedProps(t('builder.guided.motionHint'), t('builder.fields.angle'))" @save-custom="saveProjectCustomGuidedValue('angle', 'camera.angle', $event)" /></FieldBlock>
              <FieldBlock :label="t('builder.fields.movement')"><GuidedCombobox v-model="studio.currentProject.camera!.movement" :options="movementOptions" :placeholder="t('builder.fields.movement')" :icon="['fas', 'film']" v-bind="guidedProps(t('builder.guided.motionHint'), t('builder.fields.movement'))" @save-custom="saveProjectCustomGuidedValue('movement', 'camera.movement', $event)" /></FieldBlock>
              <FieldBlock :label="t('builder.fields.lensFeel')"><GuidedCombobox v-model="studio.currentProject.camera!.lensFeel" :options="lensFeelOptions" :placeholder="t('builder.fields.lensFeel')" :icon="['fas', 'film']" v-bind="guidedProps(t('builder.guided.motionHint'), t('builder.fields.lensFeel'))" @save-custom="saveProjectCustomGuidedValue('lensFeel', 'camera.lensFeel', $event)" /></FieldBlock>
            </div>
          </section>
        </div>

        <div v-else-if="activeStage === 'scene'" class="grid gap-4 xl:grid-cols-2">
          <CreativeChoiceField :label="t('builder.fields.mood')" :helper="t('studio.choiceCards.mood')" :placeholder="t('builder.fields.mood')" :icon="['fas', 'wand-magic-sparkles']" :model-value="studio.currentProject.mood" :options="moodOptions" :featured-options="getFeaturedOptions(moodOptions)" :suggestion-label="t('builder.guided.suggested')" :custom-label="t('builder.guided.custom')" :no-results-label="t('builder.guided.noResults')" :canonical-label="t('builder.guided.canonical')" :group-labels="groupLabels" :locale="optionLocale" allow-create :add-action-label="t('builder.guided.addAction')" :add-prompt-label="t('builder.guided.promptLabel')" :add-prompt-placeholder="t('builder.guided.promptPlaceholder')" :add-helper-text="addCustomHelperText" :personal-label="t('builder.guided.personalOption')" :default-label="t('builder.guided.defaultOption')" show-personal-filter :all-options-label="t('builder.guided.allOptions')" :personal-only-label="t('builder.guided.personalOnly')" :suggested-group-label="t('builder.guided.suggestedGroup')" :target-field-label="t('builder.fields.mood')" :target-field-value-label="t('builder.guided.targetField')" :resolve-suggested-group="({ value }) => resolveSuggestedGroupLabel('mood', value)" @update:model-value="studio.currentProject.mood = $event" @save-custom="saveProjectCustomGuidedValue('mood', 'mood', $event)" />
        </div>

        <div v-else-if="activeStage === 'composition'" class="grid gap-4 xl:grid-cols-2">
          <CreativeChoiceField :label="t('builder.fields.style')" :helper="t('studio.choiceCards.style')" :placeholder="t('builder.fields.style')" :icon="['fas', 'sliders']" :model-value="studio.currentProject.style" :options="styleOptions" :featured-options="getFeaturedOptions(styleOptions)" :suggestion-label="t('builder.guided.suggested')" :custom-label="t('builder.guided.custom')" :no-results-label="t('builder.guided.noResults')" :canonical-label="t('builder.guided.canonical')" :group-labels="groupLabels" :locale="optionLocale" allow-create :add-action-label="t('builder.guided.addAction')" :add-prompt-label="t('builder.guided.promptLabel')" :add-prompt-placeholder="t('builder.guided.promptPlaceholder')" :add-helper-text="addCustomHelperText" :personal-label="t('builder.guided.personalOption')" :default-label="t('builder.guided.defaultOption')" show-personal-filter :all-options-label="t('builder.guided.allOptions')" :personal-only-label="t('builder.guided.personalOnly')" :suggested-group-label="t('builder.guided.suggestedGroup')" :target-field-label="t('builder.fields.style')" :target-field-value-label="t('builder.guided.targetField')" :resolve-suggested-group="({ value }) => resolveSuggestedGroupLabel('style', value)" @update:model-value="studio.currentProject.style = $event" @save-custom="saveProjectCustomGuidedValue('style', 'style', $event)" />
          <CreativeChoiceField :label="t('builder.fields.lighting')" :helper="t('studio.choiceCards.lighting')" :placeholder="t('builder.fields.lighting')" :icon="['fas', 'image']" :model-value="studio.currentProject.lighting" :options="lightingOptions" :featured-options="getFeaturedOptions(lightingOptions)" :suggestion-label="t('builder.guided.suggested')" :custom-label="t('builder.guided.custom')" :no-results-label="t('builder.guided.noResults')" :canonical-label="t('builder.guided.canonical')" :group-labels="groupLabels" :locale="optionLocale" allow-create :add-action-label="t('builder.guided.addAction')" :add-prompt-label="t('builder.guided.promptLabel')" :add-prompt-placeholder="t('builder.guided.promptPlaceholder')" :add-helper-text="addCustomHelperText" :personal-label="t('builder.guided.personalOption')" :default-label="t('builder.guided.defaultOption')" show-personal-filter :all-options-label="t('builder.guided.allOptions')" :personal-only-label="t('builder.guided.personalOnly')" :suggested-group-label="t('builder.guided.suggestedGroup')" :target-field-label="t('builder.fields.lighting')" :target-field-value-label="t('builder.guided.targetField')" :resolve-suggested-group="({ value }) => resolveSuggestedGroupLabel('lighting', value)" @update:model-value="studio.currentProject.lighting = $event" @save-custom="saveProjectCustomGuidedValue('lighting', 'lighting', $event)" />
          <CreativeChoiceField :label="t('builder.fields.composition')" :helper="t('studio.choiceCards.composition')" :placeholder="t('builder.fields.composition')" :icon="['fas', 'object-group']" :model-value="studio.currentProject.composition" :options="compositionOptions" :featured-options="getFeaturedOptions(compositionOptions)" :suggestion-label="t('builder.guided.suggested')" :custom-label="t('builder.guided.custom')" :no-results-label="t('builder.guided.noResults')" :canonical-label="t('builder.guided.canonical')" :group-labels="groupLabels" :locale="optionLocale" allow-create :add-action-label="t('builder.guided.addAction')" :add-prompt-label="t('builder.guided.promptLabel')" :add-prompt-placeholder="t('builder.guided.promptPlaceholder')" :add-helper-text="addCustomHelperText" :personal-label="t('builder.guided.personalOption')" :default-label="t('builder.guided.defaultOption')" show-personal-filter :all-options-label="t('builder.guided.allOptions')" :personal-only-label="t('builder.guided.personalOnly')" :suggested-group-label="t('builder.guided.suggestedGroup')" :target-field-label="t('builder.fields.composition')" :target-field-value-label="t('builder.guided.targetField')" :resolve-suggested-group="({ value }) => resolveSuggestedGroupLabel('composition', value)" @update:model-value="studio.currentProject.composition = $event" @save-custom="saveProjectCustomGuidedValue('composition', 'composition', $event)" />
          <CreativeChoiceField :label="t('builder.fields.captureDevice')" :helper="t('studio.choiceCards.captureDevice')" :placeholder="t('builder.fields.captureDevice')" :icon="['fas', 'camera']" :model-value="studio.currentProject.camera?.captureDevice" :options="captureDeviceOptions" :featured-options="getFeaturedOptions(captureDeviceOptions)" :suggestion-label="t('builder.guided.suggested')" :custom-label="t('builder.guided.custom')" :no-results-label="t('builder.guided.noResults')" :canonical-label="t('builder.guided.canonical')" :group-labels="groupLabels" :locale="optionLocale" allow-create :add-action-label="t('builder.guided.addAction')" :add-prompt-label="t('builder.guided.promptLabel')" :add-prompt-placeholder="t('builder.guided.promptPlaceholder')" :add-helper-text="addCustomHelperText" :personal-label="t('builder.guided.personalOption')" :default-label="t('builder.guided.defaultOption')" show-personal-filter :all-options-label="t('builder.guided.allOptions')" :personal-only-label="t('builder.guided.personalOnly')" :suggested-group-label="t('builder.guided.suggestedGroup')" :target-field-label="t('builder.fields.captureDevice')" :target-field-value-label="t('builder.guided.targetField')" :resolve-suggested-group="({ value }) => resolveSuggestedGroupLabel('captureDevice', value)" @update:model-value="studio.currentProject.camera!.captureDevice = $event" @save-custom="saveProjectCustomGuidedValue('captureDevice', 'camera.captureDevice', $event)" />
        </div>

        <div v-else-if="activeStage === 'details'" class="space-y-6">
          <section class="space-y-3 rounded-[26px] border border-white/8 bg-white/[0.03] p-4 md:p-5">
            <h3 class="text-lg font-semibold text-white">{{ t('builder.sections.details') }}</h3>
            <p class="text-sm leading-7 text-slate-400">{{ t('studio.workspace.detailsSubtitle') }}</p>
            <div class="flex gap-3">
              <input v-model="studio.detailDraft" :placeholder="t('builder.placeholders.detail')" class="flex-1 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none transition focus:border-glow/40" @keyup.enter="studio.addDetail" />
              <button class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm transition hover:bg-white/10" @click="studio.addDetail">+</button>
            </div>
            <div class="flex flex-wrap gap-2">
              <button v-for="detail in studio.currentProject.details" :key="detail" class="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-slate-200" @click="studio.removeDetail(detail)">
                {{ detail }}
              </button>
            </div>
          </section>

          <section class="rounded-[26px] border border-white/8 bg-white/[0.03] p-4 md:p-5">
            <div class="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-glow">
              <FontAwesomeIcon :icon="['fas', 'wand-magic-sparkles']" />
              {{ t('studio.workspace.linkedTitle') }}
            </div>
            <div v-if="studio.linkedLibraryElements.length" class="mt-4 flex flex-wrap gap-2">
              <ChipTag v-for="element in studio.linkedLibraryElements" :key="`detail-stage-${element.id}`" :label="element.name" />
            </div>
            <p v-else class="mt-4 text-sm leading-7 text-slate-400">
              {{ t('studio.workspace.linkedEmpty') }}
            </p>
          </section>
        </div>
      </BasePanel>

      <section class="relative z-0 glass-panel rounded-[30px] p-5 md:p-6">
        <div class="mb-4">
          <p class="text-xs uppercase tracking-[0.24em] text-glow">{{ t('studio.compositionTitle') }}</p>
          <p class="mt-2 text-sm leading-7 text-slate-300">{{ t('studio.compositionSubtitle') }}</p>
        </div>
        <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div
            v-for="card in projectCompositionCards"
            :key="card.id"
            class="rounded-[24px] border border-white/10 bg-white/[0.04] p-4"
          >
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/60 text-glow">
                <FontAwesomeIcon :icon="card.icon" />
              </div>
              <p class="text-xs uppercase tracking-[0.22em] text-slate-500">{{ card.label }}</p>
            </div>
            <p class="mt-4 text-sm leading-7 text-white">{{ card.value }}</p>
          </div>
        </div>
      </section>
    </div>

    <div class="space-y-6 xl:sticky xl:top-6 xl:self-start">
      <BasePanel :title="t('preview.title')" :subtitle="t('preview.subtitle')">
        <div class="mb-4 flex flex-wrap gap-2">
          <button class="rounded-full border border-glow/20 bg-glow/10 px-4 py-2 text-sm text-glow transition hover:bg-glow/15" @click="studio.exportText">
            <FontAwesomeIcon :icon="['fas', 'file-arrow-down']" class="mr-2" />
            {{ t('preview.exportText') }}
          </button>
          <button class="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10" @click="openTemplateWorkshop">
            <FontAwesomeIcon :icon="['fas', 'object-group']" class="mr-2" />
            {{ t('preview.saveAsPreset') }}
          </button>
        </div>

        <div v-if="studio.lastCreativeAction" class="mb-4 rounded-[22px] border border-glow/20 bg-glow/[0.08] px-4 py-3">
          <p class="text-[10px] uppercase tracking-[0.22em] text-glow">{{ t('preview.activityTitle') }}</p>
          <p class="mt-2 text-sm leading-6 text-white">{{ studio.lastCreativeAction }}</p>
        </div>

        <div v-if="promptOutline.length" class="mb-4 flex flex-wrap gap-2">
          <span
            v-for="item in promptOutline"
            :key="item.id"
            class="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-slate-300"
          >
            <span class="mr-2 text-slate-500">{{ item.label }}</span>
            {{ item.value }}
          </span>
        </div>

        <div class="mb-4 grid gap-3 sm:grid-cols-2">
          <div v-for="card in outputSummaryCards" :key="card.label" class="rounded-[22px] border border-white/10 bg-slate-950/35 px-4 py-4">
            <p class="text-[10px] uppercase tracking-[0.22em] text-slate-500">{{ card.label }}</p>
            <p class="mt-3 font-display text-2xl text-white">{{ card.value }}</p>
          </div>
        </div>

        <div class="mb-4 rounded-[22px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-4">
          <p class="text-sm leading-7 text-slate-300">{{ t('studio.output.note') }}</p>
        </div>

        <div class="space-y-4">
          <div class="rounded-[24px] border border-white/10 bg-white/5 p-4">
            <div class="mb-2 flex items-center justify-between gap-3">
              <p class="text-xs uppercase tracking-[0.3em] text-slate-400">{{ t('preview.positive') }}</p>
              <button
                type="button"
                class="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/10"
                :aria-label="t('preview.copyPositive')"
                @click="studio.copyPrompt('positive')"
              >
                <FontAwesomeIcon :icon="['far', 'copy']" />
              </button>
            </div>
            <p class="text-sm leading-7 text-slate-100">{{ studio.currentPositivePrompt || t('preview.empty') }}</p>
          </div>
          <div class="rounded-[24px] border border-white/10 bg-white/5 p-4">
            <div class="mb-2 flex items-center justify-between gap-3">
              <p class="text-xs uppercase tracking-[0.3em] text-slate-400">{{ t('preview.negative') }}</p>
              <button
                type="button"
                class="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/10"
                :aria-label="t('preview.copyNegative')"
                @click="studio.copyPrompt('negative')"
              >
                <FontAwesomeIcon :icon="['far', 'copy']" />
              </button>
            </div>
            <p class="text-sm leading-7 text-slate-300">{{ studio.currentNegativePrompt }}</p>
          </div>
        </div>
      </BasePanel>

      <BasePanel :title="t('studio.toolsTitle')" :subtitle="t('studio.toolsSubtitle')">
        <div class="flex gap-2 overflow-x-auto pb-1">
          <button
            v-for="tab in toolTabs"
            :key="tab.id"
            :data-testid="`workspace-tool-${tab.id}`"
            type="button"
            class="shrink-0 rounded-full border px-4 py-2 text-sm transition"
            :class="
              activeToolTab === tab.id
                ? 'border-glow/40 bg-glow/15 text-glow'
                : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
            "
            @click="activeToolTab = tab.id as WorkspaceToolTab"
          >
            {{ tab.label }}
          </button>
        </div>

        <div v-if="activeToolTab === 'inspire'" class="mt-5 space-y-5">
          <section>
            <div>
              <p class="font-medium text-white">{{ t('builder.guided.panelTitle') }}</p>
              <p class="mt-1 text-sm leading-6 text-slate-400">{{ t('builder.guided.panelSubtitle') }}</p>
            </div>
            <div class="mt-3 rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
              <div class="flex items-start gap-3">
                <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-glow/20 bg-glow/10 text-glow">
                  <FontAwesomeIcon :icon="['fas', 'wand-magic-sparkles']" />
                </div>
                <div>
                  <p class="font-medium text-white">{{ t('builder.guided.smartTitle') }}</p>
                  <p class="mt-1 text-sm leading-6 text-slate-300">{{ t('builder.guided.smartSubtitle') }}</p>
                </div>
              </div>

              <div v-if="studio.contextualBundles.length" class="mt-4 space-y-4">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="rounded-full border border-glow/20 bg-glow/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-glow">{{ t('builder.guided.majorTitle') }}</span>
                    <p class="text-sm text-slate-400">{{ t('builder.guided.majorSubtitle') }}</p>
                  </div>
                  <div class="mt-3 grid gap-3">
                    <div
                      v-for="bundle in studio.contextualBundles"
                      :key="bundle.id"
                      class="rounded-[24px] border p-4"
                      :class="bundleToneClass(bundle.tone)"
                    >
                      <div class="flex items-start justify-between gap-3">
                        <div class="flex items-start gap-3">
                          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/55 text-glow">
                            <FontAwesomeIcon :icon="bundleIcon(bundle.icon)" />
                          </div>
                          <div class="space-y-1">
                            <p class="text-xs uppercase tracking-[0.24em] text-slate-500">{{ t(bundle.titleKey) }}</p>
                            <p class="text-sm leading-6 text-white">{{ t(bundle.subtitleKey) }}</p>
                          </div>
                        </div>
                        <button type="button" class="rounded-full border border-glow/20 bg-glow/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-glow transition hover:bg-glow/15" @click="studio.applyContextualBundle(bundle)">
                          {{ t('builder.guided.applyBundle') }}
                        </button>
                      </div>
                      <div class="mt-4 rounded-[18px] border border-white/10 bg-slate-950/35 px-4 py-3">
                        <p class="text-[10px] uppercase tracking-[0.22em] text-slate-500">{{ t('builder.guided.reasonLabel') }}</p>
                        <p class="mt-2 text-sm leading-6 text-slate-300">{{ t(bundle.reasonKey) }}</p>
                      </div>
                      <div class="mt-4">
                        <p class="text-[10px] uppercase tracking-[0.22em] text-slate-500">{{ t('builder.guided.impactLabel') }}</p>
                      </div>
                      <div class="mt-3 flex flex-wrap gap-2">
                        <span v-for="item in bundle.items" :key="`${bundle.id}-${item.field}-${item.value}`" class="rounded-full border border-glow/15 bg-glow/10 px-3 py-1.5 text-xs text-glow">
                          {{ bundleItemLabel(item) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="mt-4 rounded-[24px] border border-dashed border-white/10 bg-slate-950/25 p-5">
                <p class="font-medium text-white">{{ t('builder.guided.smartEmptyTitle') }}</p>
                <p class="mt-2 text-sm leading-6 text-slate-400">{{ t('builder.guided.smartEmptyText') }}</p>
              </div>

              <div class="mt-4 border-t border-white/10 pt-4">
                <div class="flex items-center gap-2">
                  <span class="rounded-full border border-peach/20 bg-peach/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-peach">{{ t('builder.suggestions.fineTitle') }}</span>
                  <p class="text-sm text-slate-400">{{ t('builder.suggestions.fineSubtitle') }}</p>
                </div>
                <div class="mt-3 rounded-[22px] border border-white/10 bg-slate-950/25 px-4 py-3 text-sm leading-6 text-slate-300">
                  {{ t('builder.suggestions.note') }}
                </div>
                <div v-if="studio.suggestions.length" class="mt-3 grid gap-3">
                  <div
                    v-for="suggestion in studio.suggestions"
                    :key="suggestion.id"
                    class="rounded-[24px] border p-4"
                    :class="bundleToneClass(suggestion.tone)"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div class="flex items-start gap-3">
                        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/55 text-glow">
                          <FontAwesomeIcon :icon="['fas', suggestion.icon]" />
                        </div>
                        <div>
                          <p class="font-medium text-white">{{ t(suggestion.labelKey) }}</p>
                          <p class="mt-1 text-sm leading-6 text-slate-300">{{ t(suggestion.descriptionKey) }}</p>
                        </div>
                      </div>
                      <button type="button" class="rounded-full border border-glow/20 bg-glow/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-glow transition hover:bg-glow/15" @click="studio.applySuggestion(suggestion.id)">
                        {{ t('builder.suggestions.apply') }}
                      </button>
                    </div>
                    <div class="mt-4 rounded-[18px] border border-white/10 bg-slate-950/35 px-4 py-3">
                      <p class="text-[10px] uppercase tracking-[0.22em] text-slate-500">{{ t('builder.suggestions.reasonLabel') }}</p>
                      <p class="mt-2 text-sm leading-6 text-slate-300">{{ t(suggestion.reasonKey) }}</p>
                    </div>
                  </div>
                </div>
                <div v-else class="mt-3 rounded-[24px] border border-dashed border-white/10 bg-slate-950/25 p-5">
                  <p class="font-medium text-white">{{ t('builder.suggestions.emptyTitle') }}</p>
                  <p class="mt-2 text-sm leading-6 text-slate-400">{{ t('builder.suggestions.emptyText') }}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div v-else-if="activeToolTab === 'reuse'" class="mt-5 space-y-5">
          <section class="space-y-3">
            <div>
              <p class="font-medium text-white">{{ t('studio.quick.templatesListTitle') }}</p>
              <p class="mt-1 text-sm leading-6 text-slate-400">{{ t('studio.quick.templatesListSubtitle') }}</p>
            </div>
            <div class="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
              <div class="relative">
                <FontAwesomeIcon :icon="['fas', 'magnifying-glass']" class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input v-model="studio.quickTemplateSearch" :placeholder="t('studio.quick.searchTemplates')" class="w-full rounded-2xl border border-white/10 bg-slate-950/70 py-3 pl-11 pr-4 text-white placeholder:text-slate-500 outline-none transition focus:border-glow/40" />
              </div>
              <div class="mt-3 flex flex-wrap gap-2">
                <button v-for="filterKey in quickTemplateFilterKeys" :key="`quick-template-${filterKey}`" type="button" class="rounded-full border px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] transition" :class="studio.quickTemplateFilter === filterKey ? 'border-glow/40 bg-glow/15 text-glow' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'" @click="studio.quickTemplateFilter = filterKey">
                  {{ filterKey === 'all' ? t('templates.all') : filterKey === 'image' ? t('templates.image') : t('templates.video') }}
                </button>
              </div>
            </div>
            <div v-for="template in quickTemplates" :key="template.id" data-testid="quick-template-card" class="rounded-[24px] border border-white/10 bg-white/5 p-4 transition hover:-translate-y-0.5 hover:bg-white/10">
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-slate-300">{{ template.project.medium }}</span>
                    <span v-for="tag in template.project.tags.slice(0, 2)" :key="`${template.id}-${tag}`" class="rounded-full border border-glow/20 bg-glow/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-glow">{{ tag }}</span>
                  </div>
                  <p class="mt-3 font-medium text-white">{{ template.title }}</p>
                  <p class="mt-2 text-sm leading-6 text-slate-300">{{ template.description }}</p>
                </div>
                <button type="button" data-testid="quick-template-apply-button" class="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-glow transition hover:bg-white/10" @click="studio.applyTemplate(template.id)">
                  {{ t('studio.quick.applyNow') }}
                </button>
              </div>
            </div>
            <p v-if="!quickTemplates.length" class="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-slate-400">{{ t('studio.quick.emptyFilteredTemplates') }}</p>
          </section>

          <section class="space-y-3">
            <div>
              <p class="font-medium text-white">{{ t('studio.quick.libraryListTitle') }}</p>
              <p class="mt-1 text-sm leading-6 text-slate-400">{{ t('studio.quick.libraryListSubtitle') }}</p>
            </div>
            <div class="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
              <div class="relative">
                <FontAwesomeIcon :icon="['fas', 'magnifying-glass']" class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input v-model="studio.quickLibrarySearch" :placeholder="t('studio.quick.searchLibrary')" class="w-full rounded-2xl border border-white/10 bg-slate-950/70 py-3 pl-11 pr-4 text-white placeholder:text-slate-500 outline-none transition focus:border-glow/40" />
              </div>
              <div class="mt-3 flex flex-wrap gap-2">
                <button v-for="filterKey in quickLibraryFilterKeys" :key="`quick-library-${filterKey}`" type="button" class="rounded-full border px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] transition" :class="studio.quickLibraryFilter === filterKey ? 'border-glow/40 bg-glow/15 text-glow' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'" @click="studio.quickLibraryFilter = filterKey">
                  {{ t(`library.${filterKey}`) }}
                </button>
              </div>
            </div>
            <div v-for="element in quickLibraryElements" :key="element.id" data-testid="quick-library-card" class="rounded-[24px] border border-white/10 bg-white/5 p-4 transition hover:-translate-y-0.5 hover:bg-white/10">
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="rounded-full border border-glow/20 bg-glow/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-glow">{{ t(`library.${element.type}`) }}</span>
                    <span v-for="tag in element.tags.slice(0, 2)" :key="`${element.id}-${tag}`" class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-slate-300">{{ tag }}</span>
                  </div>
                  <p class="mt-3 font-medium text-white">{{ element.name }}</p>
                  <p class="mt-2 text-sm leading-6 text-slate-300">{{ studio.renderLibraryElementDescription(element) }}</p>
                </div>
                <button type="button" data-testid="quick-library-insert-button" class="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-glow transition hover:bg-white/10" @click="studio.insertLibraryElement(element)">
                  {{ t('studio.quick.insertNow') }}
                </button>
              </div>
            </div>
            <p v-if="!quickLibraryElements.length" class="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-slate-400">{{ t('studio.quick.emptyFilteredLibrary') }}</p>
          </section>

          <div v-if="studio.pendingLibraryInsertElement" data-testid="quick-library-confirm-panel" class="rounded-[24px] border border-glow/20 bg-glow/[0.08] p-4">
            <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p class="text-xs uppercase tracking-[0.24em] text-glow">{{ t('library.confirmTitle') }}</p>
                <p class="mt-2 text-sm leading-6 text-slate-200">{{ t('library.confirmSubtitle') }}</p>
              </div>
              <div class="flex flex-wrap gap-2">
                <button class="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 transition hover:bg-white/10" @click="studio.cancelLibraryInsert">{{ t('library.cancel') }}</button>
                <button class="rounded-full border border-white/15 bg-white px-3 py-2 text-xs font-semibold text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50" :disabled="!studio.pendingLibraryInsert.selectedMappingIds.length" @click="studio.confirmLibraryInsert">{{ t('library.confirmApply') }}</button>
              </div>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
              <button v-for="mapping in studio.pendingLibraryInsertMappings" :key="`builder-pending-${mapping.id}`" type="button" class="rounded-full border px-3 py-2 text-xs transition" :class="studio.pendingLibraryInsert.selectedMappingIds.includes(mapping.id) ? 'border-glow/30 bg-glow/15 text-glow' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'" @click="studio.toggleLibraryInsertMapping(mapping.id)">
                {{ t(mapping.labelKey) }}: {{ mapping.value }}
              </button>
            </div>
            <div v-if="studio.pendingLibraryInsertPositivePromptAfter" class="mt-4 grid gap-3 md:grid-cols-2">
              <div class="rounded-[20px] border border-white/10 bg-slate-950/35 p-4">
                <p class="text-[10px] uppercase tracking-[0.2em] text-slate-500">{{ t('library.promptBefore') }}</p>
                <p class="mt-3 text-sm leading-7 text-slate-300">{{ studio.pendingLibraryInsertPositivePromptBefore || t('preview.empty') }}</p>
              </div>
              <div class="rounded-[20px] border border-glow/15 bg-glow/[0.08] p-4">
                <p class="text-[10px] uppercase tracking-[0.2em] text-glow">{{ t('library.promptAfter') }}</p>
                <p class="mt-3 text-sm leading-7 text-white">{{ studio.pendingLibraryInsertPositivePromptAfter }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="mt-5 space-y-5">
          <section class="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            <div class="mb-3 flex items-center gap-2 text-sm text-slate-300">
              <FontAwesomeIcon :icon="['fas', 'layer-group']" class="text-glow" />
              <span>{{ t('app.sceneGraph') }}</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <ChipTag v-for="node in studio.sceneGraph" :key="node" :label="node" />
            </div>
          </section>

          <section class="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            <div class="mb-3 flex items-center gap-2 text-sm text-slate-300">
              <FontAwesomeIcon :icon="['fas', 'wand-magic-sparkles']" class="text-glow" />
              <span>{{ t('studio.linkedTitle') }}</span>
            </div>
            <div v-if="studio.linkedLibraryElements.length" class="flex flex-wrap gap-2">
              <ChipTag
                v-for="element in studio.linkedLibraryElements"
                :key="`project-tab-linked-${element.id}`"
                :label="element.name"
              />
            </div>
            <p v-else class="text-sm leading-6 text-slate-400">
              {{ t('studio.emptyLinked') }}
            </p>
          </section>

          <section class="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            <p class="font-medium text-white">{{ t('studio.projectTab.progressTitle') }}</p>
            <div class="mt-4 grid gap-3">
              <div v-for="stage in workspaceStages" :key="`project-stage-${stage.id}`" class="flex items-center justify-between gap-4 rounded-[18px] border border-white/10 bg-slate-950/35 px-4 py-3">
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-white">{{ stage.title }}</p>
                  <p class="mt-1 text-xs text-slate-500">{{ stage.caption }}</p>
                </div>
                <span class="inline-flex min-h-10 min-w-[7.75rem] shrink-0 items-center justify-center rounded-full px-3 py-1 text-center text-[10px] uppercase tracking-[0.22em]" :class="stage.status === 'active' ? 'bg-glow/15 text-glow' : stage.status === 'complete' ? 'bg-peach/15 text-peach' : 'bg-white/10 text-slate-400'">
                  {{ t(`studio.stageStatus.${stage.status}`) }}
                </span>
              </div>
            </div>
          </section>

          <section class="grid gap-3">
            <RouterLink v-for="item in manageLinks" :key="item.to" :to="item.to" class="rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10">
              <FontAwesomeIcon :icon="item.icon" class="mr-2 text-glow" />
              {{ t(item.labelKey) }}
            </RouterLink>
          </section>
        </div>
      </BasePanel>
    </div>
  </div>
</template>
