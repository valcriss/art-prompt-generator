export function pickProjectTitleIdea(seed: string, ideas: string[], fallback: string) {
  const normalizedIdeas = ideas.filter((idea) => idea.trim().length > 0)

  if (normalizedIdeas.length === 0) {
    return fallback
  }

  const hash = seed.split('').reduce((total, character) => total + character.charCodeAt(0), 0)

  return normalizedIdeas[hash % normalizedIdeas.length] ?? fallback
}