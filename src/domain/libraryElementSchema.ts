import type {
  AppLocale,
  CustomGuidedOption,
  LibraryElement,
  LibraryElementStructuredValues,
  LibraryElementType,
  PromptProject,
  SceneCharacter,
} from '../types/models'
import { getLocalizedGuidedOptions } from './guidedVocabulary'

type LocalizedOption = {
  value: string
  label: string
  group?: string
}

type SchemaOption = {
  value: string
  labels: Record<AppLocale, string>
}

export interface LibraryFieldDefinition {
  key: string
  labelKey: string
  placeholderKey: string
  helperKey?: string
  icon?: [string, string]
  options?: SchemaOption[]
  guidedKey?: Parameters<typeof getLocalizedGuidedOptions>[0]
}

export interface LibraryProjectMapping {
  id: string
  labelKey: string
  targetPath:
    | 'subject.type'
    | 'subject.description'
    | 'subject.appearance'
    | 'subject.action'
    | 'environment.location'
    | 'environment.era'
    | 'environment.weather'
    | 'environment.timeOfDay'
    | 'mood'
    | 'style'
    | 'lighting'
    | 'composition'
    | 'camera.captureDevice'
    | 'details'
  value: string
}

export interface LibraryInsertComparison {
  id: string
  labelKey: string
  before: string
  after: string
  changed: boolean
}

const localizedOptions = (
  options: SchemaOption[],
  locale: AppLocale,
): LocalizedOption[] =>
  options.map((option) => ({
    value: option.value,
    label: option.labels[locale],
    group: 'core',
  }))

const compact = (values: Array<string | undefined>) => values.filter(Boolean) as string[]

const normalizeCharacterStructuredValues = (
  values?: LibraryElementStructuredValues,
): LibraryElementStructuredValues => {
  const legacyAppearance = compact([
    values?.appearance,
    values?.age,
    values?.gender,
    values?.eyeColor,
    values?.hairstyle,
    values?.outfit,
    values?.accessories,
    values?.expression,
  ]).join(', ')

  return {
    type: values?.type ?? '',
    appearance: values?.appearance ?? legacyAppearance,
  }
}

const pickStructuredValues = (
  type: LibraryElementType,
  values?: LibraryElementStructuredValues,
) => {
  if (type === 'character') {
    return normalizeCharacterStructuredValues(values)
  }

  const next = libraryElementSchemas[type].reduce<LibraryElementStructuredValues>(
    (accumulator, field) => {
      accumulator[field.key] = values?.[field.key] ?? ''
      return accumulator
    },
    {},
  )

  return next
}

