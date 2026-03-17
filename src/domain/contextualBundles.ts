import type { PromptProject } from '../types/models'
import { getPrioritizedGuidedOptions, guidedVocabulary, inferGuidedTone } from './guidedVocabulary'

export type ContextualBundleField =
  | 'environment.weather'
  | 'environment.timeOfDay'
  | 'mood'
  | 'style'
  | 'lighting'
  | 'composition'
  | 'camera.shotType'
  | 'camera.movement'
  | 'camera.lensFeel'

export interface ContextualBundleItem {
  field: ContextualBundleField
  value: string
}

export interface ContextualBundle {
  id: string
  titleKey: string
  subtitleKey: string
  reasonKey: string
  icon: 'wand-magic-sparkles' | 'sliders' | 'film'
  tone: 'glow' | 'peach' | 'mist'
  items: ContextualBundleItem[]
}

type BundleBlueprint = {
  id: string
  titleKey: string
  subtitleKey: string
  reasonKey: string
  icon: ContextualBundle['icon']
  tone: ContextualBundle['tone']
  when: (project: PromptProject) => boolean
  build: (project: PromptProject) => Array<ContextualBundleItem | null>
}

const includesValue = (value: string | undefined, terms: string[]) => {
  const normalized = value?.toLowerCase().trim()
  return normalized ? terms.some((term) => normalized.includes(term)) : false
}

const hasAny = (project: PromptProject, values: Array<string | undefined>) =>
  values.some(Boolean) || Boolean(project.subject.type)

const takeTopValue = (
  key: keyof typeof guidedVocabulary,
  project: PromptProject,
) =>
  getPrioritizedGuidedOptions(key, project, project.medium)[0]?.value

const compactItems = (items: Array<ContextualBundleItem | null>) =>
  items.filter((item): item is ContextualBundleItem => Boolean(item))

const item = (
  field: ContextualBundleField,
  value: string | undefined,
): ContextualBundleItem | null => (value ? { field, value } : null)

const bundleToneScore = (
  bundleTone: ContextualBundle['tone'],
  project: PromptProject,
) => {
  const guidedTone = inferGuidedTone(project, project.medium)

  switch (guidedTone) {
    case 'cinematic':
      return bundleTone === 'peach' ? 8 : bundleTone === 'glow' ? 4 : 0
    case 'illustration':
      return bundleTone === 'glow' ? 8 : bundleTone === 'mist' ? 4 : 0
    case 'photography':
      return bundleTone === 'mist' ? 8 : bundleTone === 'glow' ? 3 : 0
    case 'video':
      return bundleTone === 'peach' ? 8 : bundleTone === 'glow' ? 5 : 0
  }
}

