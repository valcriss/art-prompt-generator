import type { LibraryElement } from '../types/models'

const now = () => new Date().toISOString()

export const librarySeedElements: LibraryElement[] = [
  {
    id: 'seed-char-samurai',
    type: 'character',
    name: 'Wounded Samurai',
    description: 'old wounded samurai with long grey hair, worn armor, cloth bandage around arm',
    structuredValues: {
      type: 'warrior',
      appearance:
        'older adult, long grey hair, worn samurai armor, cloth bandage around the arm, weathered stoic expression',
    },
    tags: ['character', 'dramatic'],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'seed-loc-alley',
    type: 'location',
    name: 'Rainy Neon Alley',
    description: 'rainy cyberpunk alley with neon ramen signs and wet asphalt reflections',
    structuredValues: {
      placeType: 'narrow cyberpunk alley',
      era: 'near future',
      weather: 'soft rain',
      timeOfDay: 'night',
      architecture: 'dense signage and exposed wiring',
      lighting: 'neon reflections',
      palette: 'cyan, magenta, wet charcoal',
    },
    tags: ['cyberpunk', 'location'],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'seed-comp-fog',
    type: 'composition',
    name: 'Quiet Film Glow',
    description: 'melancholic quiet evening rendered with drifting fog and distant lantern light',
    structuredValues: {
      style: 'cinematic realism',
      lighting: 'volumetric fog glow',
      composition: 'layered foreground',
      captureDevice: '35mm analog camera',
    },
    tags: ['composition', 'fog'],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'seed-detail-banner',
    type: 'detail',
    name: 'Torn Banners',
    description: 'torn banners moving gently in the wind',
    structuredValues: {
      object: 'banners',
      material: 'weathered fabric',
      condition: 'torn and faded',
      placement: 'hanging above the street',
      narrativeRole: 'implies an older forgotten conflict',
    },
    tags: ['detail'],
    createdAt: now(),
    updatedAt: now(),
  },
]
