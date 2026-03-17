# Art Prompt Generator

[![CI](https://github.com/valcriss/art-prompt-generator/actions/workflows/ci.yml/badge.svg)](https://github.com/valcriss/art-prompt-generator/actions/workflows/ci.yml)

Creative prompt studio built with Vue 3, TypeScript, Vite and Tailwind CSS.

The product helps artists and AI image-makers turn a rough idea into a richer prompt by guiding them through subject, environment, atmosphere, lighting, composition and storytelling details. Phase 1 is frontend-only and stores everything locally in the browser through repository abstractions designed to be replaceable by API-backed implementations later.

## MVP scope

- bilingual UI with `fr` and `en`
- landing page and dedicated studio workspace
- guided builder for `image` and `video` prompt projects
- positive and negative prompt generation
- smart suggestions, contextual bundles and guided comboboxes
- local project history with reopen, duplicate and delete
- reusable creative library with structured fields and selective insertion
- reusable templates/presets with structured editing and mini builder
- local persistence through repositories

## Stack

- Vue 3
- TypeScript
- Vite
- Tailwind CSS
- Vue Router
- Vue I18n
- Vitest
- Vue Test Utils
- ESLint

## Run locally

From the project root:

```bash
npm install
npm run dev
```

Open the URL shown by Vite, usually `http://localhost:5173`.

Routes:

- `/` landing page
- `/studio` main builder
- `/studio/library` advanced library management
- `/studio/templates` advanced template management
- `/studio/history` local project history

## Available scripts

```bash
npm run dev
npm run build
npm run preview
npm run test
npm run lint
npm run format
```

## Project structure

```text
src/
  components/        UI primitives
  composables/       shared studio state and orchestration
  domain/            prompt assembly and creative domain logic
  features/          landing, builder, templates, history, studio shell
  i18n/              locale setup and messages
  repositories/      local persistence abstractions
  types/             domain models
  utils/             small browser utilities
```

## Architecture notes

- Phase 1 uses local persistence only.
- UI components do not talk to `localStorage` directly.
- Persistence lives behind repository contracts such as:
  - `PromptProjectRepository`
  - `PromptTemplateRepository`
  - `LibraryElementRepository`
  - `UserPreferenceRepository`
- This keeps the codebase ready for a later Phase 2 with backend APIs and sync.

## Testing and quality

The project includes:

- unit tests for domain logic and repositories
- component tests for key studio flows
- ESLint
- TypeScript build validation via `vue-tsc`

Recommended validation before sharing work:

```bash
npm run test
npm run lint
npm run build
```

## Product notes

- Prompt projects are the core entity of the app.
- The builder adapts between still-image prompting and single-shot video prompting.
- Guided values are localized for the user, while prompt tokens remain canonically stored in English when needed for generation consistency.
- Quick filters in the studio and locale preference are persisted locally.

## Next likely steps after MVP

- deeper mobile QA and device-specific polish
- additional UI tests for richer comparison flows
- backend-backed repositories for sync and authentication
- reference image uploads and shared projects
