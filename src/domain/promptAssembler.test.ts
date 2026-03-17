import { describe, expect, it } from 'vitest'
import { assembleNegativePrompt, assemblePositivePrompt } from './promptAssembler'
import { createEmptyPromptProject, createEmptySceneCharacter } from './promptFactory'

describe('promptAssembler', () => {
  it('assembles a readable positive prompt from the project structure', () => {
    const project = createEmptyPromptProject()
    project.subject.type = 'wandering botanist'
    project.subject.action = 'cataloging moonlit flowers'
    project.environment.location = 'ancient greenhouse'
    project.mood = 'quiet wonder'
    project.details = ['condensation on glass panes']

    const result = assemblePositivePrompt(project)

    expect(result).toContain('wandering botanist')
    expect(result).toContain('ancient greenhouse')
    expect(result).toContain('quiet wonder')
    expect(result).toContain('condensation on glass panes')
  })

  it('adds video-specific artifacts to the negative prompt', () => {
    const project = createEmptyPromptProject('video')

    expect(assembleNegativePrompt(project)).toContain('temporal inconsistency')
  })

  it('keeps multiple characters distinct with spatial relationships', () => {
    const project = createEmptyPromptProject()
    project.subject.type = 'wounded samurai'
    project.subject.action = 'standing still in the shrine courtyard'

    const lanternBearer = createEmptySceneCharacter()
    lanternBearer.label = 'lantern bearer'
    lanternBearer.type = 'young woman'
    lanternBearer.appearance = 'pale travel coat'
    lanternBearer.action = 'holding a paper lantern close to her chest'
    lanternBearer.position = 'in the midground on the right'
    lanternBearer.spatialRelation = 'slightly behind'
    lanternBearer.relatedCharacterId = '__main__'

    project.sceneCharacters = [lanternBearer]

    const result = assemblePositivePrompt(project)

    expect(result).toContain('secondary character')
    expect(result).toContain('lantern bearer')
    expect(result).toContain('slightly behind the wounded samurai')
    expect(result).toContain('in the midground on the right')
  })
})
