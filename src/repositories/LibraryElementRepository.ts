import type { LibraryElement } from '../types/models'

export interface LibraryElementRepository {
  list(): Promise<LibraryElement[]>
  save(element: LibraryElement): Promise<LibraryElement>
  delete(id: string): Promise<void>
}
