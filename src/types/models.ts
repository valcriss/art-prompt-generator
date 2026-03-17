export type PromptMedium = 'image' | 'video'

export type GuidedGroup =
  | 'core'
  | 'atmospheric'
  | 'cinematic'
  | 'narrative'
  | 'motion'

export type GuidedVocabularyKey =
  | 'subjectType'
  | 'era'
  | 'season'
  | 'weather'
  | 'timeOfDay'
  | 'mood'
  | 'style'
  | 'lighting'
  | 'composition'
  | 'scenePosition'
  | 'spatialRelation'
  | 'captureDevice'
  | 'subjectMotion'
  | 'environmentMotion'
  | 'shotType'
  | 'angle'
  | 'movement'
  | 'lensFeel'

export interface SubjectBlock {
  type?: string
  description?: string
  action?: string
  appearance?: string
  position?: string
}

export type SceneCharacterRole = 'secondary' | 'background'

export interface SceneCharacter {
  id: string
  role: SceneCharacterRole
  label?: string
  type?: string
  description?: string
  appearance?: string
  action?: string
  position?: string
  spatialRelation?: string
  relatedCharacterId?: string
}

export interface EnvironmentBlock {
  location?: string
  description?: string
  season?: string
  weather?: string
  timeOfDay?: string
  era?: string
}

export interface MotionBlock {
  subjectMotion?: string
  environmentMotion?: string
  motionIntensity?: 'subtle' | 'moderate' | 'strong'
  rhythm?: 'slow' | 'steady' | 'dynamic'
}

export interface CameraBlock {
  captureDevice?: string
  shotType?: string
  angle?: string
  movement?: string
  lensFeel?: string
}

export interface TemporalStructureBlock {
  startState?: string
  progression?: string
  endState?: string
  durationFeel?: string
}

export interface ReferenceImage {
  id: string
  type: 'style' | 'composition' | 'character' | 'mood' | 'palette'
  url: string
  caption?: string
}

export type LibraryElementType =
  | 'character'
  | 'location'
  | 'scene'
  | 'composition'
  | 'detail'

export type LibraryElementStructuredValues = Record<string, string>

export interface LibraryElement {
  id: string
  type: LibraryElementType
  name: string
  description: string
  structuredValues?: LibraryElementStructuredValues
  tags: string[]
  previewImage?: string
  createdAt: string
  updatedAt: string
}

export interface PromptProject {
  id: string
  medium: PromptMedium
  title: string
  description?: string
  subject: SubjectBlock
  sceneCharacters?: SceneCharacter[]
  environment: EnvironmentBlock
  mood?: string
  style?: string
  lighting?: string
  composition?: string
  details: string[]
  motion?: MotionBlock
  camera?: CameraBlock
  temporalStructure?: TemporalStructureBlock
  positivePrompt: string
  negativePrompt: string
  tags: string[]
  referenceImages: ReferenceImage[]
  libraryElements?: string[]
  createdAt: string
  updatedAt: string
}

export interface PromptTemplate {
  id: string
  title: string
  description: string
  project: PromptProject
  profileValues?: Record<string, string>
}

export type AppLocale = 'en' | 'fr'

export interface CustomGuidedOption {
  id: string
  key: GuidedVocabularyKey
  value: string
  labels: Record<AppLocale, string>
  group: GuidedGroup
  mediums?: PromptMedium[]
  createdAt: string
  updatedAt: string
}

export interface StudioQuickAccessPreferences {
  quickTemplateSearch: string
  quickTemplateFilter: 'all' | PromptMedium
  quickLibrarySearch: string
  quickLibraryFilter: 'all' | LibraryElementType
}

export interface PersonalVocabularyPreferences {
  search: string
  groupFilter: 'all' | GuidedGroup
  sort: 'smart' | 'recent' | 'field' | 'group' | 'name'
}

export interface StudioWorkspacePreferences {
  historySearch: string
  historyMediumFilter: 'all' | PromptMedium
  historySort: 'recent' | 'title' | 'medium'
  librarySearch: string
  libraryFilter: 'all' | LibraryElementType
  librarySort: 'recent' | 'name' | 'type'
  templateSearch: string
  templateFilter: 'all' | PromptMedium
  subjectLibrarySearch: string
}
