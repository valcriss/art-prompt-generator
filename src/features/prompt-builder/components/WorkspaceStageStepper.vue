<script setup lang="ts">
type WorkspaceStage = {
  id: string
  title: string
  caption: string
  status: 'active' | 'complete' | 'idle'
}

defineProps<{
  stages: WorkspaceStage[]
  activeStage: string
}>()

const emit = defineEmits<{
  select: [stageId: string]
}>()
</script>

<template>
  <div class="rounded-[28px] border border-white/10 bg-slate-950/25 p-2.5 md:p-3">
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
      <button
        v-for="(stage, index) in stages"
        :key="stage.id"
        :data-testid="`workspace-stage-${stage.id}`"
        type="button"
        class="flex h-full min-w-0 flex-col rounded-[20px] border px-4 py-3.5 text-left transition"
        :class="
          activeStage === stage.id
            ? 'border-glow/40 bg-glow/12'
            : stage.status === 'complete'
              ? 'border-white/15 bg-white/[0.05] hover:bg-white/[0.08]'
              : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
        "
        @click="emit('select', stage.id)"
      >
        <div class="flex items-center justify-between gap-3">
          <p class="text-[10px] uppercase tracking-[0.24em] text-slate-500">
            {{ `0${index + 1}` }}
          </p>
          <span
            class="h-2.5 w-2.5 shrink-0 rounded-full"
            :class="
              activeStage === stage.id
                ? 'bg-glow shadow-[0_0_18px_rgba(139,211,255,0.45)]'
                : stage.status === 'complete'
                  ? 'bg-peach'
                  : 'bg-white/25'
            "
          />
        </div>
        <p class="mt-2 text-base font-semibold leading-tight text-white">{{ stage.title }}</p>
        <p class="mt-3 text-sm leading-6 text-slate-400">{{ stage.caption }}</p>
      </button>
    </div>
  </div>
</template>
