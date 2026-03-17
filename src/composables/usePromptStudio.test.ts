import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '../i18n'

vi.mock('../utils/download', () => ({
  downloadFile: vi.fn(),
}))

import { __resetPromptStudioForTests, usePromptStudio } from './usePromptStudio'
import { downloadFile } from '../utils/download'

const TestHost = defineComponent({
  setup() {
    return usePromptStudio()
  },
  template: '<div />',
})

describe('usePromptStudio', () => {
  beforeEach(() => {
    window.localStorage.clear()
    __resetPromptStudioForTests()
    vi.clearAllMocks()
  })

  it('keeps the generated positive prompt current for saving and exporting', async () => {
    const wrapper = mount(TestHost, {
      global: {
        plugins: [i18n],
      },
    })

    await flushPromises()

    const studio = wrapper.vm as unknown as ReturnType<typeof usePromptStudio>
    studio.currentProject.subject.description = 'old wounded samurai'
    studio.currentProject.environment.location = 'snowy bamboo forest'
    studio.currentProject.details = ['wind moving fabric']

    await nextTick()
    await flushPromises()

    expect(studio.currentPositivePrompt).toContain('old wounded samurai')
    expect(studio.currentPositivePrompt).toContain('snowy bamboo forest')

    await studio.saveProject()

    const savedProjects = JSON.parse(
      window.localStorage.getItem('art-prompt-generator.projects') ?? '[]',
    ) as Array<{ positivePrompt: string }>

    expect(savedProjects[0]?.positivePrompt).toContain('old wounded samurai')
    expect(savedProjects[0]?.positivePrompt).toContain('snowy bamboo forest')

    studio.exportJson()

    expect(downloadFile).toHaveBeenCalledTimes(1)

    const [, payload] = vi.mocked(downloadFile).mock.calls[0] ?? []
    const exportedProject = JSON.parse(String(payload)) as { positivePrompt: string }

    expect(exportedProject.positivePrompt).toContain('old wounded samurai')
    expect(exportedProject.positivePrompt).toContain('snowy bamboo forest')
  })

  it('persists custom guided vocabulary with localized label and english token', async () => {
    const wrapper = mount(TestHost, {
      global: {
        plugins: [i18n],
      },
    })

    await flushPromises()

    const studio = wrapper.vm as unknown as ReturnType<typeof usePromptStudio>

    await studio.addCustomGuidedOption({
      key: 'weather',
      label: 'Pluie acide',
      value: 'acid rain',
      locale: 'fr',
      medium: 'image',
    })

    expect(studio.customGuidedOptions).toHaveLength(1)
    expect(studio.customGuidedOptions[0]).toMatchObject({
      key: 'weather',
      value: 'acid rain',
      labels: {
        en: 'acid rain',
        fr: 'Pluie acide',
      },
    })

    const saved = JSON.parse(
      window.localStorage.getItem('art-prompt-generator.preferences.guided-vocabulary') ?? '[]',
    ) as Array<{ value: string; labels: { fr: string } }>

    expect(saved[0]).toMatchObject({
      value: 'acid rain',
      labels: {
        fr: 'Pluie acide',
      },
    })
  })

  it('updates an existing custom guided vocabulary entry', async () => {
    const wrapper = mount(TestHost, {
      global: {
        plugins: [i18n],
      },
    })

    await flushPromises()

    const studio = wrapper.vm as unknown as ReturnType<typeof usePromptStudio>

    await studio.addCustomGuidedOption({
      key: 'weather',
      label: 'Pluie acide',
      value: 'acid rain',
      locale: 'fr',
      medium: 'image',
    })

    const createdId = studio.customGuidedOptions[0]?.id
    expect(createdId).toBeTruthy()

    await studio.updateCustomGuidedOption({
      id: String(createdId),
      label: 'Pluie toxique',
      value: 'toxic rain',
      locale: 'fr',
      group: 'cinematic',
    })

    expect(studio.customGuidedOptions[0]).toMatchObject({
      value: 'toxic rain',
      group: 'cinematic',
      labels: {
        en: 'toxic rain',
        fr: 'Pluie toxique',
      },
    })
  })

  it('loads and persists studio workspace browsing preferences', async () => {
    window.localStorage.setItem(
      'art-prompt-generator.preferences.studio-workspace',
      JSON.stringify({
        historySearch: 'forest',
        historyMediumFilter: 'image',
        historySort: 'title',
        librarySearch: 'temple',
        libraryFilter: 'location',
        librarySort: 'name',
        templateSearch: 'anime',
        templateFilter: 'video',
        subjectLibrarySearch: 'portrait',
      }),
    )

    const wrapper = mount(TestHost, {
      global: {
        plugins: [i18n],
      },
    })

    await flushPromises()

    const studio = wrapper.vm as unknown as ReturnType<typeof usePromptStudio>

    expect(studio.historyFilter).toBe('forest')
    expect(studio.historyMediumFilter).toBe('image')
    expect(studio.historySort).toBe('title')
    expect(studio.librarySearch).toBe('temple')
    expect(studio.libraryFilter).toBe('location')
    expect(studio.librarySort).toBe('name')
    expect(studio.templateSearch).toBe('anime')
    expect(studio.templateFilter).toBe('video')
    expect(studio.subjectLibrarySearch).toBe('portrait')

    studio.historyFilter = 'storm'
    studio.historyMediumFilter = 'video'
    studio.historySort = 'medium'
    studio.librarySearch = 'samurai'
    studio.libraryFilter = 'character'
    studio.librarySort = 'type'
    studio.templateSearch = 'cinematic'
    studio.templateFilter = 'image'
    studio.subjectLibrarySearch = 'samurai'

    await nextTick()
    await flushPromises()

    expect(
      JSON.parse(
        window.localStorage.getItem('art-prompt-generator.preferences.studio-workspace') ?? '{}',
      ),
    ).toEqual({
      historySearch: 'storm',
      historyMediumFilter: 'video',
      historySort: 'medium',
      librarySearch: 'samurai',
      libraryFilter: 'character',
      librarySort: 'type',
      templateSearch: 'cinematic',
      templateFilter: 'image',
      subjectLibrarySearch: 'samurai',
    })
  })
})