export const libraryElementSchemas: Record<LibraryElementType, LibraryFieldDefinition[]> = {
  character: [
    {
      key: 'type',
      labelKey: 'library.structured.character.type',
      placeholderKey: 'builder.fields.subjectType',
      icon: ['fas', 'object-group'],
      guidedKey: 'subjectType',
    },
    {
      key: 'appearance',
      labelKey: 'library.structured.character.appearance',
      placeholderKey: 'builder.fields.subjectAppearance',
      icon: ['fas', 'image'],
    },
  ],
  location: [
    {
      key: 'placeType',
      labelKey: 'library.structured.location.placeType',
      placeholderKey: 'library.structured.location.placeType',
      icon: ['fas', 'layer-group'],
    },
    {
      key: 'era',
      labelKey: 'library.structured.location.era',
      placeholderKey: 'library.structured.location.era',
      icon: ['fas', 'layer-group'],
      guidedKey: 'era',
    },
    {
      key: 'weather',
      labelKey: 'library.structured.location.weather',
      placeholderKey: 'library.structured.location.weather',
      icon: ['fas', 'layer-group'],
      guidedKey: 'weather',
    },
    {
      key: 'timeOfDay',
      labelKey: 'library.structured.location.timeOfDay',
      placeholderKey: 'library.structured.location.timeOfDay',
      icon: ['fas', 'layer-group'],
      guidedKey: 'timeOfDay',
    },
    {
      key: 'architecture',
      labelKey: 'library.structured.location.architecture',
      placeholderKey: 'library.structured.location.architecture',
      icon: ['fas', 'object-group'],
    },
    {
      key: 'lighting',
      labelKey: 'library.structured.location.lighting',
      placeholderKey: 'library.structured.location.lighting',
      icon: ['fas', 'image'],
      guidedKey: 'lighting',
    },
    {
      key: 'palette',
      labelKey: 'library.structured.location.palette',
      placeholderKey: 'library.structured.location.palette',
      icon: ['fas', 'sliders'],
    },
  ],
  scene: [
    {
      key: 'subjectFocus',
      labelKey: 'library.structured.scene.subjectFocus',
      placeholderKey: 'library.structured.scene.subjectFocus',
      icon: ['fas', 'object-group'],
    },
    {
      key: 'setting',
      labelKey: 'library.structured.scene.setting',
      placeholderKey: 'library.structured.scene.setting',
      icon: ['fas', 'layer-group'],
    },
    {
      key: 'action',
      labelKey: 'library.structured.scene.action',
      placeholderKey: 'library.structured.scene.action',
      icon: ['fas', 'wand-magic-sparkles'],
    },
    {
      key: 'mood',
      labelKey: 'library.structured.scene.mood',
      placeholderKey: 'library.structured.scene.mood',
      icon: ['fas', 'wand-magic-sparkles'],
      guidedKey: 'mood',
    },
    {
      key: 'lighting',
      labelKey: 'library.structured.scene.lighting',
      placeholderKey: 'library.structured.scene.lighting',
      icon: ['fas', 'image'],
      guidedKey: 'lighting',
    },
    {
      key: 'composition',
      labelKey: 'library.structured.scene.composition',
      placeholderKey: 'library.structured.scene.composition',
      icon: ['fas', 'object-group'],
      guidedKey: 'composition',
    },
    {
      key: 'storyCue',
      labelKey: 'library.structured.scene.storyCue',
      placeholderKey: 'library.structured.scene.storyCue',
      icon: ['fas', 'plus'],
    },
  ],
  composition: [
    {
      key: 'style',
      labelKey: 'library.structured.composition.style',
      placeholderKey: 'builder.fields.style',
      icon: ['fas', 'sliders'],
      guidedKey: 'style',
    },
    {
      key: 'lighting',
      labelKey: 'library.structured.composition.lighting',
      placeholderKey: 'builder.fields.lighting',
      icon: ['fas', 'image'],
      guidedKey: 'lighting',
    },
    {
      key: 'composition',
      labelKey: 'library.structured.composition.composition',
      placeholderKey: 'builder.fields.composition',
      icon: ['fas', 'object-group'],
      guidedKey: 'composition',
    },
    {
      key: 'captureDevice',
      labelKey: 'library.structured.composition.captureDevice',
      placeholderKey: 'builder.fields.captureDevice',
      icon: ['fas', 'camera'],
      guidedKey: 'captureDevice',
    },
  ],
  detail: [
    {
      key: 'object',
      labelKey: 'library.structured.detail.object',
      placeholderKey: 'library.structured.detail.object',
      icon: ['fas', 'plus'],
    },
    {
      key: 'material',
      labelKey: 'library.structured.detail.material',
      placeholderKey: 'library.structured.detail.material',
      icon: ['fas', 'sliders'],
    },
    {
      key: 'condition',
      labelKey: 'library.structured.detail.condition',
      placeholderKey: 'library.structured.detail.condition',
      icon: ['fas', 'image'],
    },
    {
      key: 'placement',
      labelKey: 'library.structured.detail.placement',
      placeholderKey: 'library.structured.detail.placement',
      icon: ['fas', 'layer-group'],
    },
    {
      key: 'narrativeRole',
      labelKey: 'library.structured.detail.narrativeRole',
      placeholderKey: 'library.structured.detail.narrativeRole',
      icon: ['fas', 'wand-magic-sparkles'],
    },
  ],
}

export const getLibraryDraftStructuredValues = (
  type: LibraryElementType,
  values?: LibraryElementStructuredValues,
) => pickStructuredValues(type, values)

export const getLocalizedLibraryFieldOptions = (
  field: LibraryFieldDefinition,
  locale: AppLocale,
  customOptions: CustomGuidedOption[] = [],
): LocalizedOption[] => {
  if (field.guidedKey) {
    return getLocalizedGuidedOptions(field.guidedKey, locale, undefined, undefined, customOptions)
  }

  if (field.options) {
    return localizedOptions(field.options, locale)
  }

  return []
}

export const getFilledStructuredEntries = (
  type: LibraryElementType,
  values?: LibraryElementStructuredValues,
) =>
  Object.entries(pickStructuredValues(type, values)).filter(([, value]) =>
    value.trim().length > 0,
  )

