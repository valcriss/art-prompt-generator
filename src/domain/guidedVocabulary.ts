import type {
  AppLocale,
  CustomGuidedOption,
  GuidedGroup,
  GuidedVocabularyKey,
  PromptMedium,
  PromptProject,
} from '../types/models'
import { rankGuidedOptionsForProject } from './guidedRecommendations'

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
  featured?: boolean
  personal?: boolean
}

const matchesMedium = (option: GuidedOption, medium?: PromptMedium) =>
  !medium || !option.mediums || option.mediums.includes(medium)

export const guidedVocabulary = {
  subjectType: [
    { value: 'portrait', labels: { en: 'Portrait', fr: 'Portrait' }, group: 'core' },
    { value: 'warrior', labels: { en: 'Warrior', fr: 'Guerrier' }, group: 'narrative' },
    { value: 'traveler', labels: { en: 'Traveler', fr: 'Voyageur' }, group: 'narrative' },
    { value: 'monk', labels: { en: 'Monk', fr: 'Moine' }, group: 'narrative' },
    { value: 'scholar', labels: { en: 'Scholar', fr: 'Erudit' }, group: 'narrative' },
    { value: 'oracle', labels: { en: 'Oracle', fr: 'Oracle' }, group: 'atmospheric' },
    { value: 'guardian', labels: { en: 'Guardian', fr: 'Gardien' }, group: 'narrative' },
    { value: 'assassin', labels: { en: 'Assassin', fr: 'Assassin' }, group: 'cinematic' },
    { value: 'noble', labels: { en: 'Noble', fr: 'Noble' }, group: 'narrative' },
    { value: 'outlaw', labels: { en: 'Outlaw', fr: 'Hors-la-loi' }, group: 'cinematic' },
    { value: 'merchant', labels: { en: 'Merchant', fr: 'Marchand' }, group: 'core' },
    { value: 'sailor', labels: { en: 'Sailor', fr: 'Marin' }, group: 'narrative' },
    { value: 'priestess', labels: { en: 'Priestess', fr: 'Pretresse' }, group: 'narrative' },
    { value: 'musician', labels: { en: 'Musician', fr: 'Musicien' }, group: 'core' },
    { value: 'dancer', labels: { en: 'Dancer', fr: 'Danseur' }, group: 'cinematic' },
    { value: 'inventor', labels: { en: 'Inventor', fr: 'Inventeur' }, group: 'narrative' },
    { value: 'creature', labels: { en: 'Creature', fr: 'Creature' }, group: 'atmospheric' },
    { value: 'spirit', labels: { en: 'Spirit', fr: 'Esprit' }, group: 'atmospheric' },
    { value: 'android', labels: { en: 'Android', fr: 'Androide' }, group: 'cinematic' },
    { value: 'child', labels: { en: 'Child', fr: 'Enfant' }, group: 'core' },
    { value: 'elder', labels: { en: 'Elder', fr: 'Ancien' }, group: 'narrative' },
    { value: 'architectural landmark', labels: { en: 'Architectural landmark', fr: 'Lieu architectural' }, group: 'core' },
    { value: 'vehicle', labels: { en: 'Vehicle', fr: 'Vehicule' }, group: 'cinematic' },
  ],
  era: [
    { value: 'prehistoric era', labels: { en: 'Prehistoric era', fr: 'Epoque prehistorique' }, group: 'atmospheric' },
    { value: 'ancient era', labels: { en: 'Ancient era', fr: 'Epoque antique' }, group: 'narrative' },
    { value: 'classical antiquity', labels: { en: 'Classical antiquity', fr: 'Antiquite classique' }, group: 'narrative' },
    { value: 'medieval era', labels: { en: 'Medieval era', fr: 'Epoque medievale' }, group: 'narrative' },
    { value: 'renaissance era', labels: { en: 'Renaissance era', fr: 'Epoque renaissance' }, group: 'narrative' },
    { value: 'baroque era', labels: { en: 'Baroque era', fr: 'Epoque baroque' }, group: 'narrative' },
    { value: 'victorian era', labels: { en: 'Victorian era', fr: 'Epoque victorienne' }, group: 'narrative' },
    { value: 'belle epoque', labels: { en: 'Belle Epoque', fr: 'Belle Epoque' }, group: 'narrative' },
    { value: 'industrial age', labels: { en: 'Industrial age', fr: 'Age industriel' }, group: 'cinematic' },
    { value: 'early 20th century', labels: { en: 'Early 20th century', fr: 'Debut du XXe siecle' }, group: 'core' },
    { value: 'post-war era', labels: { en: 'Post-war era', fr: 'Epoque d apres-guerre' }, group: 'core' },
    { value: '1970s', labels: { en: '1970s', fr: 'Annees 1970' }, group: 'core' },
    { value: '1990s', labels: { en: '1990s', fr: 'Annees 1990' }, group: 'core' },
    { value: 'present day', labels: { en: 'Present day', fr: 'Epoque contemporaine' }, group: 'core' },
    { value: 'near future', labels: { en: 'Near future', fr: 'Futur proche' }, group: 'cinematic' },
    { value: 'retro-futuristic era', labels: { en: 'Retro-futuristic era', fr: 'Epoque retro-futuriste' }, group: 'cinematic' },
    { value: 'far future', labels: { en: 'Far future', fr: 'Futur lointain' }, group: 'cinematic' },
    { value: 'alternate history era', labels: { en: 'Alternate history era', fr: 'Epoque uchronique' }, group: 'atmospheric' },
    { value: 'post-apocalyptic era', labels: { en: 'Post-apocalyptic era', fr: 'Epoque post-apocalyptique' }, group: 'atmospheric' },
    { value: 'mythic timeless era', labels: { en: 'Mythic timeless era', fr: 'Epoque mythique hors du temps' }, group: 'atmospheric' },
  ],
  season: [
    { value: 'early spring', labels: { en: 'Early spring', fr: 'Debut du printemps' }, group: 'core' },
    { value: 'spring', labels: { en: 'Spring', fr: 'Printemps' }, group: 'core' },
    { value: 'late spring', labels: { en: 'Late spring', fr: 'Fin du printemps' }, group: 'core' },
    { value: 'high summer', labels: { en: 'High summer', fr: 'Plein ete' }, group: 'cinematic' },
    { value: 'summer', labels: { en: 'Summer', fr: 'Ete' }, group: 'core' },
    { value: 'late summer', labels: { en: 'Late summer', fr: 'Fin d ete' }, group: 'core' },
    { value: 'harvest season', labels: { en: 'Harvest season', fr: 'Saison des recoltes' }, group: 'narrative' },
    { value: 'early autumn', labels: { en: 'Early autumn', fr: 'Debut de l automne' }, group: 'atmospheric' },
    { value: 'autumn', labels: { en: 'Autumn', fr: 'Automne' }, group: 'atmospheric' },
    { value: 'late autumn', labels: { en: 'Late autumn', fr: 'Fin de l automne' }, group: 'atmospheric' },
    { value: 'first snow', labels: { en: 'First snow', fr: 'Premieres neiges' }, group: 'narrative' },
    { value: 'winter', labels: { en: 'Winter', fr: 'Hiver' }, group: 'atmospheric' },
    { value: 'deep winter', labels: { en: 'Deep winter', fr: 'Coeur de l hiver' }, group: 'atmospheric' },
    { value: 'thaw season', labels: { en: 'Thaw season', fr: 'Saison du degel' }, group: 'narrative' },
    { value: 'dry season', labels: { en: 'Dry season', fr: 'Saison seche' }, group: 'core' },
    { value: 'rainy season', labels: { en: 'Rainy season', fr: 'Saison des pluies' }, group: 'atmospheric' },
    { value: 'monsoon season', labels: { en: 'Monsoon season', fr: 'Saison de mousson' }, group: 'cinematic' },
    { value: 'storm season', labels: { en: 'Storm season', fr: 'Saison des tempetes' }, group: 'cinematic' },
    { value: 'frost season', labels: { en: 'Frost season', fr: 'Saison du givre' }, group: 'atmospheric' },
    { value: 'blooming season', labels: { en: 'Blooming season', fr: 'Saison de floraison' }, group: 'narrative' },
  ],
  weather: [
    { value: 'clear sky', labels: { en: 'Clear sky', fr: 'Ciel degage' }, group: 'core' },
    { value: 'light clouds', labels: { en: 'Light clouds', fr: 'Legers nuages' }, group: 'core' },
    { value: 'overcast sky', labels: { en: 'Overcast sky', fr: 'Ciel couvert' }, group: 'core' },
    { value: 'soft rain', labels: { en: 'Soft rain', fr: 'Pluie legere' }, group: 'atmospheric' },
    { value: 'drizzle', labels: { en: 'Drizzle', fr: 'Bruine' }, group: 'atmospheric' },
    { value: 'heavy rain', labels: { en: 'Heavy rain', fr: 'Forte pluie' }, group: 'cinematic' },
    { value: 'storm', labels: { en: 'Storm', fr: 'Tempete' }, group: 'cinematic' },
    { value: 'thunderstorm', labels: { en: 'Thunderstorm', fr: 'Orage' }, group: 'cinematic' },
    { value: 'fog', labels: { en: 'Fog', fr: 'Brouillard' }, group: 'atmospheric' },
    { value: 'sea mist', labels: { en: 'Sea mist', fr: 'Brume marine' }, group: 'atmospheric' },
    { value: 'mountain mist', labels: { en: 'Mountain mist', fr: 'Brume de montagne' }, group: 'atmospheric' },
    { value: 'snowfall', labels: { en: 'Snowfall', fr: 'Chute de neige' }, group: 'narrative' },
    { value: 'light snow', labels: { en: 'Light snow', fr: 'Neige legere' }, group: 'narrative' },
    { value: 'blizzard', labels: { en: 'Blizzard', fr: 'Blizzard' }, group: 'cinematic' },
    { value: 'strong wind', labels: { en: 'Strong wind', fr: 'Vent fort' }, group: 'cinematic' },
    { value: 'dust storm', labels: { en: 'Dust storm', fr: 'Tempete de sable' }, group: 'cinematic' },
    { value: 'ash in the air', labels: { en: 'Ash in the air', fr: 'Cendres dans l air' }, group: 'atmospheric' },
    { value: 'humid haze', labels: { en: 'Humid haze', fr: 'Brume humide' }, group: 'atmospheric' },
    { value: 'heat shimmer', labels: { en: 'Heat shimmer', fr: 'Vibration de chaleur' }, group: 'atmospheric' },
    { value: 'icy air', labels: { en: 'Icy air', fr: 'Air glace' }, group: 'atmospheric' },
  ],
  timeOfDay: [
    { value: 'pre-dawn', labels: { en: 'Pre-dawn', fr: 'Avant l aube' }, group: 'atmospheric' },
    { value: 'dawn', labels: { en: 'Dawn', fr: 'Aube' }, group: 'atmospheric' },
    { value: 'first light', labels: { en: 'First light', fr: 'Premiere lumiere' }, group: 'narrative' },
    { value: 'early morning', labels: { en: 'Early morning', fr: 'Petit matin' }, group: 'core' },
    { value: 'morning', labels: { en: 'Morning', fr: 'Matin' }, group: 'core' },
    { value: 'late morning', labels: { en: 'Late morning', fr: 'Fin de matinee' }, group: 'core' },
    { value: 'noon', labels: { en: 'Noon', fr: 'Midi' }, group: 'core' },
    { value: 'afternoon', labels: { en: 'Afternoon', fr: 'Apres-midi' }, group: 'core' },
    { value: 'late afternoon', labels: { en: 'Late afternoon', fr: 'Fin d apres-midi' }, group: 'narrative' },
    { value: 'golden hour', labels: { en: 'Golden hour', fr: 'Heure doree' }, group: 'cinematic' },
    { value: 'sunset', labels: { en: 'Sunset', fr: 'Coucher du soleil' }, group: 'cinematic' },
    { value: 'dusk', labels: { en: 'Dusk', fr: 'Crepuscule' }, group: 'atmospheric' },
    { value: 'twilight', labels: { en: 'Twilight', fr: 'Entre chien et loup' }, group: 'atmospheric' },
    { value: 'blue hour', labels: { en: 'Blue hour', fr: 'Heure bleue' }, group: 'cinematic' },
    { value: 'evening', labels: { en: 'Evening', fr: 'Soiree' }, group: 'core' },
    { value: 'night', labels: { en: 'Night', fr: 'Nuit' }, group: 'atmospheric' },
    { value: 'deep night', labels: { en: 'Deep night', fr: 'Coeur de la nuit' }, group: 'atmospheric' },
    { value: 'midnight', labels: { en: 'Midnight', fr: 'Minuit' }, group: 'narrative' },
    { value: 'sleepless city night', labels: { en: 'Sleepless city night', fr: 'Nuit urbaine sans sommeil' }, group: 'cinematic' },
    { value: 'before sunrise storm light', labels: { en: 'Before sunrise storm light', fr: 'Lumiere d orage avant l aube' }, group: 'cinematic' },
  ],
  mood: [
    { value: 'melancholic', labels: { en: 'Melancholic', fr: 'Melancolique' }, group: 'atmospheric' },
    { value: 'serene', labels: { en: 'Serene', fr: 'Serein' }, group: 'core' },
    { value: 'tense', labels: { en: 'Tense', fr: 'Tendu' }, group: 'cinematic' },
    { value: 'mysterious', labels: { en: 'Mysterious', fr: 'Mysterieuse' }, group: 'atmospheric' },
    { value: 'hopeful', labels: { en: 'Hopeful', fr: 'Pleine d espoir' }, group: 'narrative' },
    { value: 'oppressive', labels: { en: 'Oppressive', fr: 'Oppressante' }, group: 'cinematic' },
    { value: 'contemplative', labels: { en: 'Contemplative', fr: 'Contemplative' }, group: 'narrative' },
    { value: 'nostalgic', labels: { en: 'Nostalgic', fr: 'Nostalgique' }, group: 'narrative' },
    { value: 'dreamlike', labels: { en: 'Dreamlike', fr: 'Onirique' }, group: 'atmospheric' },
    { value: 'intimate', labels: { en: 'Intimate', fr: 'Intime' }, group: 'core' },
    { value: 'solemn', labels: { en: 'Solemn', fr: 'Solennelle' }, group: 'narrative' },
    { value: 'haunted', labels: { en: 'Haunted', fr: 'Hantee' }, group: 'atmospheric' },
    { value: 'triumphant', labels: { en: 'Triumphant', fr: 'Triomphante' }, group: 'cinematic' },
    { value: 'uneasy', labels: { en: 'Uneasy', fr: 'Inquiete' }, group: 'atmospheric' },
    { value: 'sacred', labels: { en: 'Sacred', fr: 'Sacree' }, group: 'narrative' },
    { value: 'lonely', labels: { en: 'Lonely', fr: 'Solitaire' }, group: 'atmospheric' },
    { value: 'euphoric', labels: { en: 'Euphoric', fr: 'Euphorique' }, group: 'cinematic' },
    { value: 'feral', labels: { en: 'Feral', fr: 'Sauvage' }, group: 'cinematic' },
    { value: 'tender', labels: { en: 'Tender', fr: 'Tendre' }, group: 'core' },
    { value: 'awe-struck', labels: { en: 'Awe-struck', fr: 'Saisie d admiration' }, group: 'narrative' },
  ],
  style: [
    { value: 'cinematic concept art', labels: { en: 'Cinematic concept art', fr: 'Concept art cinematographique' }, group: 'cinematic' },
    { value: 'storybook illustration', labels: { en: 'Storybook illustration', fr: 'Illustration de conte' }, group: 'narrative', mediums: ['image'] },
    { value: 'anime key visual', labels: { en: 'Anime key visual', fr: 'Visuel cle anime' }, group: 'core', mediums: ['image'] },
    { value: 'dark fantasy matte painting', labels: { en: 'Dark fantasy matte painting', fr: 'Matte painting dark fantasy' }, group: 'atmospheric', mediums: ['image'] },
    { value: 'editorial photography', labels: { en: 'Editorial photography', fr: 'Photographie editoriale' }, group: 'core' },
    { value: 'painterly realism', labels: { en: 'Painterly realism', fr: 'Realisme pictural' }, group: 'narrative', mediums: ['image'] },
    { value: 'oil painting', labels: { en: 'Oil painting', fr: 'Peinture a l huile' }, group: 'narrative', mediums: ['image'] },
    { value: 'watercolor illustration', labels: { en: 'Watercolor illustration', fr: 'Illustration a l aquarelle' }, group: 'narrative', mediums: ['image'] },
    { value: 'ink illustration', labels: { en: 'Ink illustration', fr: 'Illustration a l encre' }, group: 'narrative', mediums: ['image'] },
    { value: 'charcoal sketch', labels: { en: 'Charcoal sketch', fr: 'Esquisse au fusain' }, group: 'core', mediums: ['image'] },
    { value: 'graphic novel art', labels: { en: 'Graphic novel art', fr: 'Art de roman graphique' }, group: 'cinematic', mediums: ['image'] },
    { value: 'cyberpunk noir illustration', labels: { en: 'Cyberpunk noir illustration', fr: 'Illustration cyberpunk noir' }, group: 'cinematic', mediums: ['image'] },
    { value: 'sacred icon painting', labels: { en: 'Sacred icon painting', fr: 'Peinture d icone sacree' }, group: 'narrative', mediums: ['image'] },
    { value: 'maritime cinematic realism', labels: { en: 'Maritime cinematic realism', fr: 'Realisme cinematographique maritime' }, group: 'cinematic', mediums: ['image'] },
    { value: 'desert mythic matte painting', labels: { en: 'Desert mythic matte painting', fr: 'Matte painting desert mythique' }, group: 'atmospheric', mediums: ['image'] },
    { value: 'fashion editorial', labels: { en: 'Fashion editorial', fr: 'Editorial de mode' }, group: 'core' },
    { value: 'photojournalism', labels: { en: 'Photojournalism', fr: 'Photojournalisme' }, group: 'core' },
    { value: 'fantasy realism', labels: { en: 'Fantasy realism', fr: 'Realisme fantastique' }, group: 'atmospheric', mediums: ['image'] },
    { value: 'surreal collage', labels: { en: 'Surreal collage', fr: 'Collage surrealiste' }, group: 'atmospheric', mediums: ['image'] },
    { value: 'gothic romanticism', labels: { en: 'Gothic romanticism', fr: 'Romantisme gothique' }, group: 'atmospheric', mediums: ['image'] },
    { value: 'art nouveau poster', labels: { en: 'Art nouveau poster', fr: 'Affiche art nouveau' }, group: 'narrative', mediums: ['image'] },
    { value: 'retro anime cel look', labels: { en: 'Retro anime cel look', fr: 'Look anime cellulo retro' }, group: 'core', mediums: ['image'] },
    { value: 'documentary realism', labels: { en: 'Documentary realism', fr: 'Realisme documentaire' }, group: 'core' },
    { value: 'cinematic noir', labels: { en: 'Cinematic noir', fr: 'Noir cinematographique' }, group: 'cinematic' },
    { value: 'single-take film still', labels: { en: 'Single-take film still', fr: 'Image de plan-sequence' }, group: 'cinematic', mediums: ['video'] },
    { value: 'cinematic video concept frame', labels: { en: 'Cinematic video concept frame', fr: 'Frame de concept video cinematographique' }, group: 'cinematic', mediums: ['video'] },
    { value: 'poetic slow cinema', labels: { en: 'Poetic slow cinema', fr: 'Slow cinema poetique' }, group: 'atmospheric', mediums: ['video'] },
    { value: 'arthouse festival film', labels: { en: 'Arthouse festival film', fr: 'Film d auteur de festival' }, group: 'narrative', mediums: ['video'] },
    { value: 'gritty urban thriller', labels: { en: 'Gritty urban thriller', fr: 'Thriller urbain rugueux' }, group: 'cinematic', mediums: ['video'] },
    { value: 'moody sci-fi cinema', labels: { en: 'Moody sci-fi cinema', fr: 'Cinema de science-fiction atmospherique' }, group: 'cinematic', mediums: ['video'] },
    { value: 'elevated horror atmosphere', labels: { en: 'Elevated horror atmosphere', fr: 'Atmosphere d horreur raffinee' }, group: 'atmospheric', mediums: ['video'] },
    { value: 'dreamlike fantasy cinema', labels: { en: 'Dreamlike fantasy cinema', fr: 'Cinema fantastique onirique' }, group: 'atmospheric', mediums: ['video'] },
    { value: 'intimate character drama', labels: { en: 'Intimate character drama', fr: 'Drame intime de personnage' }, group: 'narrative', mediums: ['video'] },
    { value: 'commercial luxury film', labels: { en: 'Commercial luxury film', fr: 'Film publicitaire luxe' }, group: 'core', mediums: ['video'] },
    { value: 'music video gloss', labels: { en: 'Music video gloss', fr: 'Brillance de clip musical' }, group: 'cinematic', mediums: ['video'] },
    { value: 'raw documentary cinema', labels: { en: 'Raw documentary cinema', fr: 'Cinema documentaire brut' }, group: 'motion', mediums: ['video'] },
    { value: 'surveillance thriller aesthetic', labels: { en: 'Surveillance thriller aesthetic', fr: 'Esthetique de thriller de surveillance' }, group: 'atmospheric', mediums: ['video'] },
    { value: 'found footage tension', labels: { en: 'Found footage tension', fr: 'Tension found footage' }, group: 'motion', mediums: ['video'] },
    { value: 'retro 16mm mood', labels: { en: 'Retro 16mm mood', fr: 'Ambiance retro 16mm' }, group: 'narrative', mediums: ['video'] },
    { value: 'neon noir film language', labels: { en: 'Neon noir film language', fr: 'Langage filmique neon noir' }, group: 'cinematic', mediums: ['video'] },
    { value: 'mythic epic cinema', labels: { en: 'Mythic epic cinema', fr: 'Cinema epique mythique' }, group: 'cinematic', mediums: ['video'] },
    { value: 'painterly moving tableau', labels: { en: 'Painterly moving tableau', fr: 'Tableau en mouvement pictural' }, group: 'narrative', mediums: ['video'] },
    { value: 'meditative one-shot cinema', labels: { en: 'Meditative one-shot cinema', fr: 'Cinema meditatif en plan unique' }, group: 'atmospheric', mediums: ['video'] },
    { value: 'stylized action cinema', labels: { en: 'Stylized action cinema', fr: 'Cinema d action stylise' }, group: 'cinematic', mediums: ['video'] },
    { value: 'melancholic road movie', labels: { en: 'Melancholic road movie', fr: 'Road movie melancholique' }, group: 'narrative', mediums: ['video'] },
    { value: 'ritualistic sacred cinema', labels: { en: 'Ritualistic sacred cinema', fr: 'Cinema sacre ritualise' }, group: 'narrative', mediums: ['video'] },
  ],
  lighting: [
    { value: 'soft overcast light', labels: { en: 'Soft overcast light', fr: 'Lumiere diffuse couverte' }, group: 'core' },
    { value: 'neon reflections', labels: { en: 'Neon reflections', fr: 'Reflets neon' }, group: 'cinematic' },
    { value: 'warm window glow', labels: { en: 'Warm window glow', fr: 'Lueur chaude de fenetre' }, group: 'narrative' },
    { value: 'dramatic backlight', labels: { en: 'Dramatic backlight', fr: 'Contre-jour dramatique' }, group: 'cinematic' },
    { value: 'moonlight', labels: { en: 'Moonlight', fr: 'Lumiere lunaire' }, group: 'atmospheric' },
    { value: 'volumetric fog glow', labels: { en: 'Volumetric fog glow', fr: 'Halo volumetrique dans la brume' }, group: 'atmospheric' },
    { value: 'candlelight', labels: { en: 'Candlelight', fr: 'Lumiere de bougie' }, group: 'narrative' },
    { value: 'firelight', labels: { en: 'Firelight', fr: 'Lumiere du feu' }, group: 'narrative' },
    { value: 'lantern glow', labels: { en: 'Lantern glow', fr: 'Lueur de lanterne' }, group: 'narrative' },
    { value: 'stained glass light', labels: { en: 'Stained glass light', fr: 'Lumiere de vitrail' }, group: 'atmospheric' },
    { value: 'harsh midday sun', labels: { en: 'Harsh midday sun', fr: 'Soleil dur de midi' }, group: 'core' },
    { value: 'rim light', labels: { en: 'Rim light', fr: 'Lumiere de contour' }, group: 'cinematic' },
    { value: 'soft skylight', labels: { en: 'Soft skylight', fr: 'Lumiere douce du ciel' }, group: 'core' },
    { value: 'cold fluorescent light', labels: { en: 'Cold fluorescent light', fr: 'Lumiere fluorescente froide' }, group: 'core' },
    { value: 'sodium streetlight', labels: { en: 'Sodium streetlight', fr: 'Lampadaire sodium' }, group: 'cinematic' },
    { value: 'bioluminescent glow', labels: { en: 'Bioluminescent glow', fr: 'Lueur bioluminescente' }, group: 'atmospheric' },
    { value: 'reflected water light', labels: { en: 'Reflected water light', fr: 'Reflets de lumiere sur l eau' }, group: 'atmospheric' },
    { value: 'dusty sun rays', labels: { en: 'Dusty sun rays', fr: 'Rayons de soleil poussiereux' }, group: 'atmospheric' },
    { value: 'flickering neon light', labels: { en: 'Flickering neon light', fr: 'Lumiere neon vacillante' }, group: 'cinematic' },
    { value: 'silhouette backlight', labels: { en: 'Silhouette backlight', fr: 'Contre-jour en silhouette' }, group: 'cinematic' },
  ],
  composition: [
    { value: 'close-up portrait', labels: { en: 'Close-up portrait', fr: 'Portrait rapproche' }, group: 'core' },
    { value: 'wide cinematic frame', labels: { en: 'Wide cinematic frame', fr: 'Cadre large cinematographique' }, group: 'cinematic' },
    { value: 'low angle', labels: { en: 'Low angle', fr: 'Contre-plongee' }, group: 'cinematic' },
    { value: 'symmetrical framing', labels: { en: 'Symmetrical framing', fr: 'Cadre symetrique' }, group: 'core' },
    { value: 'shallow depth of field', labels: { en: 'Shallow depth of field', fr: 'Faible profondeur de champ' }, group: 'atmospheric' },
    { value: 'layered foreground and background', labels: { en: 'Layered foreground and background', fr: 'Avant-plan et arriere-plan en couches' }, group: 'narrative' },
    { value: 'rule of thirds', labels: { en: 'Rule of thirds', fr: 'Regle des tiers' }, group: 'core' },
    { value: 'bird\'s-eye view', labels: { en: 'Bird\'s-eye view', fr: 'Vue en plongee aerienne' }, group: 'cinematic' },
    { value: 'worm\'s-eye view', labels: { en: 'Worm\'s-eye view', fr: 'Vue ras du sol' }, group: 'cinematic' },
    { value: 'dutch angle', labels: { en: 'Dutch angle', fr: 'Angle incline' }, group: 'cinematic' },
    { value: 'over-the-shoulder framing', labels: { en: 'Over-the-shoulder framing', fr: 'Cadre par-dessus l epaule' }, group: 'narrative' },
    { value: 'negative space composition', labels: { en: 'Negative space composition', fr: 'Composition en espace negatif' }, group: 'core' },
    { value: 'leading lines', labels: { en: 'Leading lines', fr: 'Lignes directrices' }, group: 'core' },
    { value: 'central vanishing point', labels: { en: 'Central vanishing point', fr: 'Point de fuite central' }, group: 'narrative' },
    { value: 'off-center tension', labels: { en: 'Off-center tension', fr: 'Tension hors axe' }, group: 'cinematic' },
    { value: 'silhouette composition', labels: { en: 'Silhouette composition', fr: 'Composition en silhouette' }, group: 'atmospheric' },
    { value: 'framed through a doorway', labels: { en: 'Framed through a doorway', fr: 'Cadre a travers une porte' }, group: 'narrative' },
    { value: 'framed through a window', labels: { en: 'Framed through a window', fr: 'Cadre a travers une fenetre' }, group: 'narrative' },
    { value: 'cathedral framing', labels: { en: 'Cathedral framing', fr: 'Cadrage cathedral' }, group: 'narrative' },
    { value: 'horizon-heavy seascape', labels: { en: 'Horizon-heavy seascape', fr: 'Paysage marin a horizon large' }, group: 'atmospheric' },
    { value: 'heat-haze distance', labels: { en: 'Heat-haze distance', fr: 'Distance dans la brume de chaleur' }, group: 'atmospheric' },
    { value: 'crowded layered frame', labels: { en: 'Crowded layered frame', fr: 'Cadre dense en couches' }, group: 'cinematic' },
    { value: 'intimate close crop', labels: { en: 'Intimate close crop', fr: 'Cadrage rapproche intime' }, group: 'core' },
  ],
  scenePosition: [
    { value: 'in the foreground on the left', labels: { en: 'Foreground left', fr: 'Avant-plan a gauche' }, group: 'core' },
    { value: 'in the foreground on the right', labels: { en: 'Foreground right', fr: 'Avant-plan a droite' }, group: 'core' },
    { value: 'in the foreground center', labels: { en: 'Foreground center', fr: 'Avant-plan au centre' }, group: 'core' },
    { value: 'in the foreground slightly left', labels: { en: 'Foreground slightly left', fr: 'Avant-plan legerement a gauche' }, group: 'core' },
    { value: 'in the foreground slightly right', labels: { en: 'Foreground slightly right', fr: 'Avant-plan legerement a droite' }, group: 'core' },
    { value: 'in the midground', labels: { en: 'Midground', fr: 'Plan moyen' }, group: 'core' },
    { value: 'in the midground on the left', labels: { en: 'Midground left', fr: 'Plan moyen a gauche' }, group: 'core' },
    { value: 'in the midground on the right', labels: { en: 'Midground right', fr: 'Plan moyen a droite' }, group: 'core' },
    { value: 'in the background', labels: { en: 'Background', fr: 'Arriere-plan' }, group: 'narrative' },
    { value: 'center frame', labels: { en: 'Center frame', fr: 'Au centre du cadre' }, group: 'cinematic' },
    { value: 'far in the distance', labels: { en: 'Far in the distance', fr: 'Tres loin dans le decor' }, group: 'narrative' },
    { value: 'framed in a doorway', labels: { en: 'Framed in a doorway', fr: 'Cadre dans une embrasure' }, group: 'narrative' },
    { value: 'seen from behind', labels: { en: 'Seen from behind', fr: 'Vu de dos' }, group: 'narrative' },
    { value: 'partially hidden behind an object', labels: { en: 'Partially hidden', fr: 'Partiellement cache' }, group: 'narrative' },
    { value: 'silhouetted against the light', labels: { en: 'Silhouetted against the light', fr: 'En silhouette contre la lumiere' }, group: 'cinematic' },
    { value: 'reflected in glass', labels: { en: 'Reflected in glass', fr: 'Reflete dans le verre' }, group: 'cinematic' },
    { value: 'reflected in water', labels: { en: 'Reflected in water', fr: 'Reflete dans l eau' }, group: 'cinematic' },
    { value: 'towering above the scene', labels: { en: 'Towering above the scene', fr: 'Dominant la scene' }, group: 'cinematic' },
    { value: 'seated at the frame edge', labels: { en: 'Seated at the frame edge', fr: 'Assis au bord du cadre' }, group: 'narrative' },
    { value: 'small against the landscape', labels: { en: 'Small against the landscape', fr: 'Minuscule face au paysage' }, group: 'atmospheric' },
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
    { value: 'instant film camera', labels: { en: 'Instant film camera', fr: 'Appareil photo instantane' }, group: 'narrative', mediums: ['image'] },
    { value: 'disposable camera', labels: { en: 'Disposable camera', fr: 'Appareil jetable' }, group: 'core', mediums: ['image'] },
    { value: '16mm film camera', labels: { en: '16mm film camera', fr: 'Camera 16mm' }, group: 'cinematic' },
    { value: 'studio digital medium format', labels: { en: 'Studio digital medium format', fr: 'Moyen format numerique studio' }, group: 'core', mediums: ['image'] },
    { value: 'drone camera', labels: { en: 'Drone camera', fr: 'Camera drone' }, group: 'cinematic' },
    { value: 'action camera', labels: { en: 'Action camera', fr: 'Camera d action' }, group: 'motion' },
    { value: 'security camera feed', labels: { en: 'Security camera feed', fr: 'Flux de camera de surveillance' }, group: 'atmospheric' },
    { value: 'polaroid camera', labels: { en: 'Polaroid camera', fr: 'Appareil Polaroid' }, group: 'narrative', mediums: ['image'] },
    { value: 'phone front camera', labels: { en: 'Phone front camera', fr: 'Camera avant de telephone' }, group: 'core', mediums: ['image'] },
    { value: 'webcam aesthetic camera', labels: { en: 'Webcam aesthetic camera', fr: 'Esthetique webcam' }, group: 'core' },
    { value: 'surveillance zoom camera', labels: { en: 'Surveillance zoom camera', fr: 'Camera de surveillance zoom' }, group: 'atmospheric' },
    { value: 'vintage broadcast camera', labels: { en: 'Vintage broadcast camera', fr: 'Camera de diffusion vintage' }, group: 'narrative' },
    { value: 'mirrorless photo camera', labels: { en: 'Mirrorless photo camera', fr: 'Appareil photo hybride' }, group: 'core', mediums: ['image'] },
    { value: 'body-mounted camera', labels: { en: 'Body-mounted camera', fr: 'Camera fixee au corps' }, group: 'motion', mediums: ['video'] },
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
    { value: 'extreme close-up', labels: { en: 'Extreme close-up', fr: 'Tres gros plan' }, group: 'cinematic', mediums: ['video'] },
    { value: 'medium close-up', labels: { en: 'Medium close-up', fr: 'Plan poitrine' }, group: 'core', mediums: ['video'] },
    { value: 'full-body shot', labels: { en: 'Full-body shot', fr: 'Plan en pied' }, group: 'core', mediums: ['video'] },
    { value: 'establishing shot', labels: { en: 'Establishing shot', fr: 'Plan d ensemble d installation' }, group: 'narrative', mediums: ['video'] },
    { value: 'overhead shot', labels: { en: 'Overhead shot', fr: 'Plan en vue du dessus' }, group: 'cinematic', mediums: ['video'] },
    { value: 'point-of-view shot', labels: { en: 'Point-of-view shot', fr: 'Plan en point de vue' }, group: 'narrative', mediums: ['video'] },
    { value: 'over-the-shoulder shot', labels: { en: 'Over-the-shoulder shot', fr: 'Plan par-dessus l epaule' }, group: 'narrative', mediums: ['video'] },
    { value: 'insert shot', labels: { en: 'Insert shot', fr: 'Plan insert' }, group: 'narrative', mediums: ['video'] },
    { value: 'profile shot', labels: { en: 'Profile shot', fr: 'Plan de profil' }, group: 'core', mediums: ['video'] },
    { value: 'rear-follow shot', labels: { en: 'Rear-follow shot', fr: 'Plan de suivi arriere' }, group: 'motion', mediums: ['video'] },
    { value: 'long tracking shot', labels: { en: 'Long tracking shot', fr: 'Long travelling suivi' }, group: 'motion', mediums: ['video'] },
    { value: 'static tableau shot', labels: { en: 'Static tableau shot', fr: 'Plan tableau fixe' }, group: 'core', mediums: ['video'] },
    { value: 'moving master shot', labels: { en: 'Moving master shot', fr: 'Plan master en mouvement' }, group: 'motion', mediums: ['video'] },
    { value: 'intimate handheld close-up', labels: { en: 'Intimate handheld close-up', fr: 'Gros plan intime a l epaule' }, group: 'motion', mediums: ['video'] },
    { value: 'distant observer shot', labels: { en: 'Distant observer shot', fr: 'Plan d observateur lointain' }, group: 'atmospheric', mediums: ['video'] },
    { value: 'corridor chase frame', labels: { en: 'Corridor chase frame', fr: 'Cadre de poursuite en couloir' }, group: 'cinematic', mediums: ['video'] },
  ],
  angle: [
    { value: 'eye-level angle', labels: { en: 'Eye-level angle', fr: 'Angle a hauteur des yeux' }, group: 'core', mediums: ['video'] },
    { value: 'low angle', labels: { en: 'Low angle', fr: 'Contre-plongee' }, group: 'cinematic', mediums: ['video'] },
    { value: 'high angle', labels: { en: 'High angle', fr: 'Plongee' }, group: 'cinematic', mediums: ['video'] },
    { value: 'over-the-shoulder angle', labels: { en: 'Over-the-shoulder angle', fr: 'Angle par-dessus l epaule' }, group: 'narrative', mediums: ['video'] },
    { value: 'top-down angle', labels: { en: 'Top-down angle', fr: 'Angle vertical plongeant' }, group: 'cinematic', mediums: ['video'] },
    { value: 'ground-level angle', labels: { en: 'Ground-level angle', fr: 'Angle au ras du sol' }, group: 'cinematic', mediums: ['video'] },
    { value: 'canted angle', labels: { en: 'Canted angle', fr: 'Angle desaxe' }, group: 'cinematic', mediums: ['video'] },
    { value: 'profile angle', labels: { en: 'Profile angle', fr: 'Angle de profil' }, group: 'core', mediums: ['video'] },
    { value: 'rear-follow angle', labels: { en: 'Rear-follow angle', fr: 'Angle de suivi arriere' }, group: 'motion', mediums: ['video'] },
    { value: 'voyeur angle', labels: { en: 'Voyeur angle', fr: 'Angle d observation cachee' }, group: 'atmospheric', mediums: ['video'] },
    { value: 'three-quarter angle', labels: { en: 'Three-quarter angle', fr: 'Angle trois quarts' }, group: 'core', mediums: ['video'] },
    { value: 'frontal angle', labels: { en: 'Frontal angle', fr: 'Angle frontal' }, group: 'core', mediums: ['video'] },
    { value: 'side angle', labels: { en: 'Side angle', fr: 'Angle lateral' }, group: 'core', mediums: ['video'] },
    { value: 'intimate shoulder-level angle', labels: { en: 'Intimate shoulder-level angle', fr: 'Angle intime a hauteur d epaule' }, group: 'narrative', mediums: ['video'] },
    { value: 'distant surveillance angle', labels: { en: 'Distant surveillance angle', fr: 'Angle de surveillance lointaine' }, group: 'atmospheric', mediums: ['video'] },
    { value: 'heroic low angle', labels: { en: 'Heroic low angle', fr: 'Contre-plongee heroique' }, group: 'cinematic', mediums: ['video'] },
    { value: 'fragile high angle', labels: { en: 'Fragile high angle', fr: 'Plongee fragile' }, group: 'narrative', mediums: ['video'] },
    { value: 'hidden observer angle', labels: { en: 'Hidden observer angle', fr: 'Angle d observateur cache' }, group: 'atmospheric', mediums: ['video'] },
    { value: 'wide environmental angle', labels: { en: 'Wide environmental angle', fr: 'Angle large environnemental' }, group: 'cinematic', mediums: ['video'] },
    { value: 'compressed telephoto angle', labels: { en: 'Compressed telephoto angle', fr: 'Angle compresse au teleobjectif' }, group: 'narrative', mediums: ['video'] },
  ],
  movement: [
    { value: 'slow push-in', labels: { en: 'Slow push-in', fr: 'Lent travelling avant' }, group: 'motion', mediums: ['video'] },
    { value: 'gentle pull-back', labels: { en: 'Gentle pull-back', fr: 'Lent travelling arriere' }, group: 'motion', mediums: ['video'] },
    { value: 'locked-off camera', labels: { en: 'Locked-off camera', fr: 'Camera fixe' }, group: 'core', mediums: ['video'] },
    { value: 'side tracking movement', labels: { en: 'Side tracking movement', fr: 'Travelling lateral' }, group: 'motion', mediums: ['video'] },
    { value: 'slow orbit', labels: { en: 'Slow orbit', fr: 'Orbite lente' }, group: 'motion', mediums: ['video'] },
    { value: 'handheld drift', labels: { en: 'Handheld drift', fr: 'Derive camera a l epaule' }, group: 'motion', mediums: ['video'] },
    { value: 'crane up', labels: { en: 'Crane up', fr: 'Mouvement de grue vers le haut' }, group: 'cinematic', mediums: ['video'] },
    { value: 'crane down', labels: { en: 'Crane down', fr: 'Mouvement de grue vers le bas' }, group: 'cinematic', mediums: ['video'] },
    { value: 'whip pan', labels: { en: 'Whip pan', fr: 'Panoramique fouette' }, group: 'motion', mediums: ['video'] },
    { value: 'subtle camera sway', labels: { en: 'Subtle camera sway', fr: 'Balancement subtil de camera' }, group: 'motion', mediums: ['video'] },
    { value: 'forward tracking run', labels: { en: 'Forward tracking run', fr: 'Suivi avant en course' }, group: 'motion', mediums: ['video'] },
    { value: 'descending push-in', labels: { en: 'Descending push-in', fr: 'Approche descendante' }, group: 'cinematic', mediums: ['video'] },
    { value: 'rising reveal', labels: { en: 'Rising reveal', fr: 'Revelation en elevation' }, group: 'cinematic', mediums: ['video'] },
    { value: 'circular tracking move', labels: { en: 'Circular tracking move', fr: 'Travelling circulaire' }, group: 'motion', mediums: ['video'] },
    { value: 'slow lateral dolly', labels: { en: 'Slow lateral dolly', fr: 'Lent travelling lateral' }, group: 'motion', mediums: ['video'] },
    { value: 'hesitant handheld step', labels: { en: 'Hesitant handheld step', fr: 'Pas hesitant a l epaule' }, group: 'narrative', mediums: ['video'] },
    { value: 'floating glide', labels: { en: 'Floating glide', fr: 'Glisse flottante' }, group: 'cinematic', mediums: ['video'] },
    { value: 'snap reframing', labels: { en: 'Snap reframing', fr: 'Recadrage sec' }, group: 'motion', mediums: ['video'] },
    { value: 'drifting follow shot', labels: { en: 'Drifting follow shot', fr: 'Plan de suivi flottant' }, group: 'motion', mediums: ['video'] },
    { value: 'static hold before movement', labels: { en: 'Static hold before movement', fr: 'Pause fixe avant mouvement' }, group: 'narrative', mediums: ['video'] },
  ],
  lensFeel: [
    { value: '35mm cinematic lens', labels: { en: '35mm cinematic lens', fr: 'Optique cinematographique 35mm' }, group: 'cinematic', mediums: ['video'] },
    { value: '50mm natural lens', labels: { en: '50mm natural lens', fr: 'Optique naturelle 50mm' }, group: 'core', mediums: ['video'] },
    { value: 'wide anamorphic lens', labels: { en: 'Wide anamorphic lens', fr: 'Optique anamorphique large' }, group: 'cinematic', mediums: ['video'] },
    { value: 'telephoto compression', labels: { en: 'Telephoto compression', fr: 'Compression teleobjectif' }, group: 'narrative', mediums: ['video'] },
    { value: 'macro lens intimacy', labels: { en: 'Macro lens intimacy', fr: 'Intimite macro' }, group: 'narrative', mediums: ['video'] },
    { value: 'portrait lens softness', labels: { en: 'Portrait lens softness', fr: 'Douceur d optique portrait' }, group: 'core', mediums: ['video'] },
    { value: 'vintage anamorphic bloom', labels: { en: 'Vintage anamorphic bloom', fr: 'Halo anamorphique vintage' }, group: 'cinematic', mediums: ['video'] },
    { value: 'wide documentary lens', labels: { en: 'Wide documentary lens', fr: 'Optique documentaire large' }, group: 'core', mediums: ['video'] },
    { value: 'dreamy soft-focus lens', labels: { en: 'Dreamy soft-focus lens', fr: 'Optique a flou doux onirique' }, group: 'atmospheric', mediums: ['video'] },
    { value: 'surveillance zoom', labels: { en: 'Surveillance zoom', fr: 'Zoom de surveillance' }, group: 'atmospheric', mediums: ['video'] },
    { value: 'crisp digital sharpness', labels: { en: 'Crisp digital sharpness', fr: 'Nettete numerique franche' }, group: 'core', mediums: ['video'] },
    { value: 'grainy analog softness', labels: { en: 'Grainy analog softness', fr: 'Douceur argentique granuleuse' }, group: 'narrative', mediums: ['video'] },
    { value: 'shallow portrait compression', labels: { en: 'Shallow portrait compression', fr: 'Compression douce de portrait' }, group: 'core', mediums: ['video'] },
    { value: 'expansive wide-angle distortion', labels: { en: 'Expansive wide-angle distortion', fr: 'Distorsion ample au grand-angle' }, group: 'cinematic', mediums: ['video'] },
    { value: 'tactile handheld realism', labels: { en: 'Tactile handheld realism', fr: 'Realisme tactile a l epaule' }, group: 'motion', mediums: ['video'] },
    { value: 'elegant cinema prime lens', labels: { en: 'Elegant cinema prime lens', fr: 'Optique cinema fixe elegante' }, group: 'cinematic', mediums: ['video'] },
    { value: 'nostalgic film bloom', labels: { en: 'Nostalgic film bloom', fr: 'Halo nostalgique de pellicule' }, group: 'narrative', mediums: ['video'] },
    { value: 'detached long-lens observation', labels: { en: 'Detached long-lens observation', fr: 'Observation distante au long objectif' }, group: 'atmospheric', mediums: ['video'] },
    { value: 'immersive close-focus lens', labels: { en: 'Immersive close-focus lens', fr: 'Optique immersive a mise au point rapprochee' }, group: 'motion', mediums: ['video'] },
    { value: 'studio-clean commercial lens', labels: { en: 'Studio-clean commercial lens', fr: 'Optique publicitaire tres propre' }, group: 'core', mediums: ['video'] },
  ],
} satisfies Record<GuidedVocabularyKey, GuidedOption[]>

