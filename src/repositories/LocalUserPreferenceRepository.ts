import type { AppLocale, StudioQuickAccessPreferences } from '../types/models'
import type { UserPreferenceRepository } from './UserPreferenceRepository'
import { getStorage, type StorageLike } from './storage'

const LOCALE_STORAGE_KEY = 'art-prompt-generator.preferences.locale'
const STUDIO_QUICK_ACCESS_STORAGE_KEY = 'art-prompt-generator.preferences.studio-quick-access'

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
}
