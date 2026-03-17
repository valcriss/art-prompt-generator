import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { __resetPromptStudioForTests } from '../../../composables/usePromptStudio'
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
})