const guidedGroupFallbackByKey: Record<GuidedVocabularyKey, GuidedGroup> = {
  subjectType: 'core',
  era: 'narrative',
  season: 'atmospheric',
  weather: 'atmospheric',
  timeOfDay: 'atmospheric',
  mood: 'atmospheric',
  style: 'cinematic',
  lighting: 'cinematic',
  composition: 'cinematic',
  scenePosition: 'core',
  spatialRelation: 'narrative',
  captureDevice: 'core',
  subjectMotion: 'motion',
  environmentMotion: 'motion',
  shotType: 'cinematic',
  angle: 'cinematic',
  movement: 'motion',
  lensFeel: 'cinematic',
}

export const featuredGuidedValues = {
  subjectType: ['portrait', 'traveler', 'warrior', 'creature', 'oracle', 'sailor'],
  era: ['present day', 'medieval era', 'near future', 'post-apocalyptic era', 'mythic timeless era', 'victorian era'],
  season: ['spring', 'autumn', 'winter', 'monsoon season', 'harvest season', 'early spring'],
  weather: ['clear sky', 'soft rain', 'fog', 'storm', 'snowfall', 'overcast sky'],
  timeOfDay: ['golden hour', 'blue hour', 'dawn', 'night', 'sunset', 'early morning'],
  mood: ['serene', 'melancholic', 'mysterious', 'tense', 'dreamlike', 'hopeful'],
  style: ['cinematic concept art', 'editorial photography', 'anime key visual', 'dark fantasy matte painting', 'cyberpunk noir illustration', 'storybook illustration'],
  lighting: ['soft overcast light', 'moonlight', 'warm window glow', 'dramatic backlight', 'neon reflections', 'volumetric fog glow'],
  composition: ['close-up portrait', 'wide cinematic frame', 'symmetrical framing', 'rule of thirds', 'cathedral framing', 'layered foreground and background'],
  scenePosition: ['in the foreground center', 'center frame', 'in the foreground on the left', 'in the midground', 'in the background', 'small against the landscape'],
  spatialRelation: ['next to', 'in front of', 'behind', 'facing', 'to the left of', 'to the right of'],
  captureDevice: ['35mm analog camera', 'digital cinema camera', 'medium format film camera', 'vhs camcorder', 'documentary handheld camera', 'shot on iphone'],
  subjectMotion: ['walking slowly', 'standing still', 'turning toward the light', 'running through the frame'],
  environmentMotion: ['fog slowly rolling', 'rain drifting through light', 'fabric moving in the wind', 'embers floating in the air'],
  shotType: ['close-up shot', 'medium shot', 'wide shot', 'single-shot tracking frame', 'establishing shot', 'point-of-view shot'],
  angle: ['eye-level angle', 'low angle', 'high angle', 'over-the-shoulder angle', 'ground-level angle', 'top-down angle'],
  movement: ['locked-off camera', 'slow push-in', 'gentle pull-back', 'side tracking movement', 'slow orbit', 'floating glide'],
  lensFeel: ['50mm natural lens', '35mm cinematic lens', 'wide anamorphic lens', 'telephoto compression', 'dreamy soft-focus lens', 'vintage anamorphic bloom'],
} satisfies Partial<Record<GuidedVocabularyKey, string[]>>

