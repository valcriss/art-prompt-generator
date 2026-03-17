export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

const memoryStorage = (): StorageLike => {
  const values = new Map<string, string>()

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  }
}

export const getStorage = (): StorageLike => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return memoryStorage()
  }

  return window.localStorage
}