const buildStructuredSummary = (
  type: LibraryElementType,
  values?: LibraryElementStructuredValues,
) => {
  const structured = pickStructuredValues(type, values)

  switch (type) {
    case 'character': {
      return compact([
        structured.type,
        structured.appearance,
      ]).join(', ')
    }
    case 'location':
      return compact([
        structured.placeType,
        structured.era,
        structured.weather,
        structured.timeOfDay,
        structured.architecture,
        structured.lighting,
        structured.palette,
      ]).join(', ')
    case 'scene':
      return compact([
        structured.subjectFocus,
        structured.setting,
        structured.action,
        structured.mood,
        structured.lighting,
        structured.composition,
        structured.storyCue,
      ]).join(', ')
    case 'composition':
      return compact([
        structured.style,
        structured.lighting,
        structured.composition,
        structured.captureDevice,
      ]).join(', ')
    case 'detail':
      return compact([
        structured.object,
        structured.material,
        structured.condition,
        structured.placement,
        structured.narrativeRole,
      ]).join(', ')
  }
}

export const describeLibraryElement = (element: LibraryElement) => {
  const structuredSummary = buildStructuredSummary(
    element.type,
    element.structuredValues,
  )

  return compact([structuredSummary, element.description]).join('. ')
}

export const getCharacterLibrarySubjectValues = (element: LibraryElement) => {
  if (element.type !== 'character') {
    return {
      type: '',
      description: '',
      appearance: '',
    }
  }

  const structured = pickStructuredValues('character', element.structuredValues)

  return {
    type: structured.type || '',
    description: element.description.trim() || element.name,
    appearance: structured.appearance || buildStructuredSummary('character', structured),
  }
}

export const createSceneCharacterFromLibraryElement = (
  element: LibraryElement,
): SceneCharacter => {
  const subjectValues = getCharacterLibrarySubjectValues(element)

  return {
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2),
    role: 'secondary',
    label: element.name,
    type: subjectValues.type,
    description: subjectValues.description,
    appearance: subjectValues.appearance,
    action: '',
    position: '',
    spatialRelation: '',
    relatedCharacterId: '',
  }
}

export const applyLibraryElementToProject = (
  project: PromptProject,
  element: LibraryElement,
) => {
  const structured = pickStructuredValues(element.type, element.structuredValues)
  const richDescription = describeLibraryElement(element)

  if (element.type === 'character') {
    const subjectValues = getCharacterLibrarySubjectValues(element)
    if (!project.subject.type) {
      project.subject.type = subjectValues.type
    }
    if (!project.subject.description) {
      project.subject.description = subjectValues.description
    }
    if (!project.subject.appearance) {
      project.subject.appearance = subjectValues.appearance
    }
  }

  if (element.type === 'location') {
    if (!project.environment.location) {
      project.environment.location = richDescription || element.name
    }
    if (!project.environment.era) {
      project.environment.era = structured.era
    }
    if (!project.environment.weather) {
      project.environment.weather = structured.weather
    }
    if (!project.environment.timeOfDay) {
      project.environment.timeOfDay = structured.timeOfDay
    }
    if (!project.lighting) {
      project.lighting = structured.lighting
    }
  }

  if (element.type === 'scene') {
    if (!project.subject.action) {
      project.subject.action = structured.action
    }
    if (!project.environment.location) {
      project.environment.location = structured.setting
    }
    if (!project.mood) {
      project.mood = structured.mood
    }
    if (!project.lighting) {
      project.lighting = structured.lighting
    }
    if (!project.composition) {
      project.composition = structured.composition
    }
    if (structured.storyCue && !project.details.includes(structured.storyCue)) {
      project.details = [...project.details, structured.storyCue]
    }
  }

  if (element.type === 'composition') {
    if (!project.style) {
      project.style = structured.style || richDescription
    }
    if (!project.lighting) {
      project.lighting = structured.lighting
    }
    if (!project.composition) {
      project.composition = structured.composition
    }
    if (!project.camera?.captureDevice) {
      project.camera = {
        ...project.camera,
        captureDevice: structured.captureDevice,
      }
    }
  }

  if (element.type === 'detail') {
    const detailText = richDescription || element.name
    if (detailText && !project.details.includes(detailText)) {
      project.details = [...project.details, detailText]
    }
  }

  return project
}