export type GuidedTone = 'cinematic' | 'illustration' | 'photography' | 'video'

const toneFeaturedGuidedValues: Partial<
  Record<GuidedVocabularyKey, Partial<Record<GuidedTone, string[]>>>
> = {
  style: {
    cinematic: ['cinematic concept art', 'cinematic noir', 'cyberpunk noir illustration', 'dark fantasy matte painting'],
    illustration: ['storybook illustration', 'oil painting', 'watercolor illustration', 'sacred icon painting'],
    photography: ['editorial photography', 'photojournalism', 'documentary realism'],
    video: ['single-take film still', 'cinematic video concept frame', 'poetic slow cinema', 'gritty urban thriller', 'intimate character drama', 'dreamlike fantasy cinema'],
  },
  lighting: {
    cinematic: ['dramatic backlight', 'neon reflections', 'moonlight'],
    illustration: ['lantern glow', 'candlelight', 'stained glass light'],
    photography: ['soft skylight', 'soft overcast light', 'rim light'],
    video: ['neon reflections', 'dramatic backlight', 'flickering neon light', 'moonlight', 'volumetric fog glow', 'silhouette backlight'],
  },
  composition: {
    cinematic: ['wide cinematic frame', 'low angle', 'off-center tension'],
    illustration: ['cathedral framing', 'layered foreground and background', 'framed through a doorway', 'silhouette composition'],
    photography: ['rule of thirds', 'close-up portrait', 'shallow depth of field'],
    video: ['wide cinematic frame', 'over-the-shoulder framing', 'intimate close crop'],
  },
  captureDevice: {
    cinematic: ['35mm analog camera', 'digital cinema camera', '16mm film camera'],
    illustration: ['35mm analog camera', 'instant film camera', 'polaroid camera'],
    photography: ['medium format film camera', 'mirrorless photo camera', 'studio digital medium format'],
    video: ['digital cinema camera', 'documentary handheld camera', 'body-mounted camera'],
  },
  timeOfDay: {
    cinematic: ['blue hour', 'sunset', 'golden hour'],
    illustration: ['dawn', 'twilight', 'first light'],
    photography: ['golden hour', 'early morning', 'late afternoon'],
    video: ['night', 'blue hour', 'sleepless city night'],
  },
  shotType: {
    video: ['single-shot tracking frame', 'medium shot', 'establishing shot', 'moving master shot', 'intimate handheld close-up', 'point-of-view shot'],
  },
  movement: {
    video: ['slow push-in', 'floating glide', 'side tracking movement', 'locked-off camera', 'handheld drift', 'slow orbit'],
  },
  lensFeel: {
    cinematic: ['35mm cinematic lens', 'wide anamorphic lens', 'vintage anamorphic bloom'],
    illustration: ['dreamy soft-focus lens', 'portrait lens softness', 'macro lens intimacy'],
    photography: ['50mm natural lens', 'telephoto compression', 'portrait lens softness'],
    video: ['35mm cinematic lens', 'wide anamorphic lens', 'tactile handheld realism', 'vintage anamorphic bloom', 'surveillance zoom', 'wide documentary lens'],
  },
}

