import { describe, expect, it } from 'vitest'
import { createContextualBundles } from './contextualBundles'
import { createEmptyPromptProject } from './promptFactory'

describe('createContextualBundles', () => {
  it('builds curated bundles for image projects', () => {
    const project = createEmptyPromptProject('image')
    project.mood = 'melancholic'
    project.environment.weather = 'fog'
    project.environment.timeOfDay = 'blue hour'

    const bundles = createContextualBundles(project)

    expect(bundles.map((bundle) => bundle.id)).toContain('nocturne-melancholic')
    expect(
      bundles.find((bundle) => bundle.id === 'nocturne-melancholic')?.items.some((item) => item.value === 'moonlight'),
    ).toBe(true)
  })

  it('adds a camera bundle for video projects', () => {
    const project = createEmptyPromptProject('video')
    project.mood = 'tense'
    project.environment.weather = 'storm'

    const bundles = createContextualBundles(project)

    expect(bundles.map((bundle) => bundle.id)).toContain('camera-tension')
    expect(
      bundles.find((bundle) => bundle.id === 'camera-tension')?.items.length,
    ).toBeGreaterThan(0)
  })

  it('returns no bundle for a blank project', () => {
    const project = createEmptyPromptProject('image')

    expect(createContextualBundles(project)).toEqual([])
  })
})
