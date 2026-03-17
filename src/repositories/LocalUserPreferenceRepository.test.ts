import { describe, expect, it } from 'vitest'
import type { StorageLike } from './storage'
import { LocalUserPreferenceRepository } from './LocalUserPreferenceRepository'

const createStorage = (): StorageLike => {
  const values = new Map<string, string>()

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  }
}

describe('LocalUserPreferenceRepository', () => {
  it('stores locale and studio quick access preferences independently', async () => {
    const repository = new LocalUserPreferenceRepository(createStorage())

    await repository.setLocale('fr')
    await repository.setStudioQuickAccessPreferences({
      quickTemplateSearch: 'cyber',
      quickTemplateFilter: 'image',
      quickLibrarySearch: 'samurai',
      quickLibraryFilter: 'character',
    })

    await expect(repository.getLocale()).resolves.toBe('fr')
    await expect(repository.getStudioQuickAccessPreferences()).resolves.toEqual({
      quickTemplateSearch: 'cyber',
      quickTemplateFilter: 'image',
      quickLibrarySearch: 'samurai',
      quickLibraryFilter: 'character',
    })
  })
})
