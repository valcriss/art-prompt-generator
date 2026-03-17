import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('../features/landing/components/LandingPage.vue'),
    },
    {
      path: '/studio',
      component: () => import('../features/studio-shell/components/StudioShell.vue'),
      children: [
        {
          path: '',
          name: 'studio-builder',
          component: () => import('../features/prompt-builder/components/BuilderPage.vue'),
        },
        {
          path: 'library',
          name: 'studio-library',
          component: () => import('../features/prompt-builder/components/LibraryPage.vue'),
        },
        {
          path: 'templates',
          name: 'studio-templates',
          component: () => import('../features/prompt-builder/components/TemplatesPage.vue'),
        },
        {
          path: 'history',
          name: 'studio-history',
          component: () => import('../features/prompt-builder/components/HistoryPage.vue'),
        },
      ],
    },
  ],
})
