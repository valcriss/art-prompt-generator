import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { __resetPromptStudioForTests } from '../../../composables/usePromptStudio'
import { createEmptyPromptProject } from '../../../domain/promptFactory'
import { i18n } from '../../../i18n'
import { router } from '../../../router'
import HistoryPage from './HistoryPage.vue'

describe('HistoryPage', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    __resetPromptStudioForTests()
    await router.push('/')
  })

  it('shows an empty-state card when there is no saved project', async () => {
    await router.push('/studio/history')
    await router.isReady()

    const wrapper = mount(HistoryPage, {
      global: {
        plugins: [i18n, router],
        stubs: {
          FontAwesomeIcon: {
            template: '<span />',
          },
        },
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('No saved project yet')
  })

  it('redirects to the builder when opening a saved project', async () => {
    const pushSpy = vi.spyOn(router, 'push')

    const project = {
      ...createEmptyPromptProject('image'),
      id: 'project-1',
      title: 'Temple scene',
      updatedAt: '2026-03-17T10:00:00.000Z',
      createdAt: '2026-03-17T09:00:00.000Z',
      tags: ['temple'],
    }

    window.localStorage.setItem(
      'art-prompt-generator.projects',
      JSON.stringify([project]),
    )

    await router.push('/studio/history')
    await router.isReady()

    const wrapper = mount(HistoryPage, {
      global: {
        plugins: [i18n, router],
        stubs: {
          FontAwesomeIcon: {
            template: '<span />',
          },
        },
      },
    })

    await flushPromises()

    await wrapper.get('[data-testid="history-open-project"]').trigger('click')
    await flushPromises()

    expect(pushSpy).toHaveBeenCalledWith({ name: 'studio-builder' })

    pushSpy.mockRestore()
  })
})