const includesValue = (value: string | undefined, terms: string[]) => {
  const normalized = value?.toLowerCase().trim()
  return normalized ? terms.some((term) => normalized.includes(term)) : false
}

const getContextualVideoStyleFeaturedValues = (project?: PromptProject) => {
  if (!project || project.medium !== 'video') return []

  const featured: string[] = []
  const pushUnique = (...values: string[]) => {
    for (const value of values) {
      if (!featured.includes(value)) {
        featured.push(value)
      }
    }
  }

  if (
    includesValue(project.mood, ['tense', 'oppressive', 'feral']) ||
    includesValue(project.environment.weather, ['rain', 'storm', 'thunder']) ||
    includesValue(project.environment.timeOfDay, ['night', 'blue hour', 'midnight'])
  ) {
    pushUnique(
      'gritty urban thriller',
      'neon noir film language',
      'surveillance thriller aesthetic',
      'found footage tension',
      'moody sci-fi cinema',
      'cinematic noir',
    )
  }

  if (
    includesValue(project.mood, ['dreamlike', 'haunted', 'mysterious']) ||
    includesValue(project.environment.weather, ['fog', 'mist', 'haze']) ||
    includesValue(project.style, ['fantasy', 'mythic'])
  ) {
    pushUnique(
      'dreamlike fantasy cinema',
      'poetic slow cinema',
      'meditative one-shot cinema',
      'painterly moving tableau',
      'elevated horror atmosphere',
    )
  }

  if (
    includesValue(project.mood, ['sacred', 'awe-struck', 'solemn']) ||
    includesValue(project.environment.era, ['ancient', 'medieval', 'mythic'])
  ) {
    pushUnique(
      'ritualistic sacred cinema',
      'mythic epic cinema',
      'painterly moving tableau',
      'arthouse festival film',
    )
  }

  if (
    includesValue(project.mood, ['intimate', 'nostalgic', 'tender', 'melancholic', 'contemplative'])
  ) {
    pushUnique(
      'intimate character drama',
      'melancholic road movie',
      'retro 16mm mood',
      'arthouse festival film',
      'poetic slow cinema',
    )
  }

  if (
    includesValue(project.camera?.captureDevice, [
      'documentary',
      'body-mounted',
      'action camera',
      'security',
      'vhs',
      'surveillance',
    ])
  ) {
    pushUnique(
      'raw documentary cinema',
      'found footage tension',
      'surveillance thriller aesthetic',
    )
  }

  if (
    includesValue(project.camera?.shotType, ['single-shot', 'tracking', 'long tracking']) ||
    includesValue(project.camera?.movement, ['slow push-in', 'slow orbit', 'floating glide', 'locked-off'])
  ) {
    pushUnique(
      'single-take film still',
      'meditative one-shot cinema',
      'poetic slow cinema',
      'cinematic video concept frame',
    )
  }

  return featured.slice(0, 8)
}

