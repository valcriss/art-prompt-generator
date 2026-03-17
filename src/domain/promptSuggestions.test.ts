import { describe, expect, it } from 'vitest'
import { createEmptyPromptProject } from './promptFactory'
import { createEnrichmentSuggestions } from './promptSuggestions'

describe('promptSuggestions', () => {
  it('surfaces targeted fill-the-gap suggestions for a sparse image project', () => {
    const project = createEmptyPromptProject('image')
    project.subject.type = 'portrait'

    const suggestions = createEnrichmentSuggestions(project)
    const suggestionIds = suggestions.map((suggestion) => suggestion.id)

    expect(suggestionIds).toContain('atmosphere')
    expect(suggestionIds).toContain('framing')
    expect(suggestionIds.some((id) => id === 'story' || id === 'emotion')).toBe(true)
  })

  it('hides bundle-overlapping suggestions when larger contextual combos are already available', () => {
    const project = createEmptyPromptProject('video')
    project.subject.type = 'traveler'
    project.environment.location = 'storm-broken alley'
    project.environment.weather = 'storm'
    project.mood = 'tense'

    const suggestions = createEnrichmentSuggestions(project, {
      suppressBundleOverlap: true,
    })

    expect(suggestions.map((suggestion) => suggestion.id)).not.toContain('atmosphere')
    expect(suggestions.map((suggestion) => suggestion.id)).not.toContain('framing')
    expect(suggestions.map((suggestion) => suggestion.id)).not.toContain('motion')
    expect(suggestions.map((suggestion) => suggestion.id)).toContain('story')
  })

  it('leans toward glow and mist enrichments for illustration-toned image projects', () => {
    const project = createEmptyPromptProject('image')
    project.environment.era = 'medieval era'
    project.mood = 'dreamlike'

    const suggestions = createEnrichmentSuggestions(project)

    expect(suggestions.slice(0, 2).map((suggestion) => suggestion.id)).toEqual(
      expect.arrayContaining(['atmosphere', 'framing']),
    )
  })
})