import type { PromptProject } from '../types/models'

export interface PromptProjectRepository {
  list(): Promise<PromptProject[]>
  save(project: PromptProject): Promise<PromptProject>
  delete(id: string): Promise<void>
}