const getContextualVideoLightingFeaturedValues = (project?: PromptProject) => {
  if (!project || project.medium !== 'video') return []

  const featured: string[] = []
  const pushUnique = (...values: string[]) => {
    for (const value of values) {
      if (!featured.includes(value)) {
        featured.push(value)
      }
    }
  }

  if (
    includesValue(project.environment.timeOfDay, ['night', 'blue hour', 'midnight']) ||
    includesValue(project.environment.weather, ['rain', 'storm'])
  ) {
    pushUnique(
      'neon reflections',
      'flickering neon light',
      'sodium streetlight',
      'silhouette backlight',
      'dramatic backlight',
    )
  }

  if (
    includesValue(project.environment.weather, ['fog', 'mist', 'haze']) ||
    includesValue(project.mood, ['mysterious', 'dreamlike', 'haunted'])
  ) {
    pushUnique(
      'volumetric fog glow',
      'moonlight',
      'bioluminescent glow',
      'reflected water light',
    )
  }

  if (
    includesValue(project.mood, ['sacred', 'solemn', 'awe-struck']) ||
    includesValue(project.environment.era, ['ancient', 'medieval', 'mythic'])
  ) {
    pushUnique('candlelight', 'lantern glow', 'stained glass light', 'firelight')
  }

  if (
    includesValue(project.mood, ['serene', 'intimate', 'tender', 'hopeful']) ||
    includesValue(project.environment.timeOfDay, ['dawn', 'morning', 'golden hour'])
  ) {
    pushUnique('warm window glow', 'soft overcast light', 'soft skylight', 'dusty sun rays')
  }

  if (includesValue(project.camera?.captureDevice, ['security', 'surveillance', 'vhs', 'broadcast'])) {
    pushUnique('cold fluorescent light', 'flickering neon light', 'sodium streetlight')
  }

  return featured.slice(0, 8)
}

