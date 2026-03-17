import { describe, expect, it } from 'vitest'
import { pickProjectTitleIdea } from './projectTitleIdeas'

describe('pickProjectTitleIdea', () => {
  it('returns a deterministic title for the same seed', () => {
    const ideas = ['A', 'B', 'C', 'D']

    expect(pickProjectTitleIdea('project-123', ideas, 'Fallback')).toBe(
      pickProjectTitleIdea('project-123', ideas, 'Fallback'),
    )
  })

  it('returns the fallback when no ideas are available', () => {
    expect(pickProjectTitleIdea('project-123', [], 'Fallback')).toBe('Fallback')
  })

  it('can vary between different project seeds', () => {
    const ideas = ['A', 'B', 'C', 'D']

    expect(pickProjectTitleIdea('project-a', ideas, 'Fallback')).not.toBe(
      pickProjectTitleIdea('project-z', ideas, 'Fallback'),
    )
  })
})