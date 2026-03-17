import { librarySeedElements } from '../domain/librarySeeds'
import type { LibraryElement } from '../types/models'
import type { LibraryElementRepository } from './LibraryElementRepository'
import { getStorage, type StorageLike } from './storage'

const STORAGE_KEY = 'art-prompt-generator.library'

const compact = (values: Array<string | undefined>) =>
  values.map((value) => value?.trim()).filter((value): value is string => Boolean(value))

type PersistedLibraryElement = Omit<LibraryElement, 'type'> & { type: string }

const normalizeLibraryElement = (element: PersistedLibraryElement): LibraryElement => {
  if (element.type !== 'atmosphere') {
    return element as LibraryElement
  }

  const legacyValues = element.structuredValues ?? {}
  const legacyDescription = compact([
    element.description,
    legacyValues.weather,
    legacyValues.airTexture,
    legacyValues.emotionalTone,
    legacyValues.intensity,
  ]).join(', ')

  return {
    ...element,
    type: 'composition',
    description: legacyDescription,
    structuredValues: {
      style: legacyValues.style ?? '',
      lighting: legacyValues.lighting ?? '',
      composition: legacyValues.composition ?? '',
      captureDevice: legacyValues.captureDevice ?? '',
    },
  } as LibraryElement
}

export class LocalLibraryElementRepository implements LibraryElementRepository {
  private readonly storage: StorageLike

  constructor(storage: StorageLike = getStorage()) {
    this.storage = storage
  }

  async list(): Promise<LibraryElement[]> {
    const raw = this.storage.getItem(STORAGE_KEY)

    if (!raw) {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(librarySeedElements))
      return librarySeedElements
    }

    const elements = (JSON.parse(raw) as PersistedLibraryElement[]).map((element) =>
      normalizeLibraryElement(element),
    )
    this.storage.setItem(STORAGE_KEY, JSON.stringify(elements))
    return elements
  }

  async save(element: LibraryElement): Promise<LibraryElement> {
    const elements = await this.list()
    const next = {
      ...element,
      updatedAt: new Date().toISOString(),
    }
    const withoutCurrent = elements.filter((entry) => entry.id !== element.id)
    this.storage.setItem(STORAGE_KEY, JSON.stringify([next, ...withoutCurrent]))
    return next
  }

  async delete(id: string): Promise<void> {
    const elements = await this.list()
    this.storage.setItem(
      STORAGE_KEY,
      JSON.stringify(elements.filter((element) => element.id !== id)),
    )
  }
}