const getContextualVideoLensFeelFeaturedValues = (project?: PromptProject) => {
  if (!project || project.medium !== 'video') return []

  const featured: string[] = []
  const pushUnique = (...values: string[]) => {
    for (const value of values) {
      if (!featured.includes(value)) {
        featured.push(value)
      }
    }
  }

  if (
    includesValue(project.camera?.captureDevice, ['documentary', 'body-mounted', 'action camera']) ||
    includesValue(project.camera?.movement, ['handheld', 'tracking', 'forward tracking', 'snap reframing'])
  ) {
    pushUnique('tactile handheld realism', 'wide documentary lens', 'immersive close-focus lens')
  }

  if (
    includesValue(project.environment.timeOfDay, ['night', 'blue hour']) ||
    includesValue(project.mood, ['tense', 'oppressive'])
  ) {
    pushUnique('wide anamorphic lens', '35mm cinematic lens', 'vintage anamorphic bloom')
  }

  if (
    includesValue(project.mood, ['intimate', 'tender', 'nostalgic', 'melancholic']) ||
    includesValue(project.camera?.shotType, ['close-up', 'medium close-up'])
  ) {
    pushUnique('50mm natural lens', 'portrait lens softness', 'grainy analog softness')
  }

  if (
    includesValue(project.mood, ['dreamlike', 'mysterious', 'haunted']) ||
    includesValue(project.style, ['fantasy', 'poetic', 'dreamlike'])
  ) {
    pushUnique('dreamy soft-focus lens', 'vintage anamorphic bloom', 'macro lens intimacy')
  }

  if (includesValue(project.camera?.captureDevice, ['security', 'surveillance'])) {
    pushUnique('surveillance zoom', 'detached long-lens observation', 'crisp digital sharpness')
  }

  return featured.slice(0, 8)
}

