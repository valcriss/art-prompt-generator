import { beforeEach, describe, expect, it } from 'vitest'
import { createEmptyPromptProject } from '../domain/promptFactory'
import { LocalPromptTemplateRepository } from './LocalPromptTemplateRepository'
import type { StorageLike } from './storage'

const createStorage = (): StorageLike => {
  const values = new Map<string, string>()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  }
}

describe('LocalPromptTemplateRepository', () => {
  let repository: LocalPromptTemplateRepository

  beforeEach(() => {
    repository = new LocalPromptTemplateRepository(createStorage())
  })

  it('can save and delete a prompt template', async () => {
    const template = {
      id: 'custom-template',
      title: 'Moody Harbor',
      description: 'Custom preset for a foggy harbor scene.',
      profileValues: {
        subjectType: 'portrait',
        weather: 'fog',
        timeOfDay: 'blue hour',
        mood: 'melancholic',
        style: 'cinematic concept art',
        lighting: 'moonlight',
        composition: 'wide cinematic frame',
      },
      project: {
        ...createEmptyPromptProject('image'),
        title: 'Moody Harbor',
      },
    }

    await repository.save(template)
    const saved = (await repository.list()).find((entry) => entry.id === template.id)
    expect(saved).toBeTruthy()
    expect(saved?.profileValues?.weather).toBe('fog')

    await repository.delete(template.id)
    expect((await repository.list()).some((entry) => entry.id === template.id)).toBe(false)
  })
})
