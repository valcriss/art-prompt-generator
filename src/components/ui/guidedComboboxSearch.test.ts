import { describe, expect, it } from 'vitest'
import { matchesComboboxQuery, normalizeSearchText } from './guidedComboboxSearch'

describe('guided combobox search', () => {
  it('normalizes accents and punctuation', () => {
    expect(normalizeSearchText('Époque d\'après-guerre')).toBe('epoque d apres guerre')
  })

  it('matches accent-insensitive and pluralized queries', () => {
    expect(
      matchesComboboxQuery(
        { label: 'Lumiere de bougie', value: 'candlelight' },
        'bougies',
      ),
    ).toBe(true)
  })

  it('matches lightweight cross-language synonyms', () => {
    expect(
      matchesComboboxQuery(
        { label: 'Brouillard', value: 'fog' },
        'brume',
      ),
    ).toBe(true)

    expect(
      matchesComboboxQuery(
        { label: 'Photographie editoriale', value: 'editorial photography' },
        'photo',
      ),
    ).toBe(true)
  })

  it('matches common creative-domain aliases', () => {
    expect(
      matchesComboboxQuery(
        { label: 'Contre-jour dramatique', value: 'dramatic backlight' },
        'contre jour',
      ),
    ).toBe(true)

    expect(
      matchesComboboxQuery(
        { label: 'Foret en ruines', value: 'forest ruins' },
        'forêt ruine',
      ),
    ).toBe(true)

    expect(
      matchesComboboxQuery(
        { label: 'Guerrier', value: 'warrior' },
        'samurai',
      ),
    ).toBe(true)

    expect(
      matchesComboboxQuery(
        { label: 'Nuit urbaine sans sommeil', value: 'sleepless city night' },
        'urban nocturne',
      ),
    ).toBe(true)

    expect(
      matchesComboboxQuery(
        { label: 'Port maritime', value: 'maritime harbor' },
        'coastal',
      ),
    ).toBe(true)
  })
})