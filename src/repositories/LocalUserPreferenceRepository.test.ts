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

  it('stores custom guided vocabulary entries', async () => {
    const repository = new LocalUserPreferenceRepository(createStorage())

    await repository.setCustomGuidedOptions([
      {
        id: 'acid-rain',
        key: 'weather',
        value: 'acid rain',
        labels: {
          en: 'Acid rain',
          fr: 'Pluie acide',
        },
        group: 'atmospheric',
        mediums: ['image'],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ])

    await expect(repository.getCustomGuidedOptions()).resolves.toEqual([
      {
        id: 'acid-rain',
        key: 'weather',
        value: 'acid rain',
        labels: {
          en: 'Acid rain',
          fr: 'Pluie acide',
        },
        group: 'atmospheric',
        mediums: ['image'],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ])
  })

  it('stores personal vocabulary preferences independently', async () => {
    const repository = new LocalUserPreferenceRepository(createStorage())

    await repository.setPersonalVocabularyPreferences({
      search: 'rain',
      groupFilter: 'atmospheric',
      sort: 'field',
    })

    await expect(repository.getPersonalVocabularyPreferences()).resolves.toEqual({
      search: 'rain',
      groupFilter: 'atmospheric',
      sort: 'field',
    })
  })

  it('stores studio workspace preferences independently', async () => {
    const repository = new LocalUserPreferenceRepository(createStorage())

    await repository.setStudioWorkspacePreferences({
      historySearch: 'storm',
      historyMediumFilter: 'video',
      historySort: 'title',
      librarySearch: 'samurai',
      libraryFilter: 'character',
      librarySort: 'name',
      templateSearch: 'cinematic',
      templateFilter: 'image',
      subjectLibrarySearch: 'ronin',
    })

    await expect(repository.getStudioWorkspacePreferences()).resolves.toEqual({
      historySearch: 'storm',
      historyMediumFilter: 'video',
      historySort: 'title',
      librarySearch: 'samurai',
      libraryFilter: 'character',
      librarySort: 'name',
      templateSearch: 'cinematic',
      templateFilter: 'image',
      subjectLibrarySearch: 'ronin',
    })
  })
})
