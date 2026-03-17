<script setup lang="ts">
import { reactive } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LocaleFlagButton from '../../../components/ui/LocaleFlagButton.vue'
import { usePromptStudio } from '../../../composables/usePromptStudio'

const studio = reactive(usePromptStudio())
const { t } = useI18n()
const route = useRoute()

const links = [
  { to: '/studio', labelKey: 'studio.nav.builder', icon: ['fas', 'wand-magic-sparkles'] },
  { to: '/studio/library', labelKey: 'studio.nav.library', icon: ['fas', 'layer-group'] },
  { to: '/studio/templates', labelKey: 'studio.nav.templates', icon: ['fas', 'object-group'] },
  { to: '/studio/history', labelKey: 'studio.nav.history', icon: ['fas', 'clock-rotate-left'] },
]
</script>

<template>
  <main class="min-h-screen bg-mesh text-white">
    <div class="faint-grid min-h-screen">
      <div class="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col px-4 py-4 md:px-6 md:py-6 lg:px-8">
        <header class="glass-panel rounded-[30px] px-4 py-4 md:px-5">
          <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div class="flex min-w-0 flex-col gap-3">
              <RouterLink
                to="/"
                class="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-300 transition hover:bg-white/10"
              >
                <FontAwesomeIcon :icon="['fas', 'book-open']" class="mr-2" />
                {{ t('app.home') }}
              </RouterLink>
              <div>
                <p class="text-xs uppercase tracking-[0.28em] text-glow">{{ t('app.eyebrow') }}</p>
                <h1 class="mt-2 font-display text-3xl text-white md:text-4xl">
                  {{ t('studio.title') }}
                </h1>
              </div>
            </div>

            <div class="flex flex-col items-stretch gap-3 md:items-start xl:items-end">
              <div class="flex w-fit items-center gap-2 self-start rounded-full border border-white/10 bg-slate-950/65 p-2 pr-2.5 backdrop-blur-xl xl:self-auto">
                <LocaleFlagButton code="en" label="EN" :active="studio.locale === 'en'" @click="studio.setLocale('en')" />
                <LocaleFlagButton code="fr" label="FR" :active="studio.locale === 'fr'" @click="studio.setLocale('fr')" />
              </div>
              <div class="grid gap-2 sm:grid-cols-2 xl:flex xl:flex-wrap xl:justify-end">
                <button class="rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5" @click="studio.saveProject">
                  <FontAwesomeIcon :icon="['far', 'floppy-disk']" class="mr-2" />
                  {{ t('app.saveProject') }}
                </button>
                <button class="rounded-full border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10" @click="studio.exportText">
                  <FontAwesomeIcon :icon="['fas', 'file-arrow-down']" class="mr-2" />
                  {{ t('app.exportText') }}
                </button>
              </div>
            </div>
          </div>

          <nav class="mt-5 flex gap-2 overflow-x-auto pb-1">
            <RouterLink
              v-for="link in links"
              :key="link.to"
              :to="link.to"
              class="shrink-0 rounded-full border px-4 py-3 text-sm font-medium transition"
              :class="
                route.path === link.to
                  ? 'border-glow/40 bg-glow/15 text-glow'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              "
            >
              <FontAwesomeIcon :icon="link.icon" class="mr-2" />
              {{ t(link.labelKey) }}
            </RouterLink>
          </nav>
        </header>

        <section class="py-5 md:py-6">
          <RouterView />
        </section>
      </div>
    </div>

    <transition enter-active-class="transition duration-200 ease-out" enter-from-class="translate-y-2 opacity-0" enter-to-class="translate-y-0 opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-2 opacity-0">
      <div v-if="studio.toast" class="fixed bottom-4 left-4 right-4 rounded-[22px] border border-white/10 bg-white px-4 py-3 text-sm font-medium text-slate-950 shadow-haze md:bottom-6 md:left-auto md:right-6 md:w-auto md:rounded-full">
        {{ studio.toast }}
      </div>
    </transition>
  </main>
</template>
