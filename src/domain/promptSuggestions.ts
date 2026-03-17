import type { PromptProject } from '../types/models'
import { getPrioritizedGuidedOptions, guidedVocabulary, inferGuidedTone } from './guidedVocabulary'

type SuggestionTone = 'glow' | 'peach' | 'mist'

export interface EnrichmentSuggestion {
  id: string
  labelKey: string
  descriptionKey: string
  reasonKey: string
  icon: 'wand-magic-sparkles' | 'image' | 'plus' | 'layer-group' | 'film'
  tone: SuggestionTone
  apply: (project: PromptProject) => PromptProject
}

interface SuggestionBlueprint extends EnrichmentSuggestion {
  score: (project: PromptProject) => number
}

interface SuggestionOptions {
  suppressBundleOverlap?: boolean
}

const compact = (values: Array<string | undefined>) =>
  values.map((value) => value?.trim()).filter((value): value is string => Boolean(value))

const countMissing = (...values: Array<string | undefined>) =>
  values.filter((value) => !value?.trim()).length

const addDetail = (project: PromptProject, detail: string) => ({
  ...project,
  details: project.details.includes(detail)
    ? project.details
    : [...project.details, detail],
})

const takeTopValue = (
  key: keyof typeof guidedVocabulary,
  project: PromptProject,
  fallback = '',
) =>
  getPrioritizedGuidedOptions(key, project, project.medium)[0]?.value ?? fallback

const suggestionToneBonus = (tone: SuggestionTone, project: PromptProject) => {
  const guidedTone = inferGuidedTone(project, project.medium)

  switch (guidedTone) {
    case 'cinematic':
      return tone === 'peach' ? 7 : tone === 'glow' ? 4 : 0
    case 'illustration':
      return tone === 'glow' ? 7 : tone === 'mist' ? 4 : 0
    case 'photography':
      return tone === 'mist' ? 7 : tone === 'glow' ? 3 : 0
    case 'video':
      return tone === 'peach' ? 6 : tone === 'glow' ? 5 : 0
  }
}

const createStoryDetail = (project: PromptProject) => {
  if (project.medium === 'video') {
    return 'a restrained gesture that hints at tension just outside the frame'
  }

  if (project.environment.weather?.includes('snow')) {
    return 'faint footprints suggesting someone just passed through the scene'
  }

  if (project.environment.weather?.includes('rain') || project.environment.weather?.includes('storm')) {
    return 'a recently abandoned object still marked by rain'
  }

  return 'a quiet sign of recent human presence'
}

const createWorldDetail = (project: PromptProject) => {
  const location = project.environment.location?.trim()
  const weather = project.environment.weather?.trim()
  const era = project.environment.era?.trim()

  return compact([
    location ? `background traces that make ${location} feel more inhabited` : '',
    weather ? `${weather} interacting with distant surfaces and secondary forms` : '',
    era ? `small design clues that anchor the scene in ${era}` : '',
  ])[0] ?? 'small environmental clues that reveal a larger world'
}

const enrichEmotionDescription = (project: PromptProject) =>
  project.description?.trim() ||
  'A scene with emotional subtext, restrained drama and a clear inner tension.'