const bundleBlueprints: BundleBlueprint[] = [
  {
    id: 'nocturne-melancholic',
    titleKey: 'builder.guided.bundles.nocturne.title',
    subtitleKey: 'builder.guided.bundles.nocturne.subtitle',
    reasonKey: 'builder.guided.reasons.moodWeather',
    icon: 'wand-magic-sparkles',
    tone: 'glow',
    when: (project) =>
      includesValue(project.mood, ['melancholic', 'mysterious']) ||
      includesValue(project.environment.weather, ['fog', 'soft rain']) ||
      includesValue(project.environment.timeOfDay, ['blue hour', 'night']),
    build: () => [
      item('environment.timeOfDay', 'blue hour'),
      item('lighting', 'moonlight'),
      item('composition', 'layered foreground and background'),
    ],
  },
  {
    id: 'storm-pressure',
    titleKey: 'builder.guided.bundles.storm.title',
    subtitleKey: 'builder.guided.bundles.storm.subtitle',
    reasonKey: 'builder.guided.reasons.weatherTension',
    icon: 'wand-magic-sparkles',
    tone: 'peach',
    when: (project) =>
      includesValue(project.environment.weather, ['storm', 'soft rain']) ||
      includesValue(project.mood, ['tense', 'oppressive']),
    build: (project) => [
      item('environment.weather', includesValue(project.environment.weather, ['storm']) ? 'storm' : 'soft rain'),
      item('lighting', 'dramatic backlight'),
      item('composition', 'wide cinematic frame'),
    ],
  },
  {
    id: 'gentle-dawn',
    titleKey: 'builder.guided.bundles.dawn.title',
    subtitleKey: 'builder.guided.bundles.dawn.subtitle',
    reasonKey: 'builder.guided.reasons.lightMood',
    icon: 'wand-magic-sparkles',
    tone: 'mist',
    when: (project) =>
      includesValue(project.mood, ['serene', 'hopeful']) ||
      includesValue(project.environment.timeOfDay, ['dawn', 'morning', 'golden hour']),
    build: () => [
      item('environment.timeOfDay', 'golden hour'),
      item('lighting', 'warm window glow'),
      item('mood', 'hopeful'),
    ],
  },
  {
    id: 'portrait-focus',
    titleKey: 'builder.guided.bundles.portrait.title',
    subtitleKey: 'builder.guided.bundles.portrait.subtitle',
    reasonKey: 'builder.guided.reasons.subjectFocus',
    icon: 'sliders',
    tone: 'mist',
    when: (project) =>
      includesValue(project.subject.type, ['portrait']) ||
      includesValue(project.subject.description, ['face', 'portrait']),
    build: (project) => [
      item('composition', 'close-up portrait'),
      item('lighting', includesValue(project.mood, ['melancholic']) ? 'soft overcast light' : 'warm window glow'),
      item('style', 'editorial photography'),
    ],
  },
  {
    id: 'fantasy-scale',
    titleKey: 'builder.guided.bundles.fantasy.title',
    subtitleKey: 'builder.guided.bundles.fantasy.subtitle',
    reasonKey: 'builder.guided.reasons.worldScale',
    icon: 'sliders',
    tone: 'peach',
    when: (project) =>
      includesValue(project.subject.type, ['warrior', 'creature']) ||
      includesValue(project.environment.era, ['ancient', 'medieval']),
    build: () => [
      item('style', 'dark fantasy matte painting'),
      item('lighting', 'dramatic backlight'),
      item('composition', 'low angle'),
    ],
  },
  {
    id: 'anime-clarity',
    titleKey: 'builder.guided.bundles.anime.title',
    subtitleKey: 'builder.guided.bundles.anime.subtitle',
    reasonKey: 'builder.guided.reasons.styleClarity',
    icon: 'sliders',
    tone: 'glow',
    when: (project) =>
      project.medium === 'image' &&
      (includesValue(project.style, ['anime']) ||
        includesValue(project.subject.type, ['portrait', 'traveler'])),
    build: () => [
      item('style', 'anime key visual'),
      item('composition', 'symmetrical framing'),
      item('lighting', 'soft overcast light'),
    ],
  },
  {
    id: 'cyberpunk-rain',
    titleKey: 'builder.guided.bundles.cyberpunk.title',
    subtitleKey: 'builder.guided.bundles.cyberpunk.subtitle',
    reasonKey: 'builder.guided.reasons.universeCue',
    icon: 'sliders',
    tone: 'peach',
    when: (project) =>
      includesValue(project.environment.era, ['near future', 'retro-futuristic']) ||
      includesValue(project.style, ['cyberpunk']) ||
      (includesValue(project.environment.weather, ['rain', 'storm']) &&
        includesValue(project.environment.timeOfDay, ['night', 'blue hour', 'midnight'])),
    build: () => [
      item('style', 'cyberpunk noir illustration'),
      item('lighting', 'neon reflections'),
      item('environment.timeOfDay', 'sleepless city night'),
    ],
  },
  {
    id: 'sacred-sanctuary',
    titleKey: 'builder.guided.bundles.sanctuary.title',
    subtitleKey: 'builder.guided.bundles.sanctuary.subtitle',
    reasonKey: 'builder.guided.reasons.universeCue',
    icon: 'wand-magic-sparkles',
    tone: 'glow',
    when: (project) =>
      includesValue(project.mood, ['sacred']) ||
      includesValue(project.subject.type, ['monk', 'oracle', 'priestess']) ||
      includesValue(project.environment.era, ['ancient', 'medieval']),
    build: () => [
      item('style', 'sacred icon painting'),
      item('lighting', 'stained glass light'),
      item('composition', 'cathedral framing'),
    ],
  },
  {
    id: 'maritime-mist',
    titleKey: 'builder.guided.bundles.maritime.title',
    subtitleKey: 'builder.guided.bundles.maritime.subtitle',
    reasonKey: 'builder.guided.reasons.universeCue',
    icon: 'wand-magic-sparkles',
    tone: 'mist',
    when: (project) =>
      includesValue(project.subject.type, ['sailor']) ||
      includesValue(project.environment.weather, ['sea mist']) ||
      includesValue(project.description, ['harbor', 'port', 'shore', 'coast']),
    build: () => [
      item('style', 'maritime cinematic realism'),
      item('lighting', 'reflected water light'),
      item('composition', 'horizon-heavy seascape'),
    ],
  },
  {
    id: 'desert-mythic',
    titleKey: 'builder.guided.bundles.desert.title',
    subtitleKey: 'builder.guided.bundles.desert.subtitle',
    reasonKey: 'builder.guided.reasons.universeCue',
    icon: 'sliders',
    tone: 'glow',
    when: (project) =>
      includesValue(project.environment.weather, ['dust storm', 'heat shimmer']) ||
      includesValue(project.environment.era, ['ancient', 'mythic']) ||
      includesValue(project.description, ['desert', 'dune', 'sand']),
    build: () => [
      item('style', 'desert mythic matte painting'),
      item('lighting', 'dusty sun rays'),
      item('composition', 'heat-haze distance'),
    ],
  },
  {
    id: 'camera-observer',
    titleKey: 'builder.guided.bundles.observer.title',
    subtitleKey: 'builder.guided.bundles.observer.subtitle',
    reasonKey: 'builder.guided.reasons.videoMotion',
    icon: 'film',
    tone: 'glow',
    when: (project) =>
      project.medium === 'video' &&
      (includesValue(project.mood, ['melancholic', 'mysterious']) ||
        includesValue(project.environment.weather, ['fog', 'soft rain'])),
    build: () => [
      item('camera.shotType', 'medium shot'),
      item('camera.movement', 'slow push-in'),
      item('camera.lensFeel', '50mm natural lens'),
    ],
  },
  {
    id: 'camera-tension',
    titleKey: 'builder.guided.bundles.tension.title',
    subtitleKey: 'builder.guided.bundles.tension.subtitle',
    reasonKey: 'builder.guided.reasons.videoEnergy',
    icon: 'film',
    tone: 'peach',
    when: (project) =>
      project.medium === 'video' &&
      (includesValue(project.mood, ['tense', 'oppressive']) ||
        includesValue(project.environment.weather, ['storm'])),
    build: () => [
      item('camera.shotType', 'single-shot tracking frame'),
      item('camera.movement', 'side tracking movement'),
      item('camera.lensFeel', 'wide anamorphic lens'),
    ],
  },
]

