import { describe, expect, it } from 'vitest'
import {
  applyTemplateProfileToProject,
  deriveTemplateProfileFromProject,
} from './promptTemplateSchema'
import { createEmptyPromptProject } from './promptFactory'

describe('promptTemplateSchema', () => {
  it('derives a profile from an image project', () => {
    const project = createEmptyPromptProject('image')
    project.subject.type = 'portrait'
    project.environment.weather = 'fog'
    project.mood = 'melancholic'

    const profile = deriveTemplateProfileFromProject(project)

    expect(profile.subjectType).toBe('portrait')
    expect(profile.weather).toBe('fog')
    expect(profile.mood).toBe('melancholic')
  })

  it('applies video profile values back into a project', () => {
    const project = createEmptyPromptProject('video')

    const result = applyTemplateProfileToProject(project, {
      subjectType: 'traveler',
      weather: 'storm',
      timeOfDay: 'night',
      mood: 'tense',
      style: 'single-take film still',
      lighting: 'dramatic backlight',
      shotType: 'wide shot',
      movement: 'slow push-in',
      lensFeel: '35mm cinematic lens',
    })

    expect(result.subject.type).toBe('traveler')
    expect(result.camera?.movement).toBe('slow push-in')
    expect(result.style).toBe('single-take film still')
  })
})
