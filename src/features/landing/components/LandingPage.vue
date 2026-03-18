<script setup lang="ts">
import { onBeforeUnmount, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LocaleFlagButton from '../../../components/ui/LocaleFlagButton.vue'
import { usePromptStudio } from '../../../composables/usePromptStudio'

const studio = reactive(usePromptStudio())
const { t } = useI18n()

const highlights = [
  { icon: ['fas', 'wand-magic-sparkles'], titleKey: 'landing.features.guidedTitle', textKey: 'landing.features.guidedText' },
  { icon: ['fas', 'layer-group'], titleKey: 'landing.features.libraryTitle', textKey: 'landing.features.libraryText' },
  { icon: ['fas', 'film'], titleKey: 'landing.features.videoTitle', textKey: 'landing.features.videoText' },
]

const journey = [
  'landing.journey.idea',
  'landing.journey.scene',
  'landing.journey.prompt',
]

const benefits = [
  'landing.benefits.items.guidance',
  'landing.benefits.items.consistency',
  'landing.benefits.items.video',
]

const useCases = [
  'landing.useCases.items.conceptArt',
  'landing.useCases.items.characterDesign',
  'landing.useCases.items.storyboards',
  'landing.useCases.items.lookdev',
]

const keywordTopics = [
  'landing.keywordTopics.items.imagePrompts',
  'landing.keywordTopics.items.videoPrompts',
  'landing.keywordTopics.items.comfyui',
  'landing.keywordTopics.items.sceneBuilding',
  'landing.keywordTopics.items.promptLibrary',
  'landing.keywordTopics.items.creativeWorkflow',
]

const faqItems = [
  'landing.faq.items.what',
  'landing.faq.items.comfyui',
  'landing.faq.items.video',
  'landing.faq.items.save',
]

const journeyElement = ref<HTMLElement | null>(null)
const isJourneyHighlighted = ref(false)

let journeyHighlightTimeout: number | null = null

function focusJourney() {
  journeyElement.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  isJourneyHighlighted.value = true

  if (journeyHighlightTimeout !== null) {
    window.clearTimeout(journeyHighlightTimeout)
  }

  journeyHighlightTimeout = window.setTimeout(() => {
    isJourneyHighlighted.value = false
    journeyHighlightTimeout = null
  }, 1800)
}

onBeforeUnmount(() => {
  if (journeyHighlightTimeout !== null) {
    window.clearTimeout(journeyHighlightTimeout)
  }
})
</script>

<template>
  <main class="min-h-screen bg-mesh text-white">
    <div class="faint-grid min-h-screen">
      <div class="mx-auto flex min-h-screen w-full max-w-[1480px] flex-col px-4 py-4 md:px-6 md:py-6 lg:px-8">
        <header class="glass-panel rounded-[28px] px-4 py-4 md:px-5">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div class="min-w-0">
            <p class="text-xs uppercase tracking-[0.28em] text-glow">{{ t('app.eyebrow') }}</p>
            <p class="mt-1 text-sm text-slate-300">{{ t('landing.navTagline') }}</p>
            </div>
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div class="flex w-fit items-center gap-2 rounded-full border border-white/10 bg-slate-950/65 p-2 pr-2.5 backdrop-blur-xl">
                <LocaleFlagButton code="en" label="EN" :active="studio.locale === 'en'" @click="studio.setLocale('en')" />
                <LocaleFlagButton code="fr" label="FR" :active="studio.locale === 'fr'" @click="studio.setLocale('fr')" />
              </div>
              <div class="flex items-center gap-3">
                <RouterLink
                  to="/studio"
                  class="inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-white px-4 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
                >
                  {{ t('landing.enterStudio') }}
                </RouterLink>
                <a
                  href="https://github.com/valcriss/art-prompt-generator"
                  target="_blank"
                  rel="noreferrer"
                  class="inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-white/5 px-4 text-white transition hover:-translate-y-0.5 hover:bg-white/10"
                  :aria-label="t('app.githubRepository')"
                >
                  <svg
                    viewBox="0 0 98 96"
                    class="h-6 w-auto"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M49 0C21.9 0 0 22.4 0 50c0 22.1 14.3 40.9 34.1 47.5 2.5.5 3.4-1.1 3.4-2.4 0-1.2-.1-5.3-.1-9.6-13.9 3.1-16.8-6-16.8-6-2.3-5.9-5.6-7.4-5.6-7.4-4.6-3.2.3-3.1.3-3.1 5.1.4 7.8 5.3 7.8 5.3 4.5 7.8 11.9 5.6 14.8 4.3.5-3.3 1.8-5.6 3.2-6.9-11.1-1.3-22.8-5.7-22.8-25.2 0-5.6 2-10.2 5.2-13.8-.5-1.3-2.2-6.5.5-13.5 0 0 4.2-1.4 13.9 5.3 4-1.1 8.3-1.7 12.6-1.7s8.6.6 12.6 1.7c9.6-6.7 13.9-5.3 13.9-5.3 2.7 7 1 12.2.5 13.5 3.2 3.6 5.2 8.2 5.2 13.8 0 19.6-11.7 23.9-22.9 25.2 1.8 1.6 3.4 4.6 3.4 9.4 0 6.8-.1 12.2-.1 13.9 0 1.3.9 2.9 3.4 2.4C83.7 90.9 98 72.1 98 50 98 22.4 76.1 0 49 0Z"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </header>

        <section class="grid flex-1 gap-6 py-5 md:py-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div class="glass-panel relative overflow-hidden rounded-[38px] px-6 py-10 md:px-8 md:py-12">
            <div class="absolute -left-10 top-12 h-40 w-40 rounded-full bg-glow/10 blur-3xl"></div>
            <div class="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-peach/10 blur-3xl"></div>
            <div class="relative max-w-3xl space-y-8">
              <div class="space-y-4">
                <p class="text-sm uppercase tracking-[0.3em] text-glow">{{ t('landing.kicker') }}</p>
                <h1 class="font-display text-5xl leading-tight text-white md:text-7xl">
                  {{ t('landing.title') }}
                </h1>
                <p class="max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
                  {{ t('landing.subtitle') }}
                </p>
              </div>

              <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <RouterLink
                  to="/studio"
                  class="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
                >
                  <FontAwesomeIcon :icon="['fas', 'wand-magic-sparkles']" class="mr-2" />
                  {{ t('landing.primaryCta') }}
                </RouterLink>
                <button
                  type="button"
                  class="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-glow/40"
                  @click="focusJourney"
                >
                  {{ t('landing.secondaryCta') }}
                </button>
              </div>

              <div
                id="journey"
                ref="journeyElement"
                class="grid gap-3 transition-all duration-500 md:grid-cols-3"
              >
                <div
                  v-for="step in journey"
                  :key="step"
                  class="rounded-[26px] border border-white/10 bg-white/5 p-4 transition-all duration-500"
                  :class="isJourneyHighlighted ? 'border-glow/45 bg-glow/10 shadow-[0_0_0_1px_rgba(139,211,255,0.16),0_24px_60px_rgba(22,88,128,0.22)]' : ''"
                >
                  <p class="text-xs uppercase tracking-[0.24em] text-slate-400">{{ t(`${step}.label`) }}</p>
                  <p class="mt-3 text-sm leading-7 text-slate-200">{{ t(`${step}.text`) }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <section class="glass-panel rounded-[34px] p-6">
              <div class="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p class="text-xs uppercase tracking-[0.28em] text-glow">{{ t('landing.previewKicker') }}</p>
                  <h2 class="mt-2 font-display text-3xl text-white">{{ t('landing.previewTitle') }}</h2>
                </div>
                <span class="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.22em] text-slate-300">
                  {{ t('landing.previewBadge') }}
                </span>
              </div>
              <div class="rounded-[28px] border border-white/10 bg-slate-950/55 p-5">
                <p class="text-sm leading-8 text-slate-100">
                  {{ t('landing.samplePrompt') }}
                </p>
              </div>
            </section>

            <section class="grid gap-4">
              <article
                v-for="item in highlights"
                :key="item.titleKey"
                class="glass-panel rounded-[28px] p-5 transition hover:-translate-y-0.5"
              >
                <div class="flex items-start gap-4">
                  <div class="flex h-12 w-12 items-center justify-center rounded-2xl border border-glow/20 bg-glow/10 text-glow">
                    <FontAwesomeIcon :icon="item.icon" />
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-white">{{ t(item.titleKey) }}</h3>
                    <p class="mt-2 text-sm leading-7 text-slate-300">{{ t(item.textKey) }}</p>
                  </div>
                </div>
              </article>
            </section>
          </div>
        </section>

        <section class="grid gap-6 pb-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section class="glass-panel rounded-[34px] p-6 md:p-7">
            <p class="text-xs uppercase tracking-[0.28em] text-glow">{{ t('landing.benefits.kicker') }}</p>
            <h2 class="mt-3 font-display text-3xl text-white md:text-4xl">{{ t('landing.benefits.title') }}</h2>
            <p class="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
              {{ t('landing.benefits.intro') }}
            </p>
            <div class="mt-6 grid gap-4 md:grid-cols-3">
              <article
                v-for="benefit in benefits"
                :key="benefit"
                class="rounded-[26px] border border-white/10 bg-white/5 p-5"
              >
                <h3 class="text-lg font-semibold text-white">{{ t(`${benefit}.title`) }}</h3>
                <p class="mt-3 text-sm leading-7 text-slate-300">{{ t(`${benefit}.text`) }}</p>
              </article>
            </div>
          </section>

          <section class="glass-panel rounded-[34px] p-6 md:p-7">
            <p class="text-xs uppercase tracking-[0.28em] text-glow">{{ t('landing.useCases.kicker') }}</p>
            <h2 class="mt-3 font-display text-3xl text-white md:text-4xl">{{ t('landing.useCases.title') }}</h2>
            <p class="mt-4 text-sm leading-7 text-slate-300 md:text-base">{{ t('landing.useCases.intro') }}</p>
            <div class="mt-6 grid gap-3">
              <article
                v-for="useCase in useCases"
                :key="useCase"
                class="rounded-[24px] border border-white/10 bg-slate-950/45 p-5"
              >
                <h3 class="text-lg font-semibold text-white">{{ t(`${useCase}.title`) }}</h3>
                <p class="mt-2 text-sm leading-7 text-slate-300">{{ t(`${useCase}.text`) }}</p>
              </article>
            </div>
          </section>
        </section>

        <section class="glass-panel rounded-[34px] p-6 pb-7 md:p-7 md:pb-8">
          <div class="max-w-4xl">
            <p class="text-xs uppercase tracking-[0.28em] text-glow">{{ t('landing.keywordTopics.kicker') }}</p>
            <h2 class="mt-3 font-display text-3xl text-white md:text-4xl">{{ t('landing.keywordTopics.title') }}</h2>
            <p class="mt-4 text-sm leading-7 text-slate-300 md:text-base">{{ t('landing.keywordTopics.intro') }}</p>
          </div>
          <div class="mt-6 flex flex-wrap gap-3">
            <span
              v-for="topic in keywordTopics"
              :key="topic"
              class="rounded-full border border-glow/20 bg-glow/10 px-4 py-2 text-sm text-slate-100"
            >
              {{ t(topic) }}
            </span>
          </div>
          <p class="mt-5 max-w-5xl text-sm leading-7 text-slate-400">{{ t('landing.keywordTopics.outro') }}</p>
        </section>

        <section class="glass-panel rounded-[34px] p-6 pb-7 md:p-7 md:pb-8">
          <div class="max-w-4xl">
            <p class="text-xs uppercase tracking-[0.28em] text-glow">{{ t('landing.faq.kicker') }}</p>
            <h2 class="mt-3 font-display text-3xl text-white md:text-4xl">{{ t('landing.faq.title') }}</h2>
            <p class="mt-4 text-sm leading-7 text-slate-300 md:text-base">{{ t('landing.faq.intro') }}</p>
          </div>
          <div class="mt-6 grid gap-3">
            <details
              v-for="item in faqItems"
              :key="item"
              class="group rounded-[24px] border border-white/10 bg-slate-950/45 p-5 open:border-glow/35 open:bg-glow/5"
            >
              <summary class="cursor-pointer list-none text-lg font-semibold text-white marker:hidden">
                <span class="flex items-center justify-between gap-4">
                  <span>{{ t(`${item}.question`) }}</span>
                  <span class="text-glow transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p class="mt-4 max-w-4xl text-sm leading-7 text-slate-300 md:text-base">{{ t(`${item}.answer`) }}</p>
            </details>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>
