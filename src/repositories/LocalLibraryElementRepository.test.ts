import { beforeEach, describe, expect, it } from 'vitest'
import { LocalLibraryElementRepository } from './LocalLibraryElementRepository'
import type { StorageLike } from './storage'

const createStorage = (): StorageLike => {
  const values = new Map<string, string>()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  }
}

describe('LocalLibraryElementRepository', () => {
  let repository: LocalLibraryElementRepository

  beforeEach(() => {
    repository = new LocalLibraryElementRepository(createStorage())
  })

  it('can save and delete a library element', async () => {
    const created = await repository.save({
      id: 'custom-library-element',
      type: 'detail',
      name: 'Faint Lantern Smoke',
      description: 'faint lantern smoke drifting above the alley',
      structuredValues: {
        object: 'lantern smoke',
        material: '',
        condition: 'faint',
        placement: 'above the alley',
        narrativeRole: 'quiet omen',
      },
      tags: ['mood', 'detail'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    const saved = (await repository.list()).find((element) => element.id === created.id)

    expect(saved).toBeTruthy()
    expect(saved?.structuredValues?.object).toBe('lantern smoke')

    await repository.delete(created.id)

    expect((await repository.list()).some((element) => element.id === created.id)).toBe(false)
  })
})