const createFallbackBundles = (project: PromptProject): ContextualBundle[] => {
  const bundles: ContextualBundle[] = []

  const sceneBundle = compactItems([
    item('environment.timeOfDay', takeTopValue('timeOfDay', project)),
    item('environment.weather', takeTopValue('weather', project)),
    item('lighting', takeTopValue('lighting', project)),
  ])

  const lookBundle = compactItems([
    item('mood', takeTopValue('mood', project)),
    item('style', takeTopValue('style', project)),
    item('composition', takeTopValue('composition', project)),
  ])

  if (sceneBundle.length) {
    bundles.push({
      id: 'scene-atmosphere',
      titleKey: 'builder.guided.bundles.scene',
      subtitleKey: 'builder.guided.bundles.sceneSubtitle',
      reasonKey: 'builder.guided.reasons.generalScene',
      icon: 'wand-magic-sparkles',
      tone: 'glow',
      items: sceneBundle,
    })
  }

  if (lookBundle.length) {
    bundles.push({
      id: 'visual-direction',
      titleKey: 'builder.guided.bundles.look',
      subtitleKey: 'builder.guided.bundles.lookSubtitle',
      reasonKey: 'builder.guided.reasons.generalLook',
      icon: 'sliders',
      tone: 'mist',
      items: lookBundle,
    })
  }

  if (project.medium === 'video') {
    const motionBundle = compactItems([
      item('camera.shotType', takeTopValue('shotType', project)),
      item('camera.movement', takeTopValue('movement', project)),
      item('camera.lensFeel', takeTopValue('lensFeel', project)),
    ])

    if (motionBundle.length) {
      bundles.push({
        id: 'camera-language',
        titleKey: 'builder.guided.bundles.motion',
        subtitleKey: 'builder.guided.bundles.motionSubtitle',
        reasonKey: 'builder.guided.reasons.generalMotion',
        icon: 'film',
        tone: 'peach',
        items: motionBundle,
      })
    }
  }

  return bundles.sort((left, right) => bundleToneScore(right.tone, project) - bundleToneScore(left.tone, project))
}

export const createContextualBundles = (
  project: PromptProject,
): ContextualBundle[] => {
  const curatedBundles = bundleBlueprints
    .filter((bundle) => bundle.when(project))
    .map((bundle) => ({
      id: bundle.id,
      titleKey: bundle.titleKey,
      subtitleKey: bundle.subtitleKey,
      reasonKey: bundle.reasonKey,
      icon: bundle.icon,
      tone: bundle.tone,
      items: compactItems(bundle.build(project)),
    }))
    .filter((bundle) => bundle.items.length)
    .sort((left, right) => bundleToneScore(right.tone, project) - bundleToneScore(left.tone, project))

  if (curatedBundles.length) {
    return curatedBundles.slice(0, project.medium === 'video' ? 3 : 3)
  }

  if (
    !hasAny(project, [
      project.mood,
      project.style,
      project.environment.weather,
      project.environment.timeOfDay,
      project.environment.era,
    ])
  ) {
    return []
  }

  return createFallbackBundles(project)
}