const suggestionBlueprints: SuggestionBlueprint[] = [
  {
    id: 'atmosphere',
    labelKey: 'builder.suggestions.atmosphere',
    descriptionKey: 'builder.suggestions.atmosphereDescription',
    reasonKey: 'builder.suggestions.atmosphereReason',
    icon: 'wand-magic-sparkles',
    tone: 'glow',
    score: (project) =>
      countMissing(
        project.mood,
        project.environment.weather,
        project.environment.timeOfDay,
      ) * 16,
    apply: (project) => ({
      ...project,
      mood: project.mood || takeTopValue('mood', project, 'mysterious'),
      environment: {
        ...project.environment,
        weather:
          project.environment.weather || takeTopValue('weather', project, 'fog'),
        timeOfDay:
          project.environment.timeOfDay ||
          takeTopValue('timeOfDay', project, 'blue hour'),
      },
    }),
  },
  {
    id: 'framing',
    labelKey: 'builder.suggestions.framing',
    descriptionKey: 'builder.suggestions.framingDescription',
    reasonKey: 'builder.suggestions.framingReason',
    icon: 'image',
    tone: 'mist',
    score: (project) =>
      countMissing(project.lighting, project.composition, project.camera?.captureDevice) * 14,
    apply: (project) => ({
      ...project,
      lighting: project.lighting || takeTopValue('lighting', project, 'dramatic backlight'),
      composition:
        project.composition ||
        takeTopValue('composition', project, 'layered foreground and background'),
      camera: {
        ...project.camera,
        captureDevice:
          project.camera?.captureDevice ||
          takeTopValue('captureDevice', project, project.medium === 'video' ? 'digital cinema camera' : '35mm analog camera'),
      },
    }),
  },
  {
    id: 'story',
    labelKey: 'builder.suggestions.story',
    descriptionKey: 'builder.suggestions.storyDescription',
    reasonKey: 'builder.suggestions.storyReason',
    icon: 'plus',
    tone: 'peach',
    score: (project) => Math.max(0, 18 - project.details.length * 4),
    apply: (project) => addDetail(project, createStoryDetail(project)),
  },
  {
    id: 'world',
    labelKey: 'builder.suggestions.world',
    descriptionKey: 'builder.suggestions.worldDescription',
    reasonKey: 'builder.suggestions.worldReason',
    icon: 'layer-group',
    tone: 'mist',
    score: (project) =>
      (project.environment.location?.trim() ? 10 : 0) +
      (project.details.length < 4 ? 8 : 0),
    apply: (project) => addDetail(project, createWorldDetail(project)),
  },
  {
    id: 'emotion',
    labelKey: 'builder.suggestions.emotion',
    descriptionKey: 'builder.suggestions.emotionDescription',
    reasonKey: 'builder.suggestions.emotionReason',
    icon: 'wand-magic-sparkles',
    tone: 'peach',
    score: (project) =>
      countMissing(project.description, project.mood) * 12 + (project.details.length < 3 ? 4 : 0),
    apply: (project) => ({
      ...project,
      description: enrichEmotionDescription(project),
      details: project.details.includes('an emotional cue carried through posture, stillness or gaze')
        ? project.details
        : [...project.details, 'an emotional cue carried through posture, stillness or gaze'],
    }),
  },
  {
    id: 'motion',
    labelKey: 'builder.suggestions.motion',
    descriptionKey: 'builder.suggestions.motionDescription',
    reasonKey: 'builder.suggestions.motionReason',
    icon: 'film',
    tone: 'glow',
    score: (project) =>
      project.medium === 'video'
        ? countMissing(
            project.motion?.subjectMotion,
            project.motion?.environmentMotion,
            project.camera?.movement,
          ) * 16
        : 0,
    apply: (project) => ({
      ...project,
      motion: {
        ...project.motion,
        subjectMotion:
          project.motion?.subjectMotion ||
          takeTopValue('subjectMotion', project, 'walking slowly'),
        environmentMotion:
          project.motion?.environmentMotion ||
          takeTopValue('environmentMotion', project, 'fog slowly rolling'),
      },
      camera: {
        ...project.camera,
        movement:
          project.camera?.movement || takeTopValue('movement', project, 'slow push-in'),
      },
    }),
  },
]

export const createEnrichmentSuggestions = (
  project: PromptProject,
  options: SuggestionOptions = {},
): EnrichmentSuggestion[] => {
  const suppressedIds = options.suppressBundleOverlap
    ? new Set(['atmosphere', 'framing', ...(project.medium === 'video' ? ['motion'] : [])])
    : new Set<string>()

  return suggestionBlueprints
    .filter((suggestion) => !suppressedIds.has(suggestion.id))
    .map((suggestion) => ({
      suggestion,
      score: suggestion.score(project) + suggestionToneBonus(suggestion.tone, project),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map(({ suggestion }) => ({
      id: suggestion.id,
      labelKey: suggestion.labelKey,
      descriptionKey: suggestion.descriptionKey,
      reasonKey: suggestion.reasonKey,
      icon: suggestion.icon,
      tone: suggestion.tone,
      apply: suggestion.apply,
    }))
}