export const getLibraryElementProjectMappings = (
  element: LibraryElement,
): LibraryProjectMapping[] => {
  const structured = pickStructuredValues(element.type, element.structuredValues)
  const mappings: LibraryProjectMapping[] = []
  const pushMapping = (
    labelKey: LibraryProjectMapping['labelKey'],
    targetPath: LibraryProjectMapping['targetPath'],
    value: string,
  ) => {
    if (!value) return
    mappings.push({
      id: `${targetPath}:${value}`,
      labelKey,
      targetPath,
      value,
    })
  }

  if (element.type === 'character') {
    const subjectValues = getCharacterLibrarySubjectValues(element)
    pushMapping('builder.fields.subjectType', 'subject.type', subjectValues.type)
    pushMapping('builder.fields.subjectDescription', 'subject.description', subjectValues.description)
    pushMapping('builder.fields.subjectAppearance', 'subject.appearance', subjectValues.appearance)
  }

  if (element.type === 'location') {
    const location = describeLibraryElement(element)
    pushMapping('builder.fields.location', 'environment.location', location)
    pushMapping('builder.fields.era', 'environment.era', structured.era)
    pushMapping('builder.fields.weather', 'environment.weather', structured.weather)
    pushMapping('builder.fields.timeOfDay', 'environment.timeOfDay', structured.timeOfDay)
    pushMapping('builder.fields.lighting', 'lighting', structured.lighting)
  }

  if (element.type === 'scene') {
    pushMapping('builder.fields.location', 'environment.location', structured.setting)
    pushMapping('builder.fields.subjectAction', 'subject.action', structured.action)
    pushMapping('builder.fields.mood', 'mood', structured.mood)
    pushMapping('builder.fields.lighting', 'lighting', structured.lighting)
    pushMapping('builder.fields.composition', 'composition', structured.composition)
    pushMapping('builder.fields.details', 'details', structured.storyCue)
  }

  if (element.type === 'composition') {
    pushMapping('builder.fields.style', 'style', structured.style)
    pushMapping('builder.fields.lighting', 'lighting', structured.lighting)
    pushMapping('builder.fields.composition', 'composition', structured.composition)
    pushMapping(
      'builder.fields.captureDevice',
      'camera.captureDevice',
      structured.captureDevice,
    )
  }

  if (element.type === 'detail') {
    const detail = describeLibraryElement(element)
    pushMapping('builder.fields.details', 'details', detail)
  }

  return mappings
}

export const applyLibraryElementProjectMappings = (
  project: PromptProject,
  mappings: LibraryProjectMapping[],
) => {
  mappings.forEach((mapping) => {
    switch (mapping.targetPath) {
      case 'subject.type':
        project.subject.type = mapping.value
        break
      case 'subject.description':
        project.subject.description = mapping.value
        break
      case 'subject.appearance':
        project.subject.appearance = mapping.value
        break
      case 'subject.action':
        project.subject.action = mapping.value
        break
      case 'environment.location':
        project.environment.location = mapping.value
        break
      case 'environment.era':
        project.environment.era = mapping.value
        break
      case 'environment.weather':
        project.environment.weather = mapping.value
        break
      case 'environment.timeOfDay':
        project.environment.timeOfDay = mapping.value
        break
      case 'mood':
        project.mood = mapping.value
        break
      case 'style':
        project.style = mapping.value
        break
      case 'lighting':
        project.lighting = mapping.value
        break
      case 'composition':
        project.composition = mapping.value
        break
      case 'camera.captureDevice':
        project.camera = {
          ...project.camera,
          captureDevice: mapping.value,
        }
        break
      case 'details':
        if (!project.details.includes(mapping.value)) {
          project.details = [...project.details, mapping.value]
        }
        break
    }
  })

  return project
}

export const getProjectValueForMapping = (
  project: PromptProject,
  mapping: LibraryProjectMapping,
) => {
  switch (mapping.targetPath) {
    case 'subject.type':
      return project.subject.type ?? ''
    case 'subject.description':
      return project.subject.description ?? ''
    case 'subject.appearance':
      return project.subject.appearance ?? ''
    case 'subject.action':
      return project.subject.action ?? ''
    case 'environment.location':
      return project.environment.location ?? ''
    case 'environment.era':
      return project.environment.era ?? ''
    case 'environment.weather':
      return project.environment.weather ?? ''
    case 'environment.timeOfDay':
      return project.environment.timeOfDay ?? ''
    case 'mood':
      return project.mood ?? ''
    case 'style':
      return project.style ?? ''
    case 'lighting':
      return project.lighting ?? ''
    case 'composition':
      return project.composition ?? ''
    case 'camera.captureDevice':
      return project.camera?.captureDevice ?? ''
    case 'details':
      return project.details.includes(mapping.value) ? mapping.value : ''
  }
}

export const createLibraryInsertComparisons = (
  project: PromptProject,
  mappings: LibraryProjectMapping[],
): LibraryInsertComparison[] =>
  mappings.map((mapping) => {
    const before = getProjectValueForMapping(project, mapping)

    return {
      id: mapping.id,
      labelKey: mapping.labelKey,
      before,
      after: mapping.value,
      changed: before !== mapping.value,
    }
  })
