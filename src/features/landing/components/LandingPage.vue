<script setup lang="ts">
import { reactive } from 'vue'
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
              <RouterLink
                to="/studio"
                class="inline-flex items-center justify-center rounded-full border border-white/15 bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
              >
                {{ t('landing.enterStudio') }}
              </RouterLink>
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
                <a
                  href="#journey"
                  class="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-glow/40"
                >
                  {{ t('landing.secondaryCta') }}
                </a>
              </div>

              <div id="journey" class="grid gap-3 md:grid-cols-3">
                <div
                  v-for="step in journey"
                  :key="step"
                  class="rounded-[26px] border border-white/10 bg-white/5 p-4"
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
      </div>
    </div>
  </main>
</template>
