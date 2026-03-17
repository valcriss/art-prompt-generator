import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { i18n } from '../../../i18n'
import { router } from '../../../router'
import { __resetPromptStudioForTests } from '../../../composables/usePromptStudio'
import BuilderPage from './BuilderPage.vue'

describe('StudioApp', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    __resetPromptStudioForTests()
    await router.push('/')
  })

  it('renders the hero title and quick resources', async () => {
    await router.push('/studio')
    await router.isReady()

    const wrapper = mount(BuilderPage, {
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

    expect(wrapper.text()).toContain('Current project')
    expect(wrapper.text()).toContain('Scene composition')
    expect(wrapper.find('[data-testid="builder-hero-stats"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="workspace-stage-project"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="workspace-stage-subject"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Project framing')
  })

  it('switches tools to reuse and filters quick resources', async () => {
    await router.push('/studio')
    await router.isReady()

    const wrapper = mount(BuilderPage, {
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

    await wrapper.get('[data-testid="workspace-tool-reuse"]').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Quick templates')
    expect(wrapper.text()).toContain('Quick library')

    const quickTemplateSearch = wrapper.get('input[placeholder="Search a template by name"]')
    await quickTemplateSearch.setValue('anime')
    await flushPromises()

    const templateCards = wrapper.findAll('[data-testid="quick-template-card"]')
    expect(templateCards).toHaveLength(1)
    expect(templateCards[0]?.text()).toContain('Anime Portrait')

    const locationFilter = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Locations'))

    expect(locationFilter).toBeDefined()
    await locationFilter!.trigger('click')
    await flushPromises()

    const libraryCards = wrapper.findAll('[data-testid="quick-library-card"]')
    expect(libraryCards).toHaveLength(1)
    expect(libraryCards[0]?.text()).toContain('Rainy Neon Alley')
  })

  it('navigates to the scene and composition stages', async () => {
    await router.push('/studio')
    await router.isReady()

    const wrapper = mount(BuilderPage, {
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
    await wrapper.get('[data-testid="workspace-stage-scene"]').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Pick the emotional current')

    await wrapper.get('[data-testid="workspace-stage-composition"]').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Frame the scene like an art director')
  })

  it('can pull a library character directly into the subjects stage', async () => {
    await router.push('/studio')
    await router.isReady()

    const wrapper = mount(BuilderPage, {
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
    await wrapper.get('[data-testid="workspace-stage-subject"]').trigger('click')
    await flushPromises()

    await wrapper.get('[data-testid="subject-library-open"]').trigger('click')
    await flushPromises()

    expect(wrapper.get('[data-testid="subject-library-dialog"]').text()).toContain(
      'Load a subject from your library',
    )

    await wrapper.get('[data-testid="subject-library-card"]').trigger('click')
    await flushPromises()

    const textareas = wrapper.findAll('textarea')
    expect((textareas[0]!.element as HTMLTextAreaElement).value).toContain('old wounded samurai')
    expect((textareas[1]!.element as HTMLTextAreaElement).value).toContain('worn samurai armor')
  })

  it('can add a secondary character from the library dialog', async () => {
    await router.push('/studio')
    await router.isReady()

    const wrapper = mount(BuilderPage, {
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
    await wrapper.get('[data-testid="workspace-stage-subject"]').trigger('click')
    await flushPromises()

    const addCharacterButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Add character'))

    expect(addCharacterButton).toBeDefined()
    await addCharacterButton!.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Character 1')
    expect(wrapper.text()).not.toContain('builder.characters.characterLabel')

    await wrapper.get('[data-testid="secondary-library-open-0"]').trigger('click')
    await flushPromises()

    expect(wrapper.get('[data-testid="subject-library-dialog"]').text()).toContain(
      'Add a secondary character from your library',
    )

    await wrapper.get('[data-testid="subject-library-card"]').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('old wounded samurai')
  })
})