const getContextualVideoShotTypeFeaturedValues = (project?: PromptProject) => {
  if (!project || project.medium !== 'video') return []

  const featured: string[] = []
  const pushUnique = (...values: string[]) => {
    for (const value of values) {
      if (!featured.includes(value)) {
        featured.push(value)
      }
    }
  }

  if (
    includesValue(project.mood, ['tense', 'oppressive', 'feral']) ||
    includesValue(project.camera?.movement, ['tracking', 'forward tracking', 'whip pan', 'snap reframing'])
  ) {
    pushUnique(
      'single-shot tracking frame',
      'rear-follow shot',
      'corridor chase frame',
      'moving master shot',
      'point-of-view shot',
    )
  }

  if (
    includesValue(project.mood, ['intimate', 'tender', 'nostalgic']) ||
    includesValue(project.camera?.movement, ['handheld drift', 'gentle pull-back'])
  ) {
    pushUnique(
      'intimate handheld close-up',
      'medium close-up',
      'close-up shot',
      'over-the-shoulder shot',
    )
  }

  if (
    includesValue(project.mood, ['contemplative', 'serene', 'dreamlike']) ||
    includesValue(project.style, ['poetic', 'arthouse', 'meditative'])
  ) {
    pushUnique(
      'static tableau shot',
      'wide shot',
      'establishing shot',
      'distant observer shot',
    )
  }

  if (
    includesValue(project.subject.type, ['portrait']) ||
    includesValue(project.camera?.shotType, ['close-up', 'medium close-up'])
  ) {
    pushUnique('close-up shot', 'medium close-up', 'profile shot')
  }

  return featured.slice(0, 8)
}

const getContextualVideoMovementFeaturedValues = (project?: PromptProject) => {
  if (!project || project.medium !== 'video') return []

  const featured: string[] = []
  const pushUnique = (...values: string[]) => {
    for (const value of values) {
      if (!featured.includes(value)) {
        featured.push(value)
      }
    }
  }

  if (
    includesValue(project.mood, ['tense', 'oppressive', 'feral']) ||
    includesValue(project.motion?.subjectMotion, ['running', 'turning'])
  ) {
    pushUnique(
      'forward tracking run',
      'handheld drift',
      'snap reframing',
      'side tracking movement',
      'whip pan',
    )
  }

  if (
    includesValue(project.mood, ['intimate', 'tender', 'nostalgic']) ||
    includesValue(project.camera?.shotType, ['medium close-up', 'close-up'])
  ) {
    pushUnique(
      'gentle pull-back',
      'subtle camera sway',
      'hesitant handheld step',
      'slow push-in',
    )
  }

  if (
    includesValue(project.mood, ['contemplative', 'serene', 'dreamlike']) ||
    includesValue(project.style, ['poetic', 'arthouse', 'meditative'])
  ) {
    pushUnique(
      'locked-off camera',
      'floating glide',
      'slow orbit',
      'static hold before movement',
    )
  }

  if (
    includesValue(project.motion?.subjectMotion, ['walking slowly']) ||
    includesValue(project.motion?.environmentMotion, ['fog slowly rolling'])
  ) {
    pushUnique('slow push-in', 'slow lateral dolly', 'floating glide')
  }

  return featured.slice(0, 8)
}

