import type { PromptProject } from '../types/models'

export interface EnrichmentSuggestion {
  id: string
  labelKey: string
  apply: (project: PromptProject) => PromptProject
}

const addDetail = (project: PromptProject, detail: string) => ({
  ...project,
  details: project.details.includes(detail)
    ? project.details
    : [...project.details, detail],
})

export const createEnrichmentSuggestions = (): EnrichmentSuggestion[] => [
  {
    id: 'atmosphere',
    labelKey: 'builder.suggestions.atmosphere',
    apply: (project) => ({
      ...project,
      mood: project.mood || 'melancholic hush with a feeling of discovery',
      environment: {
        ...project.environment,
        weather: project.environment.weather || 'gentle mist',
      },
    }),
  },
  {
    id: 'cinematic',
    labelKey: 'builder.suggestions.cinematic',
    apply: (project) => ({
      ...project,
      lighting: project.lighting || 'cinematic rim light with soft bloom',
      composition:
        project.composition || 'layered depth, balanced framing, subtle foreground',
    }),
  },
  {
    id: 'story',
    labelKey: 'builder.suggestions.story',
    apply: (project) => addDetail(project, 'a quiet sign of recent human presence'),
  },
  {
    id: 'world',
    labelKey: 'builder.suggestions.world',
    apply: (project) =>
      addDetail(project, 'small environmental clues that reveal a larger world'),
  },
  {
    id: 'emotion',
    labelKey: 'builder.suggestions.emotion',
    apply: (project) => ({
      ...project,
      description:
        project.description || 'A scene with emotional subtext and restrained drama.',
      details: project.details.includes('an expressive emotional cue')
        ? project.details
        : [...project.details, 'an expressive emotional cue'],
    }),
  },
]
