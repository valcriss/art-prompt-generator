import type { PromptTemplate } from '../types/models'

export interface PromptTemplateRepository {
  list(): Promise<PromptTemplate[]>
  save(template: PromptTemplate): Promise<PromptTemplate>
  delete(id: string): Promise<void>
}
