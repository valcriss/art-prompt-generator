import { beforeEach, describe, expect, it } from 'vitest'
import { createEmptyPromptProject } from '../domain/promptFactory'
import { LocalPromptProjectRepository } from './LocalPromptProjectRepository'
import type { StorageLike } from './storage'

const createStorage = (): StorageLike => {
  const values = new Map<string, string>()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  }
}

describe('LocalPromptProjectRepository', () => {
  let repository: LocalPromptProjectRepository

  beforeEach(() => {
    repository = new LocalPromptProjectRepository(createStorage())
  })

  it('stores the most recently updated project first', async () => {
    const first = createEmptyPromptProject()
    first.title = 'First'
    const second = createEmptyPromptProject()
    second.title = 'Second'

    await repository.save(first)
    await repository.save(second)

    const projects = await repository.list()

    expect(projects[0]?.title).toBe('Second')
    expect(projects[1]?.title).toBe('First')
  })
})
