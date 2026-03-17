import type { AppLocale, PromptMedium, PromptProject } from '../types/models'
import { rankGuidedOptionsForProject } from './guidedRecommendations'

export type GuidedGroup =
  | 'core'
  | 'atmospheric'
  | 'cinematic'
  | 'narrative'
  | 'motion'

export interface GuidedOption {
  value: string
  labels: Record<AppLocale, string>
  group: GuidedGroup
  mediums?: PromptMedium[]
}

export interface LocalizedGuidedOption {
  value: string
  label: string
  group: GuidedGroup
}

const matchesMedium = (option: GuidedOption, medium?: PromptMedium) =>
  !medium || !option.mediums || option.mediums.includes(medium)

export const guidedVocabulary = {
  subjectType: [
    { value: 'portrait', labels: { en: 'Portrait', fr: 'Portrait' }, group: 'core' },
    { value: 'warrior', labels: { en: 'Warrior', fr: 'Guerrier' }, group: 'narrative' },
    { value: 'traveler', labels: { en: 'Traveler', fr: 'Voyageur' }, group: 'narrative' },
    { value: 'creature', labels: { en: 'Creature', fr: 'Creature' }, group: 'atmospheric' },
    { value: 'architectural landmark', labels: { en: 'Architectural landmark', fr: 'Lieu architectural' }, group: 'core' },
    { value: 'vehicle', labels: { en: 'Vehicle', fr: 'Vehicule' }, group: 'cinematic' },
  ],
  era: [
    { value: 'ancient era', labels: { en: 'Ancient era', fr: 'Epoque antique' }, group: 'narrative' },
    { value: 'medieval era', labels: { en: 'Medieval era', fr: 'Epoque medievale' }, group: 'narrative' },
    { value: 'present day', labels: { en: 'Present day', fr: 'Epoque contemporaine' }, group: 'core' },
    { value: 'near future', labels: { en: 'Near future', fr: 'Futur proche' }, group: 'cinematic' },
    { value: 'far future', labels: { en: 'Far future', fr: 'Futur lointain' }, group: 'cinematic' },
    { value: 'post-apocalyptic era', labels: { en: 'Post-apocalyptic era', fr: 'Epoque post-apocalyptique' }, group: 'atmospheric' },
  ],
  season: [
    { value: 'spring', labels: { en: 'Spring', fr: 'Printemps' }, group: 'core' },
    { value: 'summer', labels: { en: 'Summer', fr: 'Ete' }, group: 'core' },
    { value: 'autumn', labels: { en: 'Autumn', fr: 'Automne' }, group: 'atmospheric' },
    { value: 'winter', labels: { en: 'Winter', fr: 'Hiver' }, group: 'atmospheric' },
    { value: 'monsoon season', labels: { en: 'Monsoon season', fr: 'Saison de mousson' }, group: 'cinematic' },
  ],
  weather: [
    { value: 'clear sky', labels: { en: 'Clear sky', fr: 'Ciel degage' }, group: 'core' },
    { value: 'soft rain', labels: { en: 'Soft rain', fr: 'Pluie legere' }, group: 'atmospheric' },
    { value: 'storm', labels: { en: 'Storm', fr: 'Tempete' }, group: 'cinematic' },
    { value: 'fog', labels: { en: 'Fog', fr: 'Brouillard' }, group: 'atmospheric' },
    { value: 'snowfall', labels: { en: 'Snowfall', fr: 'Chute de neige' }, group: 'narrative' },
    { value: 'humid haze', labels: { en: 'Humid haze', fr: 'Brume humide' }, group: 'atmospheric' },
  ],
  timeOfDay: [
    { value: 'dawn', labels: { en: 'Dawn', fr: 'Aube' }, group: 'atmospheric' },
    { value: 'morning', labels: { en: 'Morning', fr: 'Matin' }, group: 'core' },
    { value: 'golden hour', labels: { en: 'Golden hour', fr: 'Heure doree' }, group: 'cinematic' },
    { value: 'blue hour', labels: { en: 'Blue hour', fr: 'Heure bleue' }, group: 'cinematic' },
    { value: 'night', labels: { en: 'Night', fr: 'Nuit' }, group: 'atmospheric' },
    { value: 'midnight', labels: { en: 'Midnight', fr: 'Minuit' }, group: 'narrative' },
  ],
  mood: [
    { value: 'melancholic', labels: { en: 'Melancholic', fr: 'Melancolique' }, group: 'atmospheric' },
    { value: 'serene', labels: { en: 'Serene', fr: 'Serein' }, group: 'core' },
    { value: 'tense', labels: { en: 'Tense', fr: 'Tendu' }, group: 'cinematic' },
    { value: 'mysterious', labels: { en: 'Mysterious', fr: 'Mysterieuse' }, group: 'atmospheric' },
    { value: 'hopeful', labels: { en: 'Hopeful', fr: 'Pleine d espoir' }, group: 'narrative' },
    { value: 'oppressive', labels: { en: 'Oppressive', fr: 'Oppressante' }, group: 'cinematic' },
  ],
  style: [
    { value: 'cinematic concept art', labels: { en: 'Cinematic concept art', fr: 'Concept art cinematographique' }, group: 'cinematic' },
    { value: 'storybook illustration', labels: { en: 'Storybook illustration', fr: 'Illustration de conte' }, group: 'narrative', mediums: ['image'] },
    { value: 'anime key visual', labels: { en: 'Anime key visual', fr: 'Visuel cle anime' }, group: 'core', mediums: ['image'] },
    { value: 'dark fantasy matte painting', labels: { en: 'Dark fantasy matte painting', fr: 'Matte painting dark fantasy' }, group: 'atmospheric', mediums: ['image'] },
    { value: 'editorial photography', labels: { en: 'Editorial photography', fr: 'Photographie editoriale' }, group: 'core' },
    { value: 'painterly realism', labels: { en: 'Painterly realism', fr: 'Realisme pictural' }, group: 'narrative', mediums: ['image'] },
    { value: 'single-take film still', labels: { en: 'Single-take film still', fr: 'Image de plan-sequence' }, group: 'cinematic', mediums: ['video'] },
    { value: 'cinematic video concept frame', labels: { en: 'Cinematic video concept frame', fr: 'Frame de concept video cinematographique' }, group: 'cinematic', mediums: ['video'] },
  ],
  lighting: [
    { value: 'soft overcast light', labels: { en: 'Soft overcast light', fr: 'Lumiere diffuse couverte' }, group: 'core' },
    { value: 'neon reflections', labels: { en: 'Neon reflections', fr: 'Reflets neon' }, group: 'cinematic' },
    { value: 'warm window glow', labels: { en: 'Warm window glow', fr: 'Lueur chaude de fenetre' }, group: 'narrative' },
    { value: 'dramatic backlight', labels: { en: 'Dramatic backlight', fr: 'Contre-jour dramatique' }, group: 'cinematic' },
    { value: 'moonlight', labels: { en: 'Moonlight', fr: 'Lumiere lunaire' }, group: 'atmospheric' },
    { value: 'volumetric fog glow', labels: { en: 'Volumetric fog glow', fr: 'Halo volumetrique dans la brume' }, group: 'atmospheric' },
  ],
  composition: [
    { value: 'close-up portrait', labels: { en: 'Close-up portrait', fr: 'Portrait rapproche' }, group: 'core' },
    { value: 'wide cinematic frame', labels: { en: 'Wide cinematic frame', fr: 'Cadre large cinematographique' }, group: 'cinematic' },
    { value: 'low angle', labels: { en: 'Low angle', fr: 'Contre-plongee' }, group: 'cinematic' },
    { value: 'symmetrical framing', labels: { en: 'Symmetrical framing', fr: 'Cadre symetrique' }, group: 'core' },
    { value: 'shallow depth of field', labels: { en: 'Shallow depth of field', fr: 'Faible profondeur de champ' }, group: 'atmospheric' },
    { value: 'layered foreground and background', labels: { en: 'Layered foreground and background', fr: 'Avant-plan et arriere-plan en couches' }, group: 'narrative' },
  ],
  scenePosition: [
    { value: 'in the foreground on the left', labels: { en: 'Foreground left', fr: 'Avant-plan a gauche' }, group: 'core' },
    { value: 'in the foreground on the right', labels: { en: 'Foreground right', fr: 'Avant-plan a droite' }, group: 'core' },
    { value: 'in the midground', labels: { en: 'Midground', fr: 'Plan moyen' }, group: 'core' },
    { value: 'in the background', labels: { en: 'Background', fr: 'Arriere-plan' }, group: 'narrative' },
    { value: 'center frame', labels: { en: 'Center frame', fr: 'Au centre du cadre' }, group: 'cinematic' },
    { value: 'far in the distance', labels: { en: 'Far in the distance', fr: 'Tres loin dans le decor' }, group: 'narrative' },
  ],
  spatialRelation: [
    { value: 'next to', labels: { en: 'Next to', fr: 'A cote de' }, group: 'core' },
    { value: 'behind', labels: { en: 'Behind', fr: 'Derriere' }, group: 'core' },
    { value: 'in front of', labels: { en: 'In front of', fr: 'Devant' }, group: 'core' },
    { value: 'slightly behind', labels: { en: 'Slightly behind', fr: 'Legerement derriere' }, group: 'narrative' },
    { value: 'facing', labels: { en: 'Facing', fr: 'Face a' }, group: 'cinematic' },
    { value: 'to the left of', labels: { en: 'To the left of', fr: 'A gauche de' }, group: 'cinematic' },
    { value: 'to the right of', labels: { en: 'To the right of', fr: 'A droite de' }, group: 'cinematic' },
  ],
  captureDevice: [
    { value: 'shot on iphone', labels: { en: 'Shot on iPhone', fr: 'Pris a l iPhone' }, group: 'core', mediums: ['image'] },
    { value: '35mm analog camera', labels: { en: '35mm analog camera', fr: 'Appareil argentique 35mm' }, group: 'cinematic', mediums: ['image'] },
    { value: 'medium format film camera', labels: { en: 'Medium format film camera', fr: 'Appareil moyen format argentique' }, group: 'narrative', mediums: ['image'] },
    { value: 'digital cinema camera', labels: { en: 'Digital cinema camera', fr: 'Camera cinema numerique' }, group: 'cinematic' },
    { value: 'vhs camcorder', labels: { en: 'VHS camcorder', fr: 'Camescope VHS' }, group: 'atmospheric' },
    { value: 'documentary handheld camera', labels: { en: 'Documentary handheld camera', fr: 'Camera documentaire a l epaule' }, group: 'motion', mediums: ['video'] },
  ],
  subjectMotion: [
    { value: 'walking slowly', labels: { en: 'Walking slowly', fr: 'Marche lente' }, group: 'core', mediums: ['video'] },
    { value: 'turning toward the light', labels: { en: 'Turning toward the light', fr: 'Se tourne vers la lumiere' }, group: 'cinematic', mediums: ['video'] },
    { value: 'standing still', labels: { en: 'Standing still', fr: 'Reste immobile' }, group: 'core', mediums: ['video'] },
    { value: 'running through the frame', labels: { en: 'Running through the frame', fr: 'Traverse le cadre en courant' }, group: 'motion', mediums: ['video'] },
  ],
  environmentMotion: [
    { value: 'rain drifting through light', labels: { en: 'Rain drifting through light', fr: 'Pluie traversant la lumiere' }, group: 'atmospheric', mediums: ['video'] },
    { value: 'fog slowly rolling', labels: { en: 'Fog slowly rolling', fr: 'Brume qui avance lentement' }, group: 'atmospheric', mediums: ['video'] },
    { value: 'fabric moving in the wind', labels: { en: 'Fabric moving in the wind', fr: 'Tissu agite par le vent' }, group: 'motion', mediums: ['video'] },
    { value: 'embers floating in the air', labels: { en: 'Embers floating in the air', fr: 'Braises flottant dans l air' }, group: 'cinematic', mediums: ['video'] },
  ],
  shotType: [
    { value: 'close-up shot', labels: { en: 'Close-up shot', fr: 'Plan rapproche' }, group: 'core', mediums: ['video'] },
    { value: 'medium shot', labels: { en: 'Medium shot', fr: 'Plan moyen' }, group: 'core', mediums: ['video'] },
    { value: 'wide shot', labels: { en: 'Wide shot', fr: 'Plan large' }, group: 'cinematic', mediums: ['video'] },
    { value: 'single-shot tracking frame', labels: { en: 'Single-shot tracking frame', fr: 'Plan sequence en mouvement' }, group: 'motion', mediums: ['video'] },
  ],
  angle: [
    { value: 'eye-level angle', labels: { en: 'Eye-level angle', fr: 'Angle a hauteur des yeux' }, group: 'core', mediums: ['video'] },
    { value: 'low angle', labels: { en: 'Low angle', fr: 'Contre-plongee' }, group: 'cinematic', mediums: ['video'] },
    { value: 'high angle', labels: { en: 'High angle', fr: 'Plongee' }, group: 'cinematic', mediums: ['video'] },
    { value: 'over-the-shoulder angle', labels: { en: 'Over-the-shoulder angle', fr: 'Angle par-dessus l epaule' }, group: 'narrative', mediums: ['video'] },
  ],
  movement: [
    { value: 'slow push-in', labels: { en: 'Slow push-in', fr: 'Lent travelling avant' }, group: 'motion', mediums: ['video'] },
    { value: 'gentle pull-back', labels: { en: 'Gentle pull-back', fr: 'Lent travelling arriere' }, group: 'motion', mediums: ['video'] },
    { value: 'locked-off camera', labels: { en: 'Locked-off camera', fr: 'Camera fixe' }, group: 'core', mediums: ['video'] },
    { value: 'side tracking movement', labels: { en: 'Side tracking movement', fr: 'Travelling lateral' }, group: 'motion', mediums: ['video'] },
  ],
  lensFeel: [
    { value: '35mm cinematic lens', labels: { en: '35mm cinematic lens', fr: 'Optique cinematographique 35mm' }, group: 'cinematic', mediums: ['video'] },
    { value: '50mm natural lens', labels: { en: '50mm natural lens', fr: 'Optique naturelle 50mm' }, group: 'core', mediums: ['video'] },
    { value: 'wide anamorphic lens', labels: { en: 'Wide anamorphic lens', fr: 'Optique anamorphique large' }, group: 'cinematic', mediums: ['video'] },
    { value: 'telephoto compression', labels: { en: 'Telephoto compression', fr: 'Compression teleobjectif' }, group: 'narrative', mediums: ['video'] },
  ],
} satisfies Record<string, GuidedOption[]>

export const getLocalizedGuidedOptions = (
  key: keyof typeof guidedVocabulary,
  locale: AppLocale,
  medium?: PromptMedium,
  project?: PromptProject,
): LocalizedGuidedOption[] =>
  rankGuidedOptionsForProject(
    guidedVocabulary[key].filter((option) => matchesMedium(option, medium)),
    project ?? {
      id: '',
      medium: medium ?? 'image',
      title: '',
      description: '',
      subject: {},
      environment: {},
      mood: '',
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
    },
  )
    .map((option) => ({
      value: option.value,
      label: option.labels[locale],
      group: option.group,
    }))
