import type {
  AppLocale,
  CustomGuidedOption,
  PromptMedium,
  PromptProject,
} from '../types/models'
import { getLocalizedGuidedOptions } from './guidedVocabulary'

export interface TemplateFieldDefinition {
  key: string
  labelKey: string
  placeholderKey: string
  icon?: [string, string]
  guidedKey?: Parameters<typeof getLocalizedGuidedOptions>[0]
}

export type TemplateProfileValues = Record<string, string>

export const templateProfileSchemas: Record<PromptMedium, TemplateFieldDefinition[]> = {
  image: [
    {
      key: 'subjectType',
      labelKey: 'templates.structured.subjectType',
      placeholderKey: 'templates.structured.subjectType',
      icon: ['fas', 'object-group'],
      guidedKey: 'subjectType',
    },
    {
      key: 'weather',
      labelKey: 'templates.structured.weather',
      placeholderKey: 'templates.structured.weather',
      icon: ['fas', 'layer-group'],
      guidedKey: 'weather',
    },
    {
      key: 'timeOfDay',
      labelKey: 'templates.structured.timeOfDay',
      placeholderKey: 'templates.structured.timeOfDay',
      icon: ['fas', 'layer-group'],
      guidedKey: 'timeOfDay',
    },
    {
      key: 'mood',
      labelKey: 'templates.structured.mood',
      placeholderKey: 'templates.structured.mood',
      icon: ['fas', 'wand-magic-sparkles'],
      guidedKey: 'mood',
    },
    {
      key: 'style',
      labelKey: 'templates.structured.style',
      placeholderKey: 'templates.structured.style',
      icon: ['fas', 'sliders'],
      guidedKey: 'style',
    },
    {
      key: 'lighting',
      labelKey: 'templates.structured.lighting',
      placeholderKey: 'templates.structured.lighting',
      icon: ['fas', 'image'],
      guidedKey: 'lighting',
    },
    {
      key: 'composition',
      labelKey: 'templates.structured.composition',
      placeholderKey: 'templates.structured.composition',
      icon: ['fas', 'object-group'],
      guidedKey: 'composition',
    },
  ],
  video: [
    {
      key: 'subjectType',
      labelKey: 'templates.structured.subjectType',
      placeholderKey: 'templates.structured.subjectType',
      icon: ['fas', 'object-group'],
      guidedKey: 'subjectType',
    },
    {
      key: 'weather',
      labelKey: 'templates.structured.weather',
      placeholderKey: 'templates.structured.weather',
      icon: ['fas', 'layer-group'],
      guidedKey: 'weather',
    },
    {
      key: 'timeOfDay',
      labelKey: 'templates.structured.timeOfDay',
      placeholderKey: 'templates.structured.timeOfDay',
      icon: ['fas', 'layer-group'],
      guidedKey: 'timeOfDay',
    },
    {
      key: 'mood',
      labelKey: 'templates.structured.mood',
      placeholderKey: 'templates.structured.mood',
      icon: ['fas', 'wand-magic-sparkles'],
      guidedKey: 'mood',
    },
    {
      key: 'style',
      labelKey: 'templates.structured.style',
      placeholderKey: 'templates.structured.style',
      icon: ['fas', 'sliders'],
      guidedKey: 'style',
    },
    {
      key: 'lighting',
      labelKey: 'templates.structured.lighting',
      placeholderKey: 'templates.structured.lighting',
      icon: ['fas', 'image'],
      guidedKey: 'lighting',
    },
    {
      key: 'shotType',
      labelKey: 'templates.structured.shotType',
      placeholderKey: 'templates.structured.shotType',
      icon: ['fas', 'film'],
      guidedKey: 'shotType',
    },
    {
      key: 'movement',
      labelKey: 'templates.structured.movement',
      placeholderKey: 'templates.structured.movement',
      icon: ['fas', 'film'],
      guidedKey: 'movement',
    },
    {
      key: 'lensFeel',
      labelKey: 'templates.structured.lensFeel',
      placeholderKey: 'templates.structured.lensFeel',
      icon: ['fas', 'film'],
      guidedKey: 'lensFeel',
    },
  ],
}

export const getTemplateDraftProfileValues = (
  medium: PromptMedium,
  values?: TemplateProfileValues,
) =>
  templateProfileSchemas[medium].reduce<TemplateProfileValues>((accumulator, field) => {
    accumulator[field.key] = values?.[field.key] ?? ''
    return accumulator
  }, {})

export const getLocalizedTemplateFieldOptions = (
  field: TemplateFieldDefinition,
  locale: AppLocale,
  medium: PromptMedium,
  customOptions: CustomGuidedOption[] = [],
) =>
  field.guidedKey
    ? getLocalizedGuidedOptions(field.guidedKey, locale, medium, undefined, customOptions)
    : []

export const deriveTemplateProfileFromProject = (
  project: PromptProject,
): TemplateProfileValues => {
  const values = getTemplateDraftProfileValues(project.medium)

  values.subjectType = project.subject.type ?? ''
  values.weather = project.environment.weather ?? ''
  values.timeOfDay = project.environment.timeOfDay ?? ''
  values.mood = project.mood ?? ''
  values.style = project.style ?? ''
  values.lighting = project.lighting ?? ''
  values.composition = project.composition ?? ''

  if (project.medium === 'video') {
    values.shotType = project.camera?.shotType ?? ''
    values.movement = project.camera?.movement ?? ''
    values.lensFeel = project.camera?.lensFeel ?? ''
  }

  return values
}

export const applyTemplateProfileToProject = (
  project: PromptProject,
  values: TemplateProfileValues,
) => {
  project.subject.type = values.subjectType || project.subject.type
  project.environment.weather = values.weather || project.environment.weather
  project.environment.timeOfDay = values.timeOfDay || project.environment.timeOfDay
  project.mood = values.mood || project.mood
  project.style = values.style || project.style
  project.lighting = values.lighting || project.lighting
  project.composition = values.composition || project.composition

  if (project.medium === 'video') {
    project.camera = {
      ...project.camera,
      shotType: values.shotType || project.camera?.shotType,
      movement: values.movement || project.camera?.movement,
      lensFeel: values.lensFeel || project.camera?.lensFeel,
    }
  }

  return project
}