export const inferGuidedTone = (
  project?: PromptProject,
  medium?: PromptMedium,
): GuidedTone => {
  const resolvedMedium = project?.medium ?? medium
  if (resolvedMedium === 'video') return 'video'

  const style = project?.style?.toLowerCase() ?? ''
  const captureDevice = project?.camera?.captureDevice?.toLowerCase() ?? ''
  const mood = project?.mood?.toLowerCase() ?? ''
  const era = project?.environment.era?.toLowerCase() ?? ''
  const scores: Record<Exclude<GuidedTone, 'video'>, number> = {
    cinematic: 0,
    illustration: 0,
    photography: 0,
  }

  if (includesValue(style, ['editorial photography', 'photojournalism', 'documentary realism'])) {
    scores.photography += 5
  }

  if (
    includesValue(style, [
      'illustration',
      'anime',
      'painting',
      'painterly',
      'watercolor',
      'ink',
      'charcoal',
      'poster',
      'collage',
      'storybook',
    ])
  ) {
    scores.illustration += 5
  }

  if (
    includesValue(style, [
      'cinematic',
      'noir',
      'dark fantasy',
      'concept art',
      'film still',
      'video concept frame',
    ])
  ) {
    scores.cinematic += 5
  }

  if (
    includesValue(captureDevice, ['35mm', 'medium format', 'mirrorless', 'iphone', 'polaroid'])
  ) {
    scores.photography += 3
  }

  if (includesValue(captureDevice, ['cinema', '16mm', 'vhs', 'broadcast'])) {
    scores.cinematic += 2
  }

  if (includesValue(mood, ['tense', 'oppressive', 'triumphant', 'euphoric', 'feral'])) {
    scores.cinematic += 2
  }

  if (includesValue(mood, ['dreamlike', 'sacred', 'haunted', 'awe-struck', 'mysterious'])) {
    scores.illustration += 2
  }

  if (includesValue(mood, ['intimate', 'contemplative', 'nostalgic', 'tender', 'serene'])) {
    scores.photography += 2
  }

  if (
    includesValue(era, ['ancient', 'medieval', 'renaissance', 'baroque', 'mythic'])
  ) {
    scores.illustration += 3
  }

  if (
    includesValue(era, [
      'near future',
      'far future',
      'retro-futuristic',
      'post-apocalyptic',
      'alternate history',
      'industrial',
    ])
  ) {
    scores.cinematic += 3
  }

  if (
    includesValue(era, ['victorian', 'belle epoque', 'early 20th century', 'post-war', '1970s', '1990s', 'present day'])
  ) {
    scores.photography += 2
  }

  const ranked = Object.entries(scores).sort((left, right) => {
    const scoreDelta = right[1] - left[1]
    if (scoreDelta !== 0) return scoreDelta
    const fallbackOrder: Record<Exclude<GuidedTone, 'video'>, number> = {
      cinematic: 0,
      illustration: 1,
      photography: 2,
    }
    return fallbackOrder[left[0] as Exclude<GuidedTone, 'video'>] - fallbackOrder[right[0] as Exclude<GuidedTone, 'video'>]
  })

  return ranked[0]?.[0] as GuidedTone ?? 'cinematic'
}

export const getFeaturedValuesForKey = (
  key: GuidedVocabularyKey,
  project?: PromptProject,
  medium?: PromptMedium,
) => {
  const tone = inferGuidedTone(project, medium)
  return [
    ...(key === 'style' ? getContextualVideoStyleFeaturedValues(project) : []),
    ...(key === 'lighting' ? getContextualVideoLightingFeaturedValues(project) : []),
    ...(key === 'shotType' ? getContextualVideoShotTypeFeaturedValues(project) : []),
    ...(key === 'movement' ? getContextualVideoMovementFeaturedValues(project) : []),
    ...(key === 'lensFeel' ? getContextualVideoLensFeelFeaturedValues(project) : []),
    ...(toneFeaturedGuidedValues[key]?.[tone] ?? []),
    ...(featuredGuidedValues[key] ?? []),
  ].filter((value, index, values) => values.indexOf(value) === index)
}

const sortLocalizedGuidedOptions = (
  options: GuidedOption[],
  featuredValues: string[],
) =>
  [...options].sort((left, right) => {
    const leftIndex = featuredValues.indexOf(left.value)
    const rightIndex = featuredValues.indexOf(right.value)
    const leftFeatured = leftIndex !== -1
    const rightFeatured = rightIndex !== -1
    const featuredDelta = Number(rightFeatured) - Number(leftFeatured)
    if (featuredDelta !== 0) return featuredDelta
    if (leftFeatured && rightFeatured) return leftIndex - rightIndex
    return 0
  })

const normalizeGuidedValue = (value: string) => value.trim().toLowerCase()

const tokenizeGuidedValue = (value: string) =>
  normalizeGuidedValue(value)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 4)

const mergeMediumScopes = (
  existing?: PromptMedium[],
  incoming?: PromptMedium[],
) => {
  if (!existing && !incoming) return undefined
  if (!existing) return incoming
  if (!incoming) return existing

  return [...new Set([...existing, ...incoming])]
}

const getMergedGuidedOptions = (
  key: GuidedVocabularyKey,
  customOptions: CustomGuidedOption[],
) => {
  const options = new Map<string, GuidedOption>()

  for (const option of guidedVocabulary[key]) {
    options.set(normalizeGuidedValue(option.value), option)
  }

  for (const option of customOptions.filter((entry) => entry.key === key)) {
    const normalizedValue = normalizeGuidedValue(option.value)
    const existing = options.get(normalizedValue)

    options.set(normalizedValue, {
      value: option.value,
      labels: existing
        ? {
            ...existing.labels,
            ...option.labels,
          }
        : option.labels,
      group: existing?.group ?? option.group,
      mediums: mergeMediumScopes(existing?.mediums, option.mediums),
    })
  }

  return Array.from(options.values())
}

const isPersonalGuidedValue = (
  key: GuidedVocabularyKey,
  value: string,
  customOptions: CustomGuidedOption[],
) =>
  customOptions.some(
    (option) =>
      option.key === key && normalizeGuidedValue(option.value) === normalizeGuidedValue(value),
  )

export const customGuidedOptionUsesMediumScope = (key: GuidedVocabularyKey) =>
  guidedVocabulary[key].some((option) => 'mediums' in option && Boolean(option.mediums?.length))

export const suggestCustomGuidedGroup = (
  key: GuidedVocabularyKey,
  value: string,
): GuidedGroup => {
  const normalizedValue = normalizeGuidedValue(value)
  const valueTokens = tokenizeGuidedValue(value)
  const options = guidedVocabulary[key]

  const exactMatch = options.find(
    (option) =>
      normalizeGuidedValue(option.value) === normalizedValue ||
      Object.values(option.labels).some((label) => normalizeGuidedValue(label) === normalizedValue),
  )

  if (exactMatch) {
    return exactMatch.group
  }

  const scoredGroups = new Map<GuidedGroup, number>()

  for (const option of options) {
    const optionTokens = new Set([
      ...tokenizeGuidedValue(option.value),
      ...Object.values(option.labels).flatMap((label) => tokenizeGuidedValue(label)),
    ])
    const overlap = valueTokens.filter((token) => optionTokens.has(token)).length

    if (overlap > 0) {
      scoredGroups.set(option.group, (scoredGroups.get(option.group) ?? 0) + overlap)
    }
  }

  const bestGroup = [...scoredGroups.entries()].sort((left, right) => right[1] - left[1])[0]?.[0]

  return bestGroup ?? guidedGroupFallbackByKey[key]
}

export const getPrioritizedGuidedOptions = (
  key: GuidedVocabularyKey,
  project?: PromptProject,
  medium?: PromptMedium,
  customOptions: CustomGuidedOption[] = [],
) => {
  const featuredValues = getFeaturedValuesForKey(key, project, medium)

  return sortLocalizedGuidedOptions(
    rankGuidedOptionsForProject(
      getMergedGuidedOptions(key, customOptions).filter((option) => matchesMedium(option, medium)),
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
    ),
    featuredValues,
  )
}

export const getLocalizedGuidedOptions = (
  key: GuidedVocabularyKey,
  locale: AppLocale,
  medium?: PromptMedium,
  project?: PromptProject,
  customOptions: CustomGuidedOption[] = [],
): LocalizedGuidedOption[] =>
  ((featuredValues) =>
    getPrioritizedGuidedOptions(key, project, medium, customOptions)
    .map((option) => ({
      value: option.value,
      label: option.labels[locale],
      group: option.group,
      featured: featuredValues.includes(option.value),
      personal: isPersonalGuidedValue(key, option.value, customOptions),
    })))(getFeaturedValuesForKey(key, project, medium))
