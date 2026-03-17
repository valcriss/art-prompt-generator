<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import BasePanel from '../../../components/ui/BasePanel.vue'
import ChipTag from '../../../components/ui/ChipTag.vue'
import StudioSelect from '../../../components/ui/StudioSelect.vue'
import { usePromptStudio } from '../../../composables/usePromptStudio'
import { formatDate } from '../../../utils/format'

const studio = reactive(usePromptStudio())
const { t } = useI18n()
const router = useRouter()
const historyFilterKeys = ['all', 'image', 'video'] as const
const historySortOptions = computed(() => [
  { value: 'recent', label: t('history.sortRecent') },
  { value: 'title', label: t('history.sortTitle') },
  { value: 'medium', label: t('history.sortMedium') },
])

const openProject = async (project: Parameters<typeof studio.loadProject>[0]) => {
  studio.loadProject(project)
  await router.push({ name: 'studio-builder' })
}
</script>

<template>
  <BasePanel :title="t('app.history')" :subtitle="t('history.subtitle')">
    <div class="space-y-4">
      <div class="rounded-[24px] border border-white/10 bg-white/5 p-4">
        <div class="grid gap-3 md:grid-cols-[1.15fr_0.85fr]">
          <div class="relative">
            <FontAwesomeIcon :icon="['fas', 'clock-rotate-left']" class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input v-model="studio.historyFilter" :placeholder="t('history.search')" class="w-full rounded-2xl border border-white/10 bg-slate-950/70 py-3 pl-11 pr-4 text-white placeholder:text-slate-500 outline-none transition focus:border-glow/40" />
          </div>
          <StudioSelect
            v-model="studio.historySort"
            :options="historySortOptions"
            :icon="['fas', 'sliders']"
            :placeholder="t('library.sort')"
            compact
          />
        </div>
        <div class="mt-3 flex flex-wrap gap-2">
          <button v-for="filterKey in historyFilterKeys" :key="filterKey" class="rounded-full border px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] transition" :class="studio.historyMediumFilter === filterKey ? 'border-glow/40 bg-glow/15 text-glow' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'" @click="studio.historyMediumFilter = filterKey">
            {{ filterKey === 'all' ? t('history.filterAll') : filterKey === 'image' ? t('history.filterImage') : t('history.filterVideo') }}
          </button>
        </div>
      </div>

      <div v-if="studio.filteredProjects.length" class="grid gap-4 xl:grid-cols-2">
        <div
          v-for="project in studio.filteredProjects"
          :key="project.id"
          data-testid="history-card"
          class="rounded-[28px] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-white/20"
        >
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="space-y-2">
              <div class="flex flex-wrap items-center gap-2">
                <p class="font-medium text-white">{{ project.title }}</p>
                <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-slate-300">{{ project.medium }}</span>
              </div>
              <div class="flex flex-wrap gap-2">
                <ChipTag v-for="tag in project.tags.slice(0, 3)" :key="`${project.id}-${tag}`" :label="tag" />
              </div>
              <p class="text-xs text-slate-400">{{ t('history.updated') }} {{ formatDate(project.updatedAt, studio.locale) }}</p>
            </div>
            <div class="grid gap-2 sm:min-w-[168px]">
              <button data-testid="history-open-project" class="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs transition hover:bg-white/10" @click="openProject(project)"><FontAwesomeIcon :icon="['fas', 'book-open']" class="mr-2" />{{ t('history.open') }}</button>
              <button class="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs transition hover:bg-white/10" @click="studio.duplicateProject(project)"><FontAwesomeIcon :icon="['fas', 'clock-rotate-left']" class="mr-2" />{{ t('history.duplicate') }}</button>
              <button class="rounded-full border border-rose-300/20 bg-rose-300/5 px-3 py-2 text-xs text-rose-200 transition hover:bg-rose-300/10" @click="studio.deleteProject(project.id)">{{ t('history.delete') }}</button>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="!studio.filteredProjects.length && !studio.projects.length"
        class="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] px-5 py-8 text-center"
      >
        <p class="text-xs uppercase tracking-[0.24em] text-slate-500">{{ t('history.emptyTitle') }}</p>
        <p class="mt-3 text-sm leading-7 text-slate-300">{{ t('app.noProjects') }}</p>
      </div>
      <div
        v-else-if="!studio.filteredProjects.length"
        class="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] px-5 py-8 text-center"
      >
        <p class="text-xs uppercase tracking-[0.24em] text-slate-500">{{ t('history.noResultsTitle') }}</p>
        <p class="mt-3 text-sm leading-7 text-slate-300">{{ t('app.noMatches') }}</p>
      </div>
    </div>
  </BasePanel>
</template>
