import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { __resetPromptStudioForTests } from '../../../composables/usePromptStudio'
import { i18n } from '../../../i18n'
import { router } from '../../../router'
import LibraryPage from './LibraryPage.vue'

describe('LibraryPage', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    __resetPromptStudioForTests()
    await router.push('/')
  })

  it('opens the inline confirmation panel when inserting an element', async () => {
    await router.push('/studio/library')
    await router.isReady()

    const wrapper = mount(LibraryPage, {
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
    await wrapper.get('[data-testid="library-use-button"]').trigger('click')
    await flushPromises()

    expect(wrapper.get('[data-testid="library-confirm-panel"]').text()).toContain(
      'Confirm insertion',
    )
  })
})
