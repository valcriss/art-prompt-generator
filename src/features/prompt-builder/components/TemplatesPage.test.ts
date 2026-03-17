import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { __resetPromptStudioForTests } from '../../../composables/usePromptStudio'
import { i18n } from '../../../i18n'
import { router } from '../../../router'
import TemplatesPage from './TemplatesPage.vue'

describe('TemplatesPage', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    __resetPromptStudioForTests()
    await router.push('/')
  })

  it('renders the template editor', async () => {
    await router.push('/studio/templates')
    await router.isReady()

    const wrapper = mount(TemplatesPage, {
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

    expect(wrapper.text()).toContain('Mini builder')
    expect(wrapper.text()).toContain('Prompt before')
  })
})
