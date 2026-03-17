import type { PromptProject } from '../types/models'
import type { PromptProjectRepository } from './PromptProjectRepository'
import { getStorage, type StorageLike } from './storage'

const STORAGE_KEY = 'art-prompt-generator.projects'

export class LocalPromptProjectRepository implements PromptProjectRepository {
  private readonly storage: StorageLike

  constructor(storage: StorageLike = getStorage()) {
    this.storage = storage
  }

  async list(): Promise<PromptProject[]> {
    const raw = this.storage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as PromptProject[]) : []

    return parsed.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
  }

  async save(project: PromptProject): Promise<PromptProject> {
    const projects = await this.list()
    const nextProject = {
      ...project,
      updatedAt: new Date().toISOString(),
    }
    const withoutCurrent = projects.filter((entry) => entry.id !== project.id)
    const nextProjects = [nextProject, ...withoutCurrent]

    this.storage.setItem(STORAGE_KEY, JSON.stringify(nextProjects))
    return nextProject
  }

  async delete(id: string): Promise<void> {
    const projects = await this.list()
    this.storage.setItem(
      STORAGE_KEY,
      JSON.stringify(projects.filter((project) => project.id !== id)),
    )
  }
}
