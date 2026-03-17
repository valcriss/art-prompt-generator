import { describe, expect, it } from 'vitest'
import { getLocalizedGuidedOptions, suggestCustomGuidedGroup } from './guidedVocabulary'

describe('guided vocabulary', () => {
  it('flags and prioritizes featured options for weather', () => {
    const options = getLocalizedGuidedOptions('weather', 'en', 'image')

    expect(options.slice(0, 6).every((option) => option.featured)).toBe(true)
    expect(options.slice(0, 6).map((option) => option.value)).toEqual(
      expect.arrayContaining(['clear sky', 'soft rain', 'fog', 'storm']),
    )
  })

  it('keeps scene positions curated at the top for quick picks', () => {
    const options = getLocalizedGuidedOptions('scenePosition', 'fr', 'image')

    expect(options.slice(0, 6).every((option) => option.featured)).toBe(true)
    expect(options.slice(0, 6).map((option) => option.value)).toEqual(
      expect.arrayContaining([
        'in the foreground center',
        'center frame',
        'in the foreground on the left',
        'in the midground',
      ]),
    )
  })

  it('adapts style featured options to a photography-oriented project', () => {
    const options = getLocalizedGuidedOptions('style', 'en', 'image', {
      id: 'photo-project',
      medium: 'image',
      title: '',
      description: '',
      subject: {},
      environment: {},
      mood: '',
      style: 'editorial photography',
      lighting: '',
      composition: '',
      details: [],
      motion: {},
      camera: { captureDevice: '35mm analog camera' },
      temporalStructure: {},
      positivePrompt: '',
      negativePrompt: '',
      tags: [],
      referenceImages: [],
      libraryElements: [],
      createdAt: '',
      updatedAt: '',
    })

    expect(options.slice(0, 3).map((option) => option.value)).toEqual([
      'editorial photography',
      'photojournalism',
      'documentary realism',
    ])
  })

  it('adapts style featured options from mood and era toward illustration', () => {
    const options = getLocalizedGuidedOptions('style', 'en', 'image', {
      id: 'illustration-project',
      medium: 'image',
      title: '',
      description: '',
      subject: {},
      environment: { era: 'medieval era' },
      mood: 'dreamlike',
      style: '',
      lighting: '',
      composition: '',
      details: [],
      motion: {},
      camera: {},
      temporalStructure: {},
      positivePrompt: '',
      negativePrompt: '',
      tags: [],
      referenceImages: [],
      libraryElements: [],
      createdAt: '',
      updatedAt: '',
    })

    expect(options.slice(0, 4).map((option) => option.value)).toEqual(
      expect.arrayContaining([
        'storybook illustration',
        'oil painting',
        'watercolor illustration',
        'sacred icon painting',
      ]),
    )
  })

  it('exposes a richer set of video-specific styles for motion projects', () => {
    const options = getLocalizedGuidedOptions('style', 'en', 'video')

    expect(options.map((option) => option.value)).toEqual(
      expect.arrayContaining([
        'poetic slow cinema',
        'gritty urban thriller',
        'music video gloss',
        'found footage tension',
        'melancholic road movie',
        'ritualistic sacred cinema',
      ]),
    )
  })

  it('surfaces context-aware featured video styles for tense rainy night scenes', () => {
    const options = getLocalizedGuidedOptions('style', 'en', 'video', {
      id: 'video-thriller-project',
      medium: 'video',
      title: '',
      description: '',
      subject: {},
      environment: {
        weather: 'heavy rain',
        timeOfDay: 'night',
      },
      mood: 'tense',
      style: '',
      lighting: '',
      composition: '',
      details: [],
      motion: {},
      camera: {
        captureDevice: 'security camera feed',
        movement: 'slow push-in',
        shotType: 'single-shot tracking frame',
      },
      temporalStructure: {},
      positivePrompt: '',
      negativePrompt: '',
      tags: [],
      referenceImages: [],
      libraryElements: [],
      createdAt: '',
      updatedAt: '',
    })

    expect(options.slice(0, 8).every((option) => option.featured)).toBe(true)
    expect(options.slice(0, 8).map((option) => option.value)).toEqual(
      expect.arrayContaining([
        'gritty urban thriller',
        'neon noir film language',
        'surveillance thriller aesthetic',
        'found footage tension',
        'single-take film still',
      ]),
    )
  })

  it('surfaces context-aware featured video lighting for tense rainy night scenes', () => {
    const options = getLocalizedGuidedOptions('lighting', 'en', 'video', {
      id: 'video-lighting-project',
      medium: 'video',
      title: '',
      description: '',
      subject: {},
      environment: {
        weather: 'heavy rain',
        timeOfDay: 'night',
      },
      mood: 'tense',
      style: '',
      lighting: '',
      composition: '',
      details: [],
      motion: {},
      camera: {
        captureDevice: 'security camera feed',
      },
      temporalStructure: {},
      positivePrompt: '',
      negativePrompt: '',
      tags: [],
      referenceImages: [],
      libraryElements: [],
      createdAt: '',
      updatedAt: '',
    })

    expect(options.slice(0, 8).every((option) => option.featured)).toBe(true)
    expect(options.slice(0, 8).map((option) => option.value)).toEqual(
      expect.arrayContaining([
        'neon reflections',
        'flickering neon light',
        'sodium streetlight',
        'silhouette backlight',
      ]),
    )
  })

  it('surfaces context-aware featured video lens feel for intimate handheld scenes', () => {
    const options = getLocalizedGuidedOptions('lensFeel', 'en', 'video', {
      id: 'video-lens-project',
      medium: 'video',
      title: '',
      description: '',
      subject: {},
      environment: {},
      mood: 'intimate',
      style: '',
      lighting: '',
      composition: '',
      details: [],
      motion: {},
      camera: {
        captureDevice: 'documentary handheld camera',
        movement: 'handheld drift',
        shotType: 'medium close-up',
      },
      temporalStructure: {},
      positivePrompt: '',
      negativePrompt: '',
      tags: [],
      referenceImages: [],
      libraryElements: [],
      createdAt: '',
      updatedAt: '',
    })

    expect(options.slice(0, 8).every((option) => option.featured)).toBe(true)
    expect(options.slice(0, 8).map((option) => option.value)).toEqual(
      expect.arrayContaining([
        'tactile handheld realism',
        'wide documentary lens',
        '50mm natural lens',
        'portrait lens softness',
      ]),
    )
  })

  it('surfaces context-aware featured video shot types for tense tracking scenes', () => {
    const options = getLocalizedGuidedOptions('shotType', 'en', 'video', {
      id: 'video-shottype-project',
      medium: 'video',
      title: '',
      description: '',
      subject: { type: 'traveler' },
      environment: {},
      mood: 'tense',
      style: '',
      lighting: '',
      composition: '',
      details: [],
      motion: { subjectMotion: 'running through the frame' },
      camera: {
        movement: 'forward tracking run',
      },
      temporalStructure: {},
      positivePrompt: '',
      negativePrompt: '',
      tags: [],
      referenceImages: [],
      libraryElements: [],
      createdAt: '',
      updatedAt: '',
    })

    expect(options.slice(0, 8).every((option) => option.featured)).toBe(true)
    expect(options.slice(0, 8).map((option) => option.value)).toEqual(
      expect.arrayContaining([
        'single-shot tracking frame',
        'rear-follow shot',
        'corridor chase frame',
        'moving master shot',
      ]),
    )
  })

  it('surfaces context-aware featured video movement for contemplative scenes', () => {
    const options = getLocalizedGuidedOptions('movement', 'en', 'video', {
      id: 'video-movement-project',
      medium: 'video',
      title: '',
      description: '',
      subject: {},
      environment: {},
      mood: 'contemplative',
      style: 'poetic slow cinema',
      lighting: '',
      composition: '',
      details: [],
      motion: { subjectMotion: 'walking slowly', environmentMotion: 'fog slowly rolling' },
      camera: {
        shotType: 'wide shot',
      },
      temporalStructure: {},
      positivePrompt: '',
      negativePrompt: '',
      tags: [],
      referenceImages: [],
      libraryElements: [],
      createdAt: '',
      updatedAt: '',
    })

    expect(options.slice(0, 8).every((option) => option.featured)).toBe(true)
    expect(options.slice(0, 8).map((option) => option.value)).toEqual(
      expect.arrayContaining([
        'locked-off camera',
        'floating glide',
        'slow orbit',
        'slow push-in',
      ]),
    )
  })

  it('merges custom guided values and localizes them', () => {
    const options = getLocalizedGuidedOptions('weather', 'fr', 'image', undefined, [
      {
        id: 'acid-rain',
        key: 'weather',
        value: 'acid rain',
        labels: {
          en: 'Acid rain',
          fr: 'Pluie acide',
        },
        group: 'atmospheric',
        createdAt: '',
        updatedAt: '',
      },
    ])

    expect(options.some((option) => option.value === 'acid rain' && option.label === 'Pluie acide')).toBe(true)
  })

  it('flags custom guided values as personal', () => {
    const options = getLocalizedGuidedOptions('weather', 'en', 'image', undefined, [
      {
        id: 'acid-rain',
        key: 'weather',
        value: 'acid rain',
        labels: {
          en: 'Acid rain',
          fr: 'Pluie acide',
        },
        group: 'atmospheric',
        createdAt: '',
        updatedAt: '',
      },
    ])

    expect(options.find((option) => option.value === 'acid rain')?.personal).toBe(true)
    expect(options.find((option) => option.value === 'clear sky')?.personal).toBe(false)
  })

  it('keeps the custom group when exposing personal options', () => {
    const options = getLocalizedGuidedOptions('weather', 'en', 'image', undefined, [
      {
        id: 'acid-rain',
        key: 'weather',
        value: 'acid rain',
        labels: {
          en: 'Acid rain',
          fr: 'Pluie acide',
        },
        group: 'cinematic',
        createdAt: '',
        updatedAt: '',
      },
    ])

    expect(options.find((option) => option.value === 'acid rain')).toMatchObject({
      personal: true,
      group: 'cinematic',
    })
  })

  it('suggests a matching group for new custom vocabulary values', () => {
    expect(suggestCustomGuidedGroup('weather', 'acid rain')).toBe('atmospheric')
    expect(suggestCustomGuidedGroup('movement', 'slow lateral dolly')).toBe('motion')
    expect(suggestCustomGuidedGroup('style', 'editorial photography')).toBe('core')
  })
})