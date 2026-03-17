import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import StudioSelect from './StudioSelect.vue'

describe('StudioSelect', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('opens the menu and emits the chosen option', async () => {
    const wrapper = mount(StudioSelect, {
      attachTo: document.body,
      props: {
        modelValue: '',
        placeholder: 'No explicit target',
        options: [
          { value: '__main__', label: 'Main subject', description: 'Foreground center' },
          { value: 'supporting-character', label: 'Lantern bearer', badge: 'Secondary' },
        ],
      },
      global: {
        stubs: {
          FontAwesomeIcon: {
            template: '<span />',
          },
        },
      },
    })

    await wrapper.get('[data-testid="studio-select-trigger"]').trigger('click')

    expect(document.body.textContent).toContain('Main subject')

    const options = document.body.querySelectorAll('[data-select-option="true"]')
    ;(options[1] as HTMLElement).dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['supporting-character'])
  })
})
