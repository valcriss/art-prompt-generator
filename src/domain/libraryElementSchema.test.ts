import { describe, expect, it } from 'vitest'
import {
  applyLibraryElementProjectMappings,
  applyLibraryElementToProject,
  createSceneCharacterFromLibraryElement,
  createLibraryInsertComparisons,
  describeLibraryElement,
  getCharacterLibrarySubjectValues,
  getLibraryElementProjectMappings,
} from './libraryElementSchema'
import { createEmptyPromptProject } from './promptFactory'

describe('libraryElementSchema', () => {
  it('builds a richer character description from structured fields', () => {
    const description = describeLibraryElement({
      id: 'char-1',
      type: 'character',
      name: 'Night Courier',
      description: 'scarred messenger carrying urgent letters',
      structuredValues: {
        type: 'warrior',
        appearance: 'young adult, scarred messenger with a weathered courier coat',
      },
      tags: [],
      createdAt: '',
      updatedAt: '',
    })

    expect(description).toContain('weathered courier coat')
    expect(description).toContain('scarred messenger')
    expect(description).toContain('warrior')
  })

  it('derives clean subject values from a character library element', () => {
    const subject = getCharacterLibrarySubjectValues({
      id: 'char-1',
      type: 'character',
      name: 'Night Courier',
      description: 'scarred messenger carrying urgent letters',
      structuredValues: {
        type: 'traveler',
        appearance: 'young adult, weathered courier coat, short windswept hair',
      },
      tags: [],
      createdAt: '',
      updatedAt: '',
    })

    expect(subject).toEqual({
      type: 'traveler',
      description: 'scarred messenger carrying urgent letters',
      appearance: 'young adult, weathered courier coat, short windswept hair',
    })
  })

  it('maps location metadata into the current project when inserted', () => {
    const project = createEmptyPromptProject('image')
    const result = applyLibraryElementToProject(project, {
      id: 'loc-1',
      type: 'location',
      name: 'Misty Bridge',
      description: '',
      structuredValues: {
        placeType: 'stone bridge over a river',
        era: 'medieval era',
        weather: 'fog',
        timeOfDay: 'blue hour',
        architecture: '',
        lighting: 'moonlight',
        palette: '',
      },
      tags: [],
      createdAt: '',
      updatedAt: '',
    })

    expect(result.environment.location).toContain('stone bridge')
    expect(result.environment.weather).toBe('fog')
    expect(result.lighting).toBe('moonlight')
  })

  it('can apply only a selected subset of library mappings', () => {
    const project = createEmptyPromptProject('image')
    const element = {
      id: 'comp-1',
      type: 'composition' as const,
      name: 'Film glow',
      description: '',
      structuredValues: {
        style: 'cinematic realism',
        lighting: 'moonlight',
        composition: 'layered foreground',
        captureDevice: '35mm analog camera',
      },
      tags: [],
      createdAt: '',
      updatedAt: '',
    }

    const mappings = getLibraryElementProjectMappings(element)
    const selected = mappings.filter((mapping) => mapping.targetPath !== 'lighting')
    const result = applyLibraryElementProjectMappings(project, selected)

    expect(result.style).toBe('cinematic realism')
    expect(result.composition).toBe('layered foreground')
    expect(result.lighting).toBe('')
  })

  it('creates a scene character draft from a library character', () => {
    const character = createSceneCharacterFromLibraryElement({
      id: 'char-2',
      type: 'character',
      name: 'Lantern Bearer',
      description: 'young lantern bearer wrapped in a pale travel coat',
      structuredValues: {
        type: 'traveler',
        appearance: 'pale travel coat, braided dark hair',
      },
      tags: [],
      createdAt: '',
      updatedAt: '',
    })

    expect(character.label).toBe('Lantern Bearer')
    expect(character.description).toBe('young lantern bearer wrapped in a pale travel coat')
    expect(character.type).toBe('traveler')
    expect(character.appearance).toContain('pale travel coat')
  })

  it('builds before and after comparisons for selected mappings', () => {
    const project = createEmptyPromptProject('image')
    project.mood = 'serene'

    const comparisons = createLibraryInsertComparisons(project, [
      {
        id: 'mood:melancholic',
        labelKey: 'builder.fields.mood',
        targetPath: 'mood',
        value: 'melancholic',
      },
    ])

    expect(comparisons[0]).toEqual({
      id: 'mood:melancholic',
      labelKey: 'builder.fields.mood',
      before: 'serene',
      after: 'melancholic',
      changed: true,
    })
  })

  it('returns unchanged comparison when the value already exists', () => {
    const project = createEmptyPromptProject('image')
    project.environment.weather = 'fog'

    const comparisons = createLibraryInsertComparisons(project, [
      {
        id: 'environment.weather:fog',
        labelKey: 'builder.fields.weather',
        targetPath: 'environment.weather',
        value: 'fog',
      },
    ])

    expect(comparisons[0]?.changed).toBe(false)
    expect(comparisons[0]?.before).toBe('fog')
  })
})
