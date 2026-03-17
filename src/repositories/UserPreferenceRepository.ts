import type {
  AppLocale,
  CustomGuidedOption,
  PersonalVocabularyPreferences,
  StudioQuickAccessPreferences,
  StudioWorkspacePreferences,
} from '../types/models'

export interface UserPreferenceRepository {
  getLocale(): Promise<AppLocale | null>
  setLocale(locale: AppLocale): Promise<void>
  getStudioQuickAccessPreferences(): Promise<StudioQuickAccessPreferences | null>
  setStudioQuickAccessPreferences(preferences: StudioQuickAccessPreferences): Promise<void>
  getCustomGuidedOptions(): Promise<CustomGuidedOption[]>
  setCustomGuidedOptions(options: CustomGuidedOption[]): Promise<void>
  getPersonalVocabularyPreferences(): Promise<PersonalVocabularyPreferences | null>
  setPersonalVocabularyPreferences(preferences: PersonalVocabularyPreferences): Promise<void>
  getStudioWorkspacePreferences(): Promise<StudioWorkspacePreferences | null>
  setStudioWorkspacePreferences(preferences: StudioWorkspacePreferences): Promise<void>
}
