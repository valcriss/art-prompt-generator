import type { PromptMedium, PromptProject, SceneCharacter } from '../types/models'

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

export const createEmptySceneCharacter = (): SceneCharacter => ({
  id: createId(),
  role: 'secondary',
  label: '',
  type: '',
  description: '',
  appearance: '',
  action: '',
  position: '',
  spatialRelation: '',
  relatedCharacterId: '',
})

export const createEmptyPromptProject = (
  medium: PromptMedium = 'image',
): PromptProject => {
  const now = new Date().toISOString()

  return {
    id: createId(),
    medium,
    title: '',
    description: '',
    subject: {},
    sceneCharacters: [],
    environment: {},
    mood: '',
    style: '',
    lighting: '',
    composition: '',
    details: [],
    motion: {
      subjectMotion: '',
      environmentMotion: '',
      motionIntensity: 'subtle',
      rhythm: 'slow',
    },
    camera: {
      captureDevice: '',
      shotType: '',
      angle: '',
      movement: '',
      lensFeel: '',
    },
    temporalStructure: {
      startState: '',
      progression: '',
      endState: '',
      durationFeel: '',
    },
    positivePrompt: '',
    negativePrompt: '',
    tags: [],
    referenceImages: [],
    libraryElements: [],
    createdAt: now,
    updatedAt: now,
  }
}

export const clonePromptProject = (project: PromptProject): PromptProject => {
  const now = new Date().toISOString()

  return {
    ...structuredClone(project),
    id: createId(),
    title: `${project.title || 'Untitled'} Copy`,
    createdAt: now,
    updatedAt: now,
  }
}
