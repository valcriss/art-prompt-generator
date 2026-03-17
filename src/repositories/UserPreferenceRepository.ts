import type { AppLocale, StudioQuickAccessPreferences } from '../types/models'

export interface UserPreferenceRepository {
  getLocale(): Promise<AppLocale | null>
  setLocale(locale: AppLocale): Promise<void>
  getStudioQuickAccessPreferences(): Promise<StudioQuickAccessPreferences | null>
  setStudioQuickAccessPreferences(preferences: StudioQuickAccessPreferences): Promise<void>
}
