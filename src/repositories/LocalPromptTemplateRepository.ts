import { promptTemplates as seedTemplates } from '../domain/templates'
import type { PromptTemplate } from '../types/models'
import type { PromptTemplateRepository } from './PromptTemplateRepository'
import { getStorage, type StorageLike } from './storage'

const STORAGE_KEY = 'art-prompt-generator.templates'

export class LocalPromptTemplateRepository implements PromptTemplateRepository {
  private readonly storage: StorageLike

  constructor(storage: StorageLike = getStorage()) {
    this.storage = storage
  }

  async list(): Promise<PromptTemplate[]> {
    const raw = this.storage.getItem(STORAGE_KEY)

    if (!raw) {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(seedTemplates))
      return seedTemplates
    }

    return JSON.parse(raw) as PromptTemplate[]
  }

  async save(template: PromptTemplate): Promise<PromptTemplate> {
    const templates = await this.list()
    const withoutCurrent = templates.filter((entry) => entry.id !== template.id)
    const nextTemplates = [template, ...withoutCurrent]
    this.storage.setItem(STORAGE_KEY, JSON.stringify(nextTemplates))
    return template
  }

  async delete(id: string): Promise<void> {
    const templates = await this.list()
    this.storage.setItem(
      STORAGE_KEY,
      JSON.stringify(templates.filter((template) => template.id !== id)),
    )
  }
}
