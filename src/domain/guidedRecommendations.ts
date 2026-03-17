import type { PromptProject } from '../types/models'
import type { GuidedOption, GuidedGroup } from './guidedVocabulary'

const includesValue = (value: string | undefined, terms: string[]) => {
  const normalized = value?.toLowerCase().trim()
  return normalized ? terms.some((term) => normalized.includes(term)) : false
}

const groupWeight: Record<GuidedGroup, number> = {
  core: 10,
  atmospheric: 8,
  cinematic: 9,
  narrative: 7,
  motion: 9,
}

const scoreMoodDrivenOption = (project: PromptProject, option: GuidedOption) => {
  let score = 0

  if (includesValue(project.mood, ['melancholic', 'mysterious'])) {
    if (['moonlight', 'volumetric fog glow', 'blue hour', 'fog'].includes(option.value)) {
      score += 50
    }
    if (['dark fantasy matte painting', 'cinematic concept art'].includes(option.value)) {
      score += 28
    }
  }

  if (includesValue(project.mood, ['serene', 'hopeful'])) {
    if (['soft overcast light', 'warm window glow', 'morning', 'golden hour'].includes(option.value)) {
      score += 42
    }
    if (['storybook illustration', 'painterly realism'].includes(option.value)) {
      score += 20
    }
  }

  if (includesValue(project.mood, ['tense', 'oppressive'])) {
    if (['dramatic backlight', 'storm', 'wide cinematic frame', 'low angle'].includes(option.value)) {
      score += 44
    }
    if (['single-take film still', 'cinematic video concept frame'].includes(option.value)) {
      score += 24
    }
  }

  return score
}

const scoreWeatherDrivenOption = (project: PromptProject, option: GuidedOption) => {
  let score = 0

  if (includesValue(project.environment.weather, ['fog', 'haze', 'mist'])) {
    if (['volumetric fog glow', 'moonlight', 'layered foreground and background'].includes(option.value)) {
      score += 48
    }
    if (['fog slowly rolling', 'mysterious'].includes(option.value)) {
      score += 30
    }
  }

  if (includesValue(project.environment.weather, ['rain', 'storm'])) {
    if (['neon reflections', 'wide cinematic frame', 'rain drifting through light'].includes(option.value)) {
      score += 50
    }
    if (['slow push-in', 'dramatic backlight', 'blue hour'].includes(option.value)) {
      score += 26
    }
  }

  if (includesValue(project.environment.weather, ['snow'])) {
    if (['soft overcast light', 'shallow depth of field', 'melancholic'].includes(option.value)) {
      score += 34
    }
  }

  return score
}

const scoreTimeDrivenOption = (project: PromptProject, option: GuidedOption) => {
  let score = 0

  if (includesValue(project.environment.timeOfDay, ['blue hour', 'night', 'midnight'])) {
    if (['moonlight', 'neon reflections', 'mysterious', 'wide anamorphic lens'].includes(option.value)) {
      score += 40
    }
  }

  if (includesValue(project.environment.timeOfDay, ['golden hour', 'dawn', 'morning'])) {
    if (['warm window glow', 'soft overcast light', 'hopeful', '50mm natural lens'].includes(option.value)) {
      score += 34
    }
  }

  return score
}

const scoreSubjectDrivenOption = (project: PromptProject, option: GuidedOption) => {
  let score = 0

  if (includesValue(project.subject.type, ['portrait'])) {
    if (['close-up portrait', '50mm natural lens', 'soft overcast light'].includes(option.value)) {
      score += 44
    }
  }

  if (includesValue(project.subject.type, ['warrior', 'traveler'])) {
    if (['low angle', 'wide cinematic frame', 'dramatic backlight'].includes(option.value)) {
      score += 28
    }
  }

  if (includesValue(project.subject.type, ['creature'])) {
    if (['mysterious', 'fog', 'moonlight'].includes(option.value)) {
      score += 24
    }
  }

  return score
}

const scoreMediumDrivenOption = (project: PromptProject, option: GuidedOption) => {
  let score = 0

  if (project.medium === 'video') {
    if (option.group === 'motion') score += 30
    if (['single-take film still', 'cinematic video concept frame', 'slow push-in', 'single-shot tracking frame'].includes(option.value)) {
      score += 36
    }

    if (includesValue(project.camera?.shotType, ['close-up'])) {
      if (['50mm natural lens', 'gentle pull-back'].includes(option.value)) score += 20
    }
  }

  if (project.medium === 'image') {
    if (['anime key visual', 'dark fantasy matte painting', 'storybook illustration', 'painterly realism'].includes(option.value)) {
      score += 18
    }
  }

  return score
}

const scoreOption = (project: PromptProject, option: GuidedOption) =>
  groupWeight[option.group] +
  scoreMoodDrivenOption(project, option) +
  scoreWeatherDrivenOption(project, option) +
  scoreTimeDrivenOption(project, option) +
  scoreSubjectDrivenOption(project, option) +
  scoreMediumDrivenOption(project, option)

export const rankGuidedOptionsForProject = (
  options: GuidedOption[],
  project: PromptProject,
) =>
  [...options].sort((left, right) => {
    const scoreDelta = scoreOption(project, right) - scoreOption(project, left)
    if (scoreDelta !== 0) return scoreDelta
    return left.value.localeCompare(right.value)
  })
