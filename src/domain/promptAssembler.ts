import type { LibraryElement, PromptProject, SceneCharacter } from '../types/models'

const collect = (...values: Array<string | undefined>) =>
  values
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))

const sentence = (parts: string[]) => parts.join(', ')

const dedupe = (parts: string[]) => Array.from(new Set(parts))

const ensureArticle = (value: string) => {
  const normalized = value.trim().toLowerCase()
  if (!normalized) return ''
  if (
    normalized.startsWith('the ') ||
    normalized.startsWith('a ') ||
    normalized.startsWith('an ')
  ) {
    return value.trim()
  }
  return `the ${value.trim()}`
}

const getMainSubjectReference = (project: PromptProject) =>
  project.subject.description?.trim() ||
  project.subject.type?.trim() ||
  'main subject'

const getCharacterReference = (
  character: Partial<SceneCharacter> | undefined,
  index: number,
) =>
  character?.label?.trim() ||
  character?.description?.trim() ||
  character?.type?.trim() ||
  `secondary character ${index + 1}`

const describeSceneCharacter = (
  character: SceneCharacter,
  index: number,
  project: PromptProject,
  sceneCharacters: SceneCharacter[],
) => {
  const baseParts = collect(
    character.role === 'background' ? 'background character' : 'secondary character',
    character.type,
    character.label,
    character.description,
    character.appearance,
    character.action,
  )

  const targetReference =
    character.relatedCharacterId === '__main__'
      ? getMainSubjectReference(project)
      : getCharacterReference(
          sceneCharacters.find((entry) => entry.id === character.relatedCharacterId) ?? {},
          index,
        )

  const stagingParts = collect(
    character.position,
    character.spatialRelation && targetReference
      ? `${character.spatialRelation} ${ensureArticle(targetReference)}`
      : undefined,
  )

  return sentence([...baseParts, ...stagingParts])
}

export const assemblePositivePrompt = (
  project: PromptProject,
  linkedElements: LibraryElement[] = [],
): string => {
  const subjectParts = collect(
    project.subject.appearance,
    project.subject.description,
    project.subject.type,
    project.subject.action,
    project.subject.position,
  )

  const environmentParts = collect(
    project.environment.location,
    project.environment.description,
    project.environment.era,
    project.environment.season,
    project.environment.weather,
    project.environment.timeOfDay,
  )

  const cinematicParts = collect(
    project.mood,
    project.style,
    project.lighting,
    project.composition,
    project.camera?.captureDevice,
  )

  const videoParts =
    project.medium === 'video'
      ? collect(
          project.motion?.subjectMotion,
          project.motion?.environmentMotion,
          project.motion?.motionIntensity,
          project.motion?.rhythm,
          project.camera?.captureDevice,
          project.camera?.shotType,
          project.camera?.angle,
          project.camera?.movement,
          project.camera?.lensFeel,
          project.temporalStructure?.startState,
          project.temporalStructure?.progression,
          project.temporalStructure?.endState,
          project.temporalStructure?.durationFeel,
        )
      : []

  const detailParts = [...project.details, ...linkedElements.map((element) => element.description)]
  const sceneCharacterParts = (project.sceneCharacters ?? [])
    .map((character, index, characters) =>
      describeSceneCharacter(character, index, project, characters),
    )
    .filter(Boolean)

  return sentence(
    dedupe([
      sentence(subjectParts),
      ...sceneCharacterParts,
      sentence(environmentParts),
      ...cinematicParts,
      ...detailParts,
      ...videoParts,
    ]).filter(Boolean),
  )
}

export const assembleNegativePrompt = (project: PromptProject): string => {
  const mediumSpecific =
    project.medium === 'video'
      ? ['flicker', 'camera jitter', 'temporal inconsistency']
      : ['blurry background', 'deformed anatomy']

  return [
    'low quality',
    'low resolution',
    'muddy colors',
    'overexposed highlights',
    'duplicate elements',
    'text watermark',
    ...mediumSpecific,
  ].join(', ')
}
