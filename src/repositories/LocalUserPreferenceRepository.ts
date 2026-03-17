import type {
  AppLocale,
  CustomGuidedOption,
  PersonalVocabularyPreferences,
  StudioQuickAccessPreferences,
  StudioWorkspacePreferences,
} from '../types/models'
import type { UserPreferenceRepository } from './UserPreferenceRepository'
import { getStorage, type StorageLike } from './storage'

const LOCALE_STORAGE_KEY = 'art-prompt-generator.preferences.locale'
const STUDIO_QUICK_ACCESS_STORAGE_KEY = 'art-prompt-generator.preferences.studio-quick-access'
const CUSTOM_GUIDED_OPTIONS_STORAGE_KEY = 'art-prompt-generator.preferences.guided-vocabulary'
const PERSONAL_VOCABULARY_PREFERENCES_STORAGE_KEY = 'art-prompt-generator.preferences.personal-vocabulary'
const STUDIO_WORKSPACE_PREFERENCES_STORAGE_KEY = 'art-prompt-generator.preferences.studio-workspace'

export class LocalUserPreferenceRepository implements UserPreferenceRepository {
  private readonly storage: StorageLike

  constructor(storage: StorageLike = getStorage()) {
    this.storage = storage
  }

  async getLocale(): Promise<AppLocale | null> {
    return (this.storage.getItem(LOCALE_STORAGE_KEY) as AppLocale | null) ?? null
  }

  async setLocale(locale: AppLocale): Promise<void> {
    this.storage.setItem(LOCALE_STORAGE_KEY, locale)
  }

  async getStudioQuickAccessPreferences(): Promise<StudioQuickAccessPreferences | null> {
    const raw = this.storage.getItem(STUDIO_QUICK_ACCESS_STORAGE_KEY)

    return raw ? (JSON.parse(raw) as StudioQuickAccessPreferences) : null
  }

  async setStudioQuickAccessPreferences(
    preferences: StudioQuickAccessPreferences,
  ): Promise<void> {
    this.storage.setItem(STUDIO_QUICK_ACCESS_STORAGE_KEY, JSON.stringify(preferences))
  }

  async getCustomGuidedOptions(): Promise<CustomGuidedOption[]> {
    const raw = this.storage.getItem(CUSTOM_GUIDED_OPTIONS_STORAGE_KEY)

    return raw ? (JSON.parse(raw) as CustomGuidedOption[]) : []
  }

  async setCustomGuidedOptions(options: CustomGuidedOption[]): Promise<void> {
    this.storage.setItem(CUSTOM_GUIDED_OPTIONS_STORAGE_KEY, JSON.stringify(options))
  }

  async getPersonalVocabularyPreferences(): Promise<PersonalVocabularyPreferences | null> {
    const raw = this.storage.getItem(PERSONAL_VOCABULARY_PREFERENCES_STORAGE_KEY)

    return raw ? (JSON.parse(raw) as PersonalVocabularyPreferences) : null
  }

  async setPersonalVocabularyPreferences(
    preferences: PersonalVocabularyPreferences,
  ): Promise<void> {
    this.storage.setItem(
      PERSONAL_VOCABULARY_PREFERENCES_STORAGE_KEY,
      JSON.stringify(preferences),
    )
  }

  async getStudioWorkspacePreferences(): Promise<StudioWorkspacePreferences | null> {
    const raw = this.storage.getItem(STUDIO_WORKSPACE_PREFERENCES_STORAGE_KEY)

    return raw ? (JSON.parse(raw) as StudioWorkspacePreferences) : null
  }

  async setStudioWorkspacePreferences(
    preferences: StudioWorkspacePreferences,
  ): Promise<void> {
    this.storage.setItem(
      STUDIO_WORKSPACE_PREFERENCES_STORAGE_KEY,
      JSON.stringify(preferences),
    )
  }
}
