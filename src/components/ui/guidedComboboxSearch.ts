const synonymFamilies = [
  ['rain', 'pluie', 'drizzle', 'bruine', 'averse'],
  ['storm', 'tempete', 'orage', 'thunderstorm'],
  ['fog', 'brouillard', 'mist', 'brume', 'haze'],
  ['snow', 'neige', 'snowfall', 'blizzard'],
  ['forest', 'foret', 'woods', 'woodland'],
  ['ruin', 'ruins', 'ruine', 'ruines', 'crumbled', 'collapsed'],
  ['temple', 'shrine', 'sanctuary'],
  ['fantasy', 'fantastique', 'mythic', 'mythique'],
  ['cyberpunk', 'neon city', 'mega city', 'megacity', 'dystopian city'],
  ['religious', 'religieux', 'sacred', 'holy', 'liturgical'],
  ['maritime', 'ocean', 'sea', 'naval', 'port', 'harbor', 'coastal'],
  ['desert', 'desertique', 'dune', 'arid', 'sand sea'],
  ['urban night', 'nocturne urbaine', 'night city', 'city night', 'urban nocturne'],
  ['urban', 'urbain', 'city'],
  ['nocturne', 'night', 'nuit', 'nighttime'],
  ['samurai', 'ronin', 'warrior', 'guerrier'],
  ['neon', 'electric glow', 'city light', 'lueur electrique'],
  ['backlight', 'contre jour', 'contre-jour', 'rim light', 'silhouette'],
  ['moonlight', 'lunar glow', 'lumiere lunaire'],
  ['night', 'nuit', 'midnight', 'minuit', 'evening', 'soiree'],
  ['dawn', 'aube', 'sunrise', 'morning', 'matin'],
  ['sunset', 'coucher', 'dusk', 'crepuscule', 'twilight'],
  ['portrait', 'face', 'visage'],
  ['warrior', 'guerrier', 'fighter', 'combatant'],
  ['traveler', 'voyageur', 'wanderer'],
  ['cinematic', 'cinema', 'film', 'movie', 'cinematographique'],
  ['photo', 'photography', 'photographique', 'editorial', 'camera'],
  ['illustration', 'illustratif', 'painting', 'peinture', 'anime'],
  ['light', 'lighting', 'lumiere', 'glow', 'lueur'],
  ['wide', 'large', 'anamorphic', 'panoramic'],
  ['close', 'macro', 'rapproche', 'gros'],
]

const synonymMap = synonymFamilies.reduce<Record<string, string[]>>((accumulator, family) => {
  for (const term of family) {
    accumulator[term] = family
  }
  return accumulator
}, {})

export const normalizeSearchText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const singularizeTokenVariants = (token: string) => {
  const variants = new Set<string>([token])

  if (token.endsWith('ies') && token.length > 4) {
    variants.add(`${token.slice(0, -3)}y`)
    variants.add(token.slice(0, -1))
  }

  if (token.endsWith('es') && token.length > 4) {
    variants.add(token.slice(0, -2))
  }

  if (token.endsWith('s') && token.length > 3) {
    variants.add(token.slice(0, -1))
  }

  return Array.from(variants)
}

const expandToken = (token: string) => {
  const normalized = normalizeSearchText(token)
  if (!normalized) return []

  const expanded = new Set<string>(singularizeTokenVariants(normalized))
  for (const value of Array.from(expanded)) {
    for (const synonym of synonymMap[value] ?? []) {
      expanded.add(normalizeSearchText(synonym))
    }
  }

  return Array.from(expanded).filter(Boolean)
}

export const matchesComboboxQuery = (
  option: { label: string; value: string },
  query: string,
) => {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return true

  const haystack = normalizeSearchText(`${option.label} ${option.value}`)
  const queryTokens = normalizedQuery.split(' ').filter(Boolean)

  return queryTokens.every((token) =>
    expandToken(token).some((variant) => haystack.includes(variant)),
  )
}
