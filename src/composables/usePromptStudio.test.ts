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
})