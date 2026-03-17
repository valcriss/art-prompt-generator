import { computed, ref, toRaw, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { assembleNegativePrompt, assemblePositivePrompt } from '../domain/promptAssembler'
import type { ContextualBundle } from '../domain/contextualBundles'
import { createContextualBundles } from '../domain/contextualBundles'
import {
  applyLibraryElementProjectMappings,
  createLibraryInsertComparisons,
  createSceneCharacterFromLibraryElement,
  describeLibraryElement,
  getLibraryDraftStructuredValues,
  getCharacterLibrarySubjectValues,
  getFilledStructuredEntries,
  getLibraryElementProjectMappings,
  libraryElementSchemas,
} from '../domain/libraryElementSchema'
import { createEmptyPromptProject, clonePromptProject } from '../domain/promptFactory'
import { createEnrichmentSuggestions } from '../domain/promptSuggestions'
import {
  customGuidedOptionUsesMediumScope,
  suggestCustomGuidedGroup,
} from '../domain/guidedVocabulary'
import {
  applyTemplateProfileToProject,
  deriveTemplateProfileFromProject,
  getTemplateDraftProfileValues,
  templateProfileSchemas,
} from '../domain/promptTemplateSchema'
import { LocalLibraryElementRepository } from '../repositories/LocalLibraryElementRepository'
import { LocalPromptProjectRepository } from '../repositories/LocalPromptProjectRepository'
import { LocalPromptTemplateRepository } from '../repositories/LocalPromptTemplateRepository'
import { LocalUserPreferenceRepository } from '../repositories/LocalUserPreferenceRepository'
import type {
  AppLocale,
  CustomGuidedOption,
  GuidedGroup,
  GuidedVocabularyKey,
  LibraryElement,
  PersonalVocabularyPreferences,
  PromptProject,
  PromptTemplate,
  StudioQuickAccessPreferences,
  StudioWorkspacePreferences,
} from '../types/models'
import { copyTextToClipboard } from '../utils/clipboard'
import { downloadFile } from '../utils/download'

const projectRepository = new LocalPromptProjectRepository()
const libraryRepository = new LocalLibraryElementRepository()
const templateRepository = new LocalPromptTemplateRepository()
const preferenceRepository = new LocalUserPreferenceRepository()

type LibraryElementDraft = {
  id: string | null
  type: LibraryElement['type']
  name: string
  description: string
  tagsText: string
  structuredValues: Record<string, string>
}

type LibraryFilter = 'all' | LibraryElement['type']
type LibrarySort = 'recent' | 'name' | 'type'
type HistoryFilter = 'all' | PromptProject['medium']
type HistorySort = 'recent' | 'title' | 'medium'
type TemplateFilter = 'all' | PromptProject['medium']
type QuickTemplateFilter = 'all' | PromptProject['medium']
type QuickLibraryFilter = 'all' | LibraryElement['type']
type TemplateDraft = {
  id: string | null
  title: string
  description: string
  medium: PromptProject['medium']
  profileValues: Record<string, string>
}

type PendingLibraryInsert = {
  elementId: string | null
  selectedMappingIds: string[]
}

type TemplateApplicationComparison = {
  id: string
  labelKey: string
  before: string
  after: string
  changed: boolean
}

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

const cloneProjectState = (project: PromptProject) =>
  structuredClone(toRaw(project))

const readProjectField = (
  project: PromptProject,
  path:
    | 'subject.description'
    | 'subject.action'
    | 'environment.location'
    | 'mood'
    | 'style'
    | 'lighting'
    | 'composition'
    | 'camera.shotType'
    | 'camera.movement',
) => {
  switch (path) {
    case 'subject.description':
      return project.subject.description ?? ''
    case 'subject.action':
      return project.subject.action ?? ''
    case 'environment.location':
      return project.environment.location ?? ''
    case 'mood':
      return project.mood ?? ''
    case 'style':
      return project.style ?? ''
    case 'lighting':
      return project.lighting ?? ''
    case 'composition':
      return project.composition ?? ''
    case 'camera.shotType':
      return project.camera?.shotType ?? ''
    case 'camera.movement':
      return project.camera?.movement ?? ''
  }
}

const createEmptyLibraryDraft = (): LibraryElementDraft => ({
  id: null,
  type: 'character',
  name: '',
  description: '',
  tagsText: '',
  structuredValues: getLibraryDraftStructuredValues('character'),
})

const createEmptyTemplateDraft = (): TemplateDraft => ({
  id: null,
  title: '',
  description: '',
  medium: 'image',
  profileValues: getTemplateDraftProfileValues('image'),
})

const defaultStudioQuickAccessPreferences = (): StudioQuickAccessPreferences => ({
  quickTemplateSearch: '',
  quickTemplateFilter: 'all',
  quickLibrarySearch: '',
  quickLibraryFilter: 'all',
})

const defaultPersonalVocabularyPreferences = (): PersonalVocabularyPreferences => ({
  search: '',
  groupFilter: 'all',
  sort: 'smart',
})

const defaultStudioWorkspacePreferences = (): StudioWorkspacePreferences => ({
  historySearch: '',
  historyMediumFilter: 'all',
  historySort: 'recent',
  librarySearch: '',
  libraryFilter: 'all',
  librarySort: 'recent',
  templateSearch: '',
  templateFilter: 'all',
  subjectLibrarySearch: '',
})

type AddCustomGuidedOptionInput = {
  key: GuidedVocabularyKey
  label: string
  value: string
  locale: AppLocale
  medium?: PromptProject['medium']
}

type UpdateCustomGuidedOptionInput = {
  id: string
  label: string
  value: string
  locale: AppLocale
  group: GuidedGroup
}

let studioSingleton: ReturnType<typeof createStudioStore> | null = null

const createStudioStore = () => {
  const currentProject = ref<PromptProject>(createEmptyPromptProject())
  const projects = ref<PromptProject[]>([])
  const libraryElements = ref<LibraryElement[]>([])
  const templates = ref<PromptTemplate[]>([])
  const customGuidedOptions = ref<CustomGuidedOption[]>([])

  const historyFilter = ref('')
  const historyMediumFilter = ref<HistoryFilter>('all')
  const historySort = ref<HistorySort>('recent')

  const detailDraft = ref('')

  const libraryDraft = ref<LibraryElementDraft>(createEmptyLibraryDraft())
  const librarySearch = ref('')
  const libraryFilter = ref<LibraryFilter>('all')
  const librarySort = ref<LibrarySort>('recent')

  const templateDraft = ref<TemplateDraft>(createEmptyTemplateDraft())
  const templateDraftProject = ref<PromptProject>(createEmptyPromptProject())
  const templateSearch = ref('')
  const templateFilter = ref<TemplateFilter>('all')
  const quickTemplateSearch = ref('')
  const quickTemplateFilter = ref<QuickTemplateFilter>('all')
  const quickLibrarySearch = ref('')
  const quickLibraryFilter = ref<QuickLibraryFilter>('all')
  const subjectLibrarySearch = ref('')
  const selectedTemplateId = ref<string | null>(null)
  const personalVocabularySearch = ref('')
  const personalVocabularyGroupFilter = ref<'all' | GuidedGroup>('all')
  const personalVocabularySort = ref<'smart' | 'recent' | 'field' | 'group' | 'name'>('smart')
  const pendingLibraryInsert = ref<PendingLibraryInsert>({
    elementId: null,
    selectedMappingIds: [],
  })

  const locale = ref<AppLocale>('en')
  const toast = ref('')
  const lastCreativeAction = ref('')
  const initialized = ref(false)

  const linkedLibraryElements = computed(() =>
    libraryElements.value.filter((element) =>
      currentProject.value.libraryElements?.includes(element.id),
    ),
  )

  const currentPositivePrompt = computed(() =>
    assemblePositivePrompt(currentProject.value, linkedLibraryElements.value),
  )

  const currentNegativePrompt = computed(() =>
    assembleNegativePrompt(currentProject.value),
  )

  const libraryDraftSchema = computed(
    () => libraryElementSchemas[libraryDraft.value.type],
  )

  const libraryDraftStructuredEntries = computed(() =>
    getFilledStructuredEntries(
      libraryDraft.value.type,
      libraryDraft.value.structuredValues,
    ),
  )

  const filteredLibraryElements = computed(() => {
    const query = librarySearch.value.trim().toLowerCase()
    const filtered = libraryElements.value.filter((element) => {
      const matchesType =
        libraryFilter.value === 'all' ? true : element.type === libraryFilter.value
      const matchesQuery = query
        ? [element.name, element.description, ...element.tags, element.type].some((value) =>
            value.toLowerCase().includes(query),
          )
        : true

      return matchesType && matchesQuery
    })

    return filtered.sort((left, right) => {
      if (librarySort.value === 'name') {
        return left.name.localeCompare(right.name)
      }
      if (librarySort.value === 'type') {
        const typeOrder = ['character', 'location', 'scene', 'composition', 'detail']
        const leftRank = typeOrder.indexOf(left.type)
        const rightRank = typeOrder.indexOf(right.type)
        return leftRank === rightRank
          ? left.name.localeCompare(right.name)
          : leftRank - rightRank
      }

      return right.updatedAt.localeCompare(left.updatedAt)
    })
  })

  const libraryCategories = computed(() => {
    const counts = {
      all: libraryElements.value.length,
      character: 0,
      location: 0,
      scene: 0,
      composition: 0,
      detail: 0,
    } satisfies Record<LibraryFilter, number>

    libraryElements.value.forEach((element) => {
      counts[element.type] += 1
    })

    return counts
  })

  const filteredProjects = computed(() => {
    const query = historyFilter.value.trim().toLowerCase()
    const filtered = projects.value.filter((project) => {
      const matchesQuery = query
        ? [project.title, ...project.tags].some((value) =>
            value.toLowerCase().includes(query),
          )
        : true
      const matchesMedium =
        historyMediumFilter.value === 'all'
          ? true
          : project.medium === historyMediumFilter.value

      return matchesQuery && matchesMedium
    })

    return filtered.sort((left, right) => {
      if (historySort.value === 'title') {
        return left.title.localeCompare(right.title)
      }
      if (historySort.value === 'medium') {
        return left.medium === right.medium
          ? right.updatedAt.localeCompare(left.updatedAt)
          : left.medium.localeCompare(right.medium)
      }

      return right.updatedAt.localeCompare(left.updatedAt)
    })
  })

  const filteredTemplates = computed(() => {
    const query = templateSearch.value.trim().toLowerCase()

    return templates.value.filter((template) => {
      const matchesQuery = query
        ? [template.title, template.description, ...template.project.tags].some((value) =>
            value.toLowerCase().includes(query),
          )
        : true
      const matchesMedium =
        templateFilter.value === 'all'
          ? true
          : template.project.medium === templateFilter.value

      return matchesQuery && matchesMedium
    })
  })

  const selectedTemplate = computed(
    () =>
      filteredTemplates.value.find((template) => template.id === selectedTemplateId.value) ??
      filteredTemplates.value[0] ??
      null,
  )

  const selectedTemplateLinkedLibraryElements = computed(() =>
    selectedTemplate.value
      ? libraryElements.value.filter((element) =>
          selectedTemplate.value?.project.libraryElements?.includes(element.id),
        )
      : [],
  )

  const selectedTemplateApplicationComparisons = computed<
    TemplateApplicationComparison[]
  >(() => {
    if (!selectedTemplate.value) return []

    const comparisons = [
      {
        id: 'subject-description',
        labelKey: 'builder.fields.subjectDescription',
        before: readProjectField(currentProject.value, 'subject.description'),
        after: readProjectField(selectedTemplate.value.project, 'subject.description'),
      },
      {
        id: 'subject-action',
        labelKey: 'builder.fields.subjectAction',
        before: readProjectField(currentProject.value, 'subject.action'),
        after: readProjectField(selectedTemplate.value.project, 'subject.action'),
      },
      {
        id: 'location',
        labelKey: 'builder.fields.location',
        before: readProjectField(currentProject.value, 'environment.location'),
        after: readProjectField(selectedTemplate.value.project, 'environment.location'),
      },
      {
        id: 'mood',
        labelKey: 'builder.fields.mood',
        before: readProjectField(currentProject.value, 'mood'),
        after: readProjectField(selectedTemplate.value.project, 'mood'),
      },
      {
        id: 'style',
        labelKey: 'builder.fields.style',
        before: readProjectField(currentProject.value, 'style'),
        after: readProjectField(selectedTemplate.value.project, 'style'),
      },
      {
        id: 'lighting',
        labelKey: 'builder.fields.lighting',
        before: readProjectField(currentProject.value, 'lighting'),
        after: readProjectField(selectedTemplate.value.project, 'lighting'),
      },
      {
        id: 'composition',
        labelKey: 'builder.fields.composition',
        before: readProjectField(currentProject.value, 'composition'),
        after: readProjectField(selectedTemplate.value.project, 'composition'),
      },
    ]

    if (selectedTemplate.value.project.medium === 'video') {
      comparisons.push(
        {
          id: 'shot-type',
          labelKey: 'builder.fields.shotType',
          before: readProjectField(currentProject.value, 'camera.shotType'),
          after: readProjectField(selectedTemplate.value.project, 'camera.shotType'),
        },
        {
          id: 'camera-movement',
          labelKey: 'builder.fields.movement',
          before: readProjectField(currentProject.value, 'camera.movement'),
          after: readProjectField(selectedTemplate.value.project, 'camera.movement'),
        },
      )
    }

    return comparisons
      .map((comparison) => ({
        ...comparison,
        changed: comparison.before !== comparison.after,
      }))
      .filter((comparison) => comparison.before || comparison.after)
  })

  const pendingLibraryInsertElement = computed(
    () =>
      libraryElements.value.find(
        (element) => element.id === pendingLibraryInsert.value.elementId,
      ) ?? null,
  )

  const pendingLibraryInsertMappings = computed(() =>
    pendingLibraryInsertElement.value
      ? getLibraryElementProjectMappings(pendingLibraryInsertElement.value)
      : [],
  )

  const pendingLibraryInsertPreviewProject = computed(() => {
    const element = pendingLibraryInsertElement.value
    if (!element) return null

    const nextProject = cloneProjectState(currentProject.value)
    nextProject.libraryElements = currentProject.value.libraryElements?.includes(element.id)
      ? [...(currentProject.value.libraryElements ?? [])]
      : [...(currentProject.value.libraryElements ?? []), element.id]

    const selectedMappings = pendingLibraryInsertMappings.value.filter((mapping) =>
      pendingLibraryInsert.value.selectedMappingIds.includes(mapping.id),
    )

    return applyLibraryElementProjectMappings(nextProject, selectedMappings)
  })

  const pendingLibraryInsertComparisons = computed(() =>
    createLibraryInsertComparisons(
      currentProject.value,
      pendingLibraryInsertMappings.value.filter((mapping) =>
        pendingLibraryInsert.value.selectedMappingIds.includes(mapping.id),
      ),
    ),
  )

  const pendingLibraryInsertLinkedElements = computed(() =>
    pendingLibraryInsertPreviewProject.value
      ? libraryElements.value.filter((element) =>
          pendingLibraryInsertPreviewProject.value?.libraryElements?.includes(element.id),
        )
      : [],
  )

  const pendingLibraryInsertPositivePromptBefore = computed(() =>
    assemblePositivePrompt(currentProject.value, linkedLibraryElements.value),
  )

  const pendingLibraryInsertPositivePromptAfter = computed(() =>
    pendingLibraryInsertPreviewProject.value
      ? assemblePositivePrompt(
          pendingLibraryInsertPreviewProject.value,
          pendingLibraryInsertLinkedElements.value,
        )
      : '',
  )

  const templateDraftMedium = computed(
    () => templateDraft.value.id ? templateDraft.value.medium : currentProject.value.medium,
  )

  const templateDraftSchema = computed(
    () => templateProfileSchemas[templateDraftMedium.value],
  )

  const templateDraftProfileEntries = computed(() =>
    Object.entries(
      getTemplateDraftProfileValues(
        templateDraftMedium.value,
        templateDraft.value.profileValues,
      ),
    ).filter(([, value]) => value.trim().length > 0),
  )

  const templateCategories = computed(() => ({
    all: templates.value.length,
    image: templates.value.filter((template) => template.project.medium === 'image').length,
    video: templates.value.filter((template) => template.project.medium === 'video').length,
  }))

  const sceneGraph = computed(() =>
    [
      currentProject.value.subject.type || currentProject.value.subject.description,
      ...(currentProject.value.sceneCharacters ?? [])
        .slice(0, 2)
        .map((character) => character.label || character.type)
        .filter((value): value is string => Boolean(value)),
      currentProject.value.subject.action,
      currentProject.value.environment.location,
      currentProject.value.mood,
      currentProject.value.lighting,
      currentProject.value.camera?.movement,
    ].filter((value): value is string => Boolean(value)),
  )

  const contextualBundles = computed(() =>
    createContextualBundles(currentProject.value),
  )

  const suggestions = computed(() =>
    createEnrichmentSuggestions(currentProject.value, {
      suppressBundleOverlap: contextualBundles.value.length > 0,
    }),
  )

  const templateDraftProjectPreview = computed(() =>
    applyTemplateProfileToProject(
      cloneProjectState(templateDraftProject.value),
      getTemplateDraftProfileValues(
        templateDraftMedium.value,
        templateDraft.value.profileValues,
      ),
    ),
  )

  const templateDraftLinkedLibraryElements = computed(() =>
    libraryElements.value.filter((element) =>
      templateDraftProjectPreview.value.libraryElements?.includes(element.id),
    ),
  )

  const templateDraftPositivePrompt = computed(() =>
    assemblePositivePrompt(
      templateDraftProjectPreview.value,
      templateDraftLinkedLibraryElements.value,
    ),
  )

  const templateDraftNegativePrompt = computed(() =>
    assembleNegativePrompt(templateDraftProjectPreview.value),
  )

  const selectedTemplatePositivePromptBefore = computed(() =>
    assemblePositivePrompt(currentProject.value, linkedLibraryElements.value),
  )

  const selectedTemplatePositivePromptAfter = computed(() =>
    selectedTemplate.value
      ? assemblePositivePrompt(
          selectedTemplate.value.project,
          selectedTemplateLinkedLibraryElements.value,
        )
      : '',
  )

  const ensureLoaded = async () => {
    if (initialized.value) return

    const [
      savedProjects,
      savedLibrary,
      savedTemplates,
      savedLocale,
      savedQuickAccess,
      savedCustomGuidedOptions,
      savedPersonalVocabularyPreferences,
      savedStudioWorkspacePreferences,
    ] = await Promise.all([
      projectRepository.list(),
      libraryRepository.list(),
      templateRepository.list(),
      preferenceRepository.getLocale(),
      preferenceRepository.getStudioQuickAccessPreferences(),
      preferenceRepository.getCustomGuidedOptions(),
      preferenceRepository.getPersonalVocabularyPreferences(),
      preferenceRepository.getStudioWorkspacePreferences(),
    ])

    projects.value = savedProjects
    libraryElements.value = savedLibrary
    templates.value = savedTemplates
    customGuidedOptions.value = savedCustomGuidedOptions
    locale.value = savedLocale ?? 'en'
    const quickAccess = savedQuickAccess ?? defaultStudioQuickAccessPreferences()
    const personalVocabularyPreferences =
      savedPersonalVocabularyPreferences ?? defaultPersonalVocabularyPreferences()
    const studioWorkspacePreferences =
      savedStudioWorkspacePreferences ?? defaultStudioWorkspacePreferences()
    quickTemplateSearch.value = quickAccess.quickTemplateSearch
    quickTemplateFilter.value = quickAccess.quickTemplateFilter
    quickLibrarySearch.value = quickAccess.quickLibrarySearch
    quickLibraryFilter.value = quickAccess.quickLibraryFilter
    historyFilter.value = studioWorkspacePreferences.historySearch
    historyMediumFilter.value = studioWorkspacePreferences.historyMediumFilter
    historySort.value = studioWorkspacePreferences.historySort
    librarySearch.value = studioWorkspacePreferences.librarySearch
    libraryFilter.value = studioWorkspacePreferences.libraryFilter
    librarySort.value = studioWorkspacePreferences.librarySort
    templateSearch.value = studioWorkspacePreferences.templateSearch
    templateFilter.value = studioWorkspacePreferences.templateFilter
    subjectLibrarySearch.value = studioWorkspacePreferences.subjectLibrarySearch
    personalVocabularySearch.value = personalVocabularyPreferences.search
    personalVocabularyGroupFilter.value = personalVocabularyPreferences.groupFilter
    personalVocabularySort.value = personalVocabularyPreferences.sort
    selectedTemplateId.value = savedTemplates[0]?.id ?? null
    initialized.value = true
  }

  watch(toast, (value) => {
    if (!value || typeof window === 'undefined') return
    window.setTimeout(() => {
      toast.value = ''
    }, 1800)
  })
  watch(
    [quickTemplateSearch, quickTemplateFilter, quickLibrarySearch, quickLibraryFilter],
    ([nextQuickTemplateSearch, nextQuickTemplateFilter, nextQuickLibrarySearch, nextQuickLibraryFilter]) => {
      if (!initialized.value) return

      void preferenceRepository.setStudioQuickAccessPreferences({
        quickTemplateSearch: nextQuickTemplateSearch,
        quickTemplateFilter: nextQuickTemplateFilter,
        quickLibrarySearch: nextQuickLibrarySearch,
        quickLibraryFilter: nextQuickLibraryFilter,
      })
    },
  )
  watch(
    [historyFilter, historyMediumFilter, historySort, librarySearch, libraryFilter, librarySort, templateSearch, templateFilter, subjectLibrarySearch],
    ([nextHistorySearch, nextHistoryMediumFilter, nextHistorySort, nextLibrarySearch, nextLibraryFilter, nextLibrarySort, nextTemplateSearch, nextTemplateFilter, nextSubjectLibrarySearch]) => {
      if (!initialized.value) return

      void preferenceRepository.setStudioWorkspacePreferences({
        historySearch: nextHistorySearch,
        historyMediumFilter: nextHistoryMediumFilter,
        historySort: nextHistorySort,
        librarySearch: nextLibrarySearch,
        libraryFilter: nextLibraryFilter,
        librarySort: nextLibrarySort,
        templateSearch: nextTemplateSearch,
        templateFilter: nextTemplateFilter,
        subjectLibrarySearch: nextSubjectLibrarySearch,
      })
    },
  )
  watch(
    [personalVocabularySearch, personalVocabularyGroupFilter, personalVocabularySort],
    ([search, groupFilter, sort]) => {
      if (!initialized.value) return

      void preferenceRepository.setPersonalVocabularyPreferences({
        search,
        groupFilter,
        sort,
      })
    },
  )

  return {
    currentProject,
    projects,
    libraryElements,
    templates,
    customGuidedOptions,
    historyFilter,
    historyMediumFilter,
    historySort,
    detailDraft,
    libraryDraft,
    librarySearch,
    libraryFilter,
    librarySort,
    templateDraft,
    templateDraftProject,
    templateSearch,
    templateFilter,
    quickTemplateSearch,
    quickTemplateFilter,
    quickLibrarySearch,
    quickLibraryFilter,
    subjectLibrarySearch,
    personalVocabularySearch,
    personalVocabularyGroupFilter,
    personalVocabularySort,
    selectedTemplateId,
    pendingLibraryInsert,
    locale,
    toast,
    lastCreativeAction,
    suggestions,
    linkedLibraryElements,
    currentPositivePrompt,
    currentNegativePrompt,
    libraryDraftSchema,
    libraryDraftStructuredEntries,
    filteredLibraryElements,
    libraryCategories,
    filteredProjects,
    filteredTemplates,
    selectedTemplate,
    selectedTemplateApplicationComparisons,
    pendingLibraryInsertElement,
    pendingLibraryInsertMappings,
    pendingLibraryInsertPreviewProject,
    pendingLibraryInsertComparisons,
    pendingLibraryInsertPositivePromptBefore,
    pendingLibraryInsertPositivePromptAfter,
    templateCategories,
    templateDraftMedium,
    templateDraftSchema,
    templateDraftProfileEntries,
    templateDraftProjectPreview,
    templateDraftPositivePrompt,
    templateDraftNegativePrompt,
    selectedTemplatePositivePromptBefore,
    selectedTemplatePositivePromptAfter,
    sceneGraph,
    contextualBundles,
    ensureLoaded,
  }
}

export const usePromptStudio = () => {
  const { t, locale: i18nLocale } = useI18n()

  if (!studioSingleton) {
    studioSingleton = createStudioStore()
  }

  const store = studioSingleton
  void store.ensureLoaded().then(() => {
    i18nLocale.value = store.locale.value
  })

  const buildProjectWithGeneratedPrompts = (project: PromptProject): PromptProject => {
    const linkedElements = store.libraryElements.value.filter((element) =>
      project.libraryElements?.includes(element.id),
    )

    return {
      ...project,
      positivePrompt: assemblePositivePrompt(project, linkedElements),
      negativePrompt: assembleNegativePrompt(project),
    }
  }

  const setLocale = async (nextLocale: AppLocale) => {
    store.locale.value = nextLocale
    i18nLocale.value = nextLocale
    await preferenceRepository.setLocale(nextLocale)
  }

  const addCustomGuidedOption = async ({
    key,
    label,
    value,
    locale,
    medium,
  }: AddCustomGuidedOptionInput) => {
    const localizedLabel = label.trim()
    const canonicalValue = value.trim()

    if (!localizedLabel || !canonicalValue) {
      return ''
    }

    const now = new Date().toISOString()
    const scopedMediums = customGuidedOptionUsesMediumScope(key) && medium ? [medium] : undefined
    const existing = store.customGuidedOptions.value.find(
      (option) => option.key === key && option.value.trim().toLowerCase() === canonicalValue.toLowerCase(),
    )

    const nextOption: CustomGuidedOption = existing
      ? {
          ...existing,
          labels: {
            ...existing.labels,
            [locale]: localizedLabel,
            en: locale === 'en' ? localizedLabel : canonicalValue,
          },
          mediums:
            existing.mediums || scopedMediums
              ? [...new Set([...(existing.mediums ?? []), ...(scopedMediums ?? [])])]
              : undefined,
          updatedAt: now,
        }
      : {
          id: createId(),
          key,
          value: canonicalValue,
          labels: {
            en: locale === 'en' ? localizedLabel : canonicalValue,
            fr: locale === 'fr' ? localizedLabel : canonicalValue,
          },
          group: suggestCustomGuidedGroup(key, canonicalValue),
          mediums: scopedMediums,
          createdAt: now,
          updatedAt: now,
        }

    const nextOptions = [
      nextOption,
      ...store.customGuidedOptions.value.filter((option) => option.id !== nextOption.id),
    ]

    store.customGuidedOptions.value = nextOptions
    await preferenceRepository.setCustomGuidedOptions(nextOptions)
    store.toast.value = t('builder.guided.savedToVocabulary')

    return canonicalValue
  }

  const deleteCustomGuidedOption = async (id: string) => {
    const nextOptions = store.customGuidedOptions.value.filter((option) => option.id !== id)
    store.customGuidedOptions.value = nextOptions
    await preferenceRepository.setCustomGuidedOptions(nextOptions)
    store.toast.value = t('library.personalVocabulary.deleted')
  }

  const updateCustomGuidedOption = async ({
    id,
    label,
    value,
    locale,
    group,
  }: UpdateCustomGuidedOptionInput) => {
    const localizedLabel = label.trim()
    const canonicalValue = value.trim()

    if (!localizedLabel || !canonicalValue) {
      return ''
    }

    const existing = store.customGuidedOptions.value.find((option) => option.id === id)
    if (!existing) {
      return ''
    }

    const now = new Date().toISOString()
    const shouldMirrorEnglishLabel = locale === 'en' || existing.labels.en === existing.value
    const nextOption: CustomGuidedOption = {
      ...existing,
      value: canonicalValue,
      group,
      labels: {
        ...existing.labels,
        [locale]: localizedLabel,
        en: shouldMirrorEnglishLabel ? (locale === 'en' ? localizedLabel : canonicalValue) : existing.labels.en,
      },
      updatedAt: now,
    }

    const nextOptions = [
      nextOption,
      ...store.customGuidedOptions.value.filter((option) => option.id !== id),
    ]

    store.customGuidedOptions.value = nextOptions
    await preferenceRepository.setCustomGuidedOptions(nextOptions)
    store.toast.value = t('library.personalVocabulary.updated')

    return canonicalValue
  }

  const newProject = (medium = store.currentProject.value.medium) => {
    store.currentProject.value = createEmptyPromptProject(medium)
    store.lastCreativeAction.value = t('preview.activityFreshStart')
  }

  const saveProject = async () => {
    const saved = await projectRepository.save(
      buildProjectWithGeneratedPrompts({
        ...store.currentProject.value,
        title: store.currentProject.value.title || t('builder.placeholders.title'),
      }),
    )
    store.currentProject.value = saved
    store.projects.value = await projectRepository.list()
    store.toast.value = t('app.saveProject')
  }

  const loadProject = (project: PromptProject) => {
    store.currentProject.value = buildProjectWithGeneratedPrompts(
      cloneProjectState(project),
    )
    store.lastCreativeAction.value = t('preview.activityProjectLoaded', {
      name: project.title || t('builder.placeholders.title'),
    })
  }

  const duplicateProject = async (project: PromptProject) => {
    const duplicated = await projectRepository.save(
      buildProjectWithGeneratedPrompts(clonePromptProject(project)),
    )
    store.projects.value = await projectRepository.list()
    store.currentProject.value = duplicated
    store.lastCreativeAction.value = t('preview.activityProjectDuplicated', {
      name: duplicated.title,
    })
  }

  const deleteProject = async (id: string) => {
    await projectRepository.delete(id)
    store.projects.value = await projectRepository.list()
    if (store.currentProject.value.id === id) {
      store.currentProject.value = createEmptyPromptProject()
    }
  }

  const applyTemplate = (templateId: string) => {
    const template = store.templates.value.find((entry) => entry.id === templateId)
    if (!template) return
    store.currentProject.value = {
      ...createEmptyPromptProject(template.project.medium),
      ...cloneProjectState(template.project),
    }
    store.selectedTemplateId.value = templateId
    store.lastCreativeAction.value = t('preview.activityTemplateApplied', {
      name: template.title,
    })
  }

  const resetTemplateDraft = () => {
    store.templateDraft.value = {
      ...createEmptyTemplateDraft(),
      medium: store.currentProject.value.medium,
      profileValues: deriveTemplateProfileFromProject(store.currentProject.value),
    }
    store.templateDraftProject.value = cloneProjectState(store.currentProject.value)
  }

  const editTemplate = (template: PromptTemplate) => {
    store.templateDraft.value = {
      id: template.id,
      title: template.title,
      description: template.description,
      medium: template.project.medium,
      profileValues: getTemplateDraftProfileValues(
        template.project.medium,
        template.profileValues ?? deriveTemplateProfileFromProject(template.project),
      ),
    }
    store.templateDraftProject.value = cloneProjectState(template.project)
    store.selectedTemplateId.value = template.id
  }

  const updateTemplateDraftProfileValue = (key: string, value: string) => {
    store.templateDraft.value = {
      ...store.templateDraft.value,
      profileValues: {
        ...store.templateDraft.value.profileValues,
        [key]: value,
      },
    }
  }

  const updateTemplateDraftProjectTags = (rawTags: string) => {
    store.templateDraftProject.value.tags = rawTags
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
  }

  const updateTemplateDraftProjectDetails = (rawDetails: string) => {
    store.templateDraftProject.value.details = rawDetails
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean)
  }

  const saveTemplateFromCurrentProject = async () => {
    const title =
      store.templateDraft.value.title.trim() || store.templateDraftProject.value.title.trim()
    if (!title) return

    const draftMedium = store.templateDraftMedium.value
    const baseProject = cloneProjectState(store.templateDraftProject.value)
    const profiledProject = applyTemplateProfileToProject(
      baseProject,
      getTemplateDraftProfileValues(
        draftMedium,
        store.templateDraft.value.profileValues,
      ),
    )

    const template: PromptTemplate = {
      id: store.templateDraft.value.id ?? createId(),
      title,
      description:
        store.templateDraft.value.description.trim() ||
        store.templateDraftProject.value.description?.trim() ||
        'Custom creative preset',
      project: buildProjectWithGeneratedPrompts({
        ...profiledProject,
        title,
      }),
      profileValues: getTemplateDraftProfileValues(
        draftMedium,
        store.templateDraft.value.profileValues,
      ),
    }

    const isEditing = Boolean(store.templateDraft.value.id)

    await templateRepository.save(template)
    store.templates.value = await templateRepository.list()
    store.selectedTemplateId.value = template.id
    resetTemplateDraft()
    store.toast.value = isEditing ? t('templates.updated') : t('templates.created')
  }

  const deleteTemplate = async (id: string) => {
    await templateRepository.delete(id)
    store.templates.value = await templateRepository.list()
    if (store.selectedTemplateId.value === id) {
      store.selectedTemplateId.value = store.templates.value[0]?.id ?? null
    }
    if (store.templateDraft.value.id === id) {
      resetTemplateDraft()
    }
    store.toast.value = t('templates.deleted')
  }

  const addDetail = () => {
    const detail = store.detailDraft.value.trim()
    if (!detail || store.currentProject.value.details.includes(detail)) return
    store.currentProject.value.details = [...store.currentProject.value.details, detail]
    store.detailDraft.value = ''
  }

  const removeDetail = (detail: string) => {
    store.currentProject.value.details = store.currentProject.value.details.filter(
      (item) => item !== detail,
    )
  }

  const updateTags = (rawTags: string) => {
    store.currentProject.value.tags = rawTags
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
  }

  const applySuggestion = (id: string) => {
    const suggestion = store.suggestions.value.find((entry) => entry.id === id)
    if (!suggestion) return
    store.currentProject.value = suggestion.apply(store.currentProject.value)
    store.lastCreativeAction.value = t('preview.activitySuggestionApplied', {
      name: t(suggestion.labelKey),
    })
  }

  const applyContextualBundle = (bundle: ContextualBundle) => {
    const nextProject = cloneProjectState(store.currentProject.value)

    bundle.items.forEach((item) => {
      switch (item.field) {
        case 'environment.weather':
          nextProject.environment.weather = item.value
          break
        case 'environment.timeOfDay':
          nextProject.environment.timeOfDay = item.value
          break
        case 'mood':
          nextProject.mood = item.value
          break
        case 'style':
          nextProject.style = item.value
          break
        case 'lighting':
          nextProject.lighting = item.value
          break
        case 'composition':
          nextProject.composition = item.value
          break
        case 'camera.shotType':
          nextProject.camera = {
            ...nextProject.camera,
            shotType: item.value,
          }
          break
        case 'camera.movement':
          nextProject.camera = {
            ...nextProject.camera,
            movement: item.value,
          }
          break
        case 'camera.lensFeel':
          nextProject.camera = {
            ...nextProject.camera,
            lensFeel: item.value,
          }
          break
      }
    })

    store.currentProject.value = nextProject
    store.lastCreativeAction.value = t('preview.activityBundleApplied', {
      name: t(bundle.titleKey),
    })
  }

  const insertLibraryElement = (element: LibraryElement) => {
    if (store.currentProject.value.libraryElements?.includes(element.id)) return
    const mappings = getLibraryElementProjectMappings(element)
    store.pendingLibraryInsert.value = {
      elementId: element.id,
      selectedMappingIds: mappings.map((mapping) => mapping.id),
    }
  }

  const applyLibraryCharacterAsSubject = (elementId: string) => {
    const element = store.libraryElements.value.find(
      (entry) => entry.id === elementId && entry.type === 'character',
    )
    if (!element) return

    const nextProject = cloneProjectState(store.currentProject.value)
    const subjectValues = getCharacterLibrarySubjectValues(element)

    nextProject.subject = {
      ...nextProject.subject,
      type: subjectValues.type,
      description: subjectValues.description,
      appearance: subjectValues.appearance,
    }

    nextProject.libraryElements = nextProject.libraryElements?.includes(element.id)
      ? [...(nextProject.libraryElements ?? [])]
      : [...(nextProject.libraryElements ?? []), element.id]

    store.currentProject.value = nextProject
    store.lastCreativeAction.value = t('preview.activityLibraryApplied', {
      name: element.name,
    })
  }

  const addLibraryCharacterToScene = (elementId: string) => {
    const element = store.libraryElements.value.find(
      (entry) => entry.id === elementId && entry.type === 'character',
    )
    if (!element) return

    const nextProject = cloneProjectState(store.currentProject.value)
    nextProject.sceneCharacters = [
      ...(nextProject.sceneCharacters ?? []),
      createSceneCharacterFromLibraryElement(element),
    ]
    nextProject.libraryElements = nextProject.libraryElements?.includes(element.id)
      ? [...(nextProject.libraryElements ?? [])]
      : [...(nextProject.libraryElements ?? []), element.id]

    store.currentProject.value = nextProject
    store.lastCreativeAction.value = t('preview.activityLibraryApplied', {
      name: element.name,
    })
  }

  const applyLibraryCharacterToSceneCharacter = (
    characterId: string,
    elementId: string,
  ) => {
    const element = store.libraryElements.value.find(
      (entry) => entry.id === elementId && entry.type === 'character',
    )
    if (!element) return

    const nextProject = cloneProjectState(store.currentProject.value)
    const target = (nextProject.sceneCharacters ?? []).find(
      (character) => character.id === characterId,
    )
    if (!target) return

    const nextCharacter = createSceneCharacterFromLibraryElement(element)
    target.label = nextCharacter.label
    target.type = nextCharacter.type
    target.description = nextCharacter.description
    target.appearance = nextCharacter.appearance

    nextProject.libraryElements = nextProject.libraryElements?.includes(element.id)
      ? [...(nextProject.libraryElements ?? [])]
      : [...(nextProject.libraryElements ?? []), element.id]

    store.currentProject.value = nextProject
    store.lastCreativeAction.value = t('preview.activityLibraryApplied', {
      name: element.name,
    })
  }

  const cancelLibraryInsert = () => {
    store.pendingLibraryInsert.value = {
      elementId: null,
      selectedMappingIds: [],
    }
  }

  const toggleLibraryInsertMapping = (mappingId: string) => {
    const nextIds = store.pendingLibraryInsert.value.selectedMappingIds.includes(mappingId)
      ? store.pendingLibraryInsert.value.selectedMappingIds.filter((id) => id !== mappingId)
      : [...store.pendingLibraryInsert.value.selectedMappingIds, mappingId]

    store.pendingLibraryInsert.value = {
      ...store.pendingLibraryInsert.value,
      selectedMappingIds: nextIds,
    }
  }

  const confirmLibraryInsert = () => {
    const element = store.pendingLibraryInsertElement.value
    if (!element || !store.pendingLibraryInsert.value.selectedMappingIds.length) return

    const nextProject = cloneProjectState(store.currentProject.value)

    nextProject.libraryElements = [
      ...(store.currentProject.value.libraryElements ?? []),
      element.id,
    ]

    const selectedMappings = store.pendingLibraryInsertMappings.value.filter((mapping) =>
      store.pendingLibraryInsert.value.selectedMappingIds.includes(mapping.id),
    )

    store.currentProject.value = applyLibraryElementProjectMappings(
      nextProject,
      selectedMappings,
    )

    cancelLibraryInsert()
    store.toast.value = t('builder.inserted')
    store.lastCreativeAction.value = t('preview.activityLibraryApplied', {
      name: element.name,
    })
  }

  const resetLibraryDraft = () => {
    store.libraryDraft.value = createEmptyLibraryDraft()
  }

  const editLibraryElement = (element: LibraryElement) => {
    store.libraryDraft.value = {
      id: element.id,
      type: element.type,
      name: element.name,
      description: element.description,
      tagsText: element.tags.join(', '),
      structuredValues: getLibraryDraftStructuredValues(
        element.type,
        element.structuredValues,
      ),
    }
  }

  const setLibraryDraftType = (type: LibraryElement['type']) => {
    store.libraryDraft.value = {
      ...store.libraryDraft.value,
      type,
      structuredValues: getLibraryDraftStructuredValues(
        type,
        store.libraryDraft.value.structuredValues,
      ),
    }
  }

  const updateLibraryDraftStructuredValue = (key: string, value: string) => {
    store.libraryDraft.value = {
      ...store.libraryDraft.value,
      structuredValues: {
        ...store.libraryDraft.value.structuredValues,
        [key]: value,
      },
    }
  }

  const saveLibraryElement = async () => {
    const name = store.libraryDraft.value.name.trim()
    const description = store.libraryDraft.value.description.trim()
    const structuredValues = Object.fromEntries(
      Object.entries(
        getLibraryDraftStructuredValues(
          store.libraryDraft.value.type,
          store.libraryDraft.value.structuredValues,
        ),
      ).map(([key, value]) => [key, value.trim()]),
    )
    const hasStructuredContent = Object.values(structuredValues).some(Boolean)

    if (!name || (!description && !hasStructuredContent)) return

    const now = new Date().toISOString()
    const isEditing = Boolean(store.libraryDraft.value.id)

    await libraryRepository.save({
      id: store.libraryDraft.value.id ?? createId(),
      type: store.libraryDraft.value.type,
      name,
      description,
      structuredValues,
      tags: store.libraryDraft.value.tagsText
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean),
      createdAt: isEditing
        ? store.libraryElements.value.find(
            (element) => element.id === store.libraryDraft.value.id,
          )?.createdAt ?? now
        : now,
      updatedAt: now,
    })

    store.libraryElements.value = await libraryRepository.list()
    resetLibraryDraft()
    store.toast.value = isEditing ? t('library.updated') : t('library.created')
  }

  const deleteLibraryElement = async (id: string) => {
    await libraryRepository.delete(id)
    store.libraryElements.value = await libraryRepository.list()
    store.currentProject.value.libraryElements = (
      store.currentProject.value.libraryElements ?? []
    ).filter((elementId) => elementId !== id)

    if (store.libraryDraft.value.id === id) {
      resetLibraryDraft()
    }

    store.toast.value = t('library.deleted')
  }

  const renderLibraryElementDescription = (element: LibraryElement) =>
    describeLibraryElement(element)

  const previewLibraryElementMappings = (element: LibraryElement) =>
    getLibraryElementProjectMappings(element)

  const renderTemplateProfileEntries = (template: PromptTemplate) =>
    Object.entries(
      getTemplateDraftProfileValues(
        template.project.medium,
        template.profileValues ?? deriveTemplateProfileFromProject(template.project),
      ),
    ).filter(([, value]) => value.trim().length > 0)

  const initializeTemplateDraft = () => {
    resetTemplateDraft()
  }

  const exportText = () => {
    downloadFile(
      `${store.currentProject.value.title || 'prompt-project'}.txt`,
      `${store.currentPositivePrompt.value}\n\nNegative prompt:\n${store.currentNegativePrompt.value}`,
      'text/plain;charset=utf-8',
    )
  }

  const exportJson = () => {
    downloadFile(
      `${store.currentProject.value.title || 'prompt-project'}.json`,
      JSON.stringify(
        buildProjectWithGeneratedPrompts(store.currentProject.value),
        null,
        2,
      ),
      'application/json;charset=utf-8',
    )
  }

  const copyPrompt = async (kind: 'positive' | 'negative') => {
    const prompt =
      kind === 'positive'
        ? store.currentPositivePrompt.value
        : store.currentNegativePrompt.value

    if (!prompt.trim()) return

    await copyTextToClipboard(prompt)
    store.toast.value =
      kind === 'positive' ? t('preview.copiedPositive') : t('preview.copiedNegative')
  }

  return {
    ...store,
    locale: store.locale,
    setLocale,
    newProject,
    saveProject,
    loadProject,
    duplicateProject,
    deleteProject,
    applyTemplate,
    resetTemplateDraft,
    editTemplate,
    updateTemplateDraftProfileValue,
    saveTemplateFromCurrentProject,
    deleteTemplate,
    addDetail,
    removeDetail,
    updateTags,
    applySuggestion,
    applyContextualBundle,
    insertLibraryElement,
    applyLibraryCharacterAsSubject,
    addLibraryCharacterToScene,
    applyLibraryCharacterToSceneCharacter,
    cancelLibraryInsert,
    toggleLibraryInsertMapping,
    confirmLibraryInsert,
    resetLibraryDraft,
    editLibraryElement,
    setLibraryDraftType,
    updateLibraryDraftStructuredValue,
    saveLibraryElement,
    deleteLibraryElement,
    renderLibraryElementDescription,
    previewLibraryElementMappings,
    renderTemplateProfileEntries,
    updateTemplateDraftProjectTags,
    updateTemplateDraftProjectDetails,
    initializeTemplateDraft,
    exportText,
    exportJson,
    copyPrompt,
    addCustomGuidedOption,
    deleteCustomGuidedOption,
    updateCustomGuidedOption,
  }
}

export const __resetPromptStudioForTests = () => {
  studioSingleton = null
}
