# AGENTS.md

## Project Overview

Build a web product that helps users create richer, more soulful prompts for ComfyUI and other image-generation tools.

The core idea is simple: most users start with a vague image idea, but struggle to define the elements that make an image memorable — atmosphere, background, lighting, composition, emotion, storytelling details, and visual coherence.

This product should guide users through that creative process and help them turn a rough idea into a structured, expressive prompt.

The target audience includes:
- digital artists
- AI artists
- illustrators
- graphic designers
- creative hobbyists

Because of this audience, the product must not feel like an admin dashboard or a plain utility form. It should feel like a creative studio, a visual workshop, or a digital art direction assistant.

---

## Product Vision

This is not just a prompt text generator.

It is a guided creative composition tool that helps users:
- clarify the subject of the image
- define the environment and setting
- choose mood and emotional tone
- shape lighting and composition
- add narrative details that give life to the image
- generate a polished final prompt
- later save, organize, enrich, and share prompt projects

The long-term product can become a creative library of visual ideas, prompt templates, and reference-driven prompt projects.

---

## Development Strategy

The project must be built in phases.

### Phase 1 — Frontend-only MVP

The first phase must be frontend-only.

Do not build authentication, server APIs, cloud persistence, or social/community features in this phase.

The goal of Phase 1 is to validate the core user value:

**Does the product genuinely help users create better, richer prompts?**

Phase 1 should work entirely in the browser and store data locally.

Recommended local persistence options:
- localStorage for a first iteration
- IndexedDB if a more robust local persistence layer is needed

### Phase 2 — Backend integration

The backend is introduced only when the core UX and product value are validated.

Phase 2 adds:
- user accounts
- cloud persistence
- prompt project synchronization
- image uploads for references
- private/public/shared prompt projects
- prompt duplication / fork / remix

### Important architectural rule

Even though Phase 1 is frontend-only, the codebase must be structured as if remote persistence will exist later.

Do not tightly couple domain logic to local storage or UI components.

Use clear abstractions for data access so local persistence can later be replaced with API-based persistence.

---

## Tech Stack

### Frontend
- Vue 3
- TypeScript
- Vite
- Tailwind CSS

### Internationalization
- The MVP must support i18n from the start.
- Required locales for Phase 1:
  - French (`fr`)
  - English (`en`)
- User-facing UI copy should be routed through a translation layer rather than hardcoded in components.
- Language preference should be stored locally in the browser in Phase 1 through the same abstraction mindset used for repositories.
- The architecture should make it easy to expand to additional locales later without rewriting the builder UI.

### State management
Use a lightweight and modern approach.

Recommended:
- Pinia for app state if shared state becomes important
- otherwise keep local composables where possible

### Persistence abstraction
Create repositories or storage services behind interfaces.

Examples:
- PromptProjectRepository
- PromptTemplateRepository
- UserPreferenceRepository

In Phase 1, they use local persistence.
In Phase 2, they can be swapped to API-backed implementations.

### Styling and UI
- Tailwind CSS
- component-driven architecture
- reusable UI primitives
- strong spacing system
- polished motion and transitions

### Testing
The project must include:
- unit tests
- component tests where useful
- linter

Recommended tools:
- Vitest
- Vue Test Utils
- ESLint
- Prettier

The code should aim for strong quality and maintainability.

---

## High-Level Product Features by Phase

## Phase 1 Features

### Local project persistence (MVP requirement)

The MVP must include a **local project store using localStorage** so that users can save and reopen their prompt projects.

Requirements:

- Prompt projects must be stored locally in the browser.
- A **project history screen** must allow users to:
  - see previously created prompt projects
  - reopen them
  - duplicate them
  - delete them
- The local persistence must be implemented through a repository abstraction.

Example architecture:

- `PromptProjectRepository` (interface)
- `LocalPromptProjectRepository` (localStorage implementation)

This abstraction is critical because:

**In Phase 2 the local storage will be replaced by a backend API implementation.**

The UI and domain logic must not depend directly on `localStorage`.

The repository layer must make it easy to switch from:

`LocalPromptProjectRepository` → `ApiPromptProjectRepository`.

The history view must behave like a small local library of projects.

Projects must be sorted by most recently modified.

Each project entry should show:
- title
- tags
- last modified date
- medium type (image or video)

### Localization (MVP requirement)

The MVP must include bilingual support for:

- French (`fr`)
- English (`en`)

Requirements:

- The main product interface must be available in both languages.
- The language can be switched directly from the frontend.
- The selected locale must persist locally in the browser.
- The i18n setup must not be tightly coupled to a single screen, so future screens and features can reuse it cleanly.

---

### Guided prompt builder

Implement these features first:

### Guided prompt builder
The user should be guided through creative dimensions such as:
- subject
- environment
- time of day
- weather
- mood
- style
- lighting
- composition
- storytelling details

### Prompt assembly
The app should build a final prompt dynamically from the user selections and inputs.

### Negative prompt support
Generate or suggest a negative prompt alongside the main prompt.

### Prompt richness assistance
Provide suggestions that help users enrich their scene.

Examples:
- add atmosphere
- add secondary objects
- add motion cues
- add world detail
- add emotional tone
- add cinematic cues

### Local save
Users must be able to save prompt projects locally in the browser.

### Prompt history and duplication
Allow users to:
- reopen previous prompt projects
- duplicate a project
- refine a variation

### Export
Users should be able to export the final prompt and structured prompt data.

Recommended export formats:
- plain text
- JSON

### Presets / templates
Support reusable prompt building blocks.

Examples:
- cyberpunk rainy street
- dark fantasy castle
- cozy cottage
- anime portrait
- cinematic dystopian alley

---

## Phase 2 Features

Add these only after Phase 1 is solid:

### Authentication
Users can create accounts and sign in.

### Cloud sync
Prompt projects are stored remotely and available across devices.

### Reference images
Users can upload images linked to a prompt project.

Reference image categories may include:
- style reference
- composition reference
- character reference
- mood reference
- color palette

### Sharing
Support visibility modes such as:
- private
- shared by link
- public

### Fork / remix
A user can duplicate a public or shared prompt project into their own library.

### Personal library
Users can organize prompts through:
- tags
- favorites
- collections
- archived prompts

---

## Core Domain Concepts

The product supports **two prompt mediums**:

- image prompts
- video prompts

Video prompts introduce additional concepts such as motion, camera movement, and temporal evolution of the scene.

The builder must adapt its UI depending on the medium.

The product should revolve around the idea of a **Prompt Project**, not just a single text prompt.

A Prompt Project represents a creative concept and contains structured scene information.

Suggested shape:

```ts
export type PromptMedium = 'image' | 'video';

export interface PromptProject {
  id: string;
  medium: PromptMedium;
  title: string;
  description?: string;
  subject: SubjectBlock;
  environment: EnvironmentBlock;
  mood?: string;
  style?: string;
  lighting?: string;
  composition?: string;
  details: string[];
  motion?: MotionBlock;
  camera?: CameraBlock;
  temporalStructure?: TemporalStructureBlock;
  positivePrompt: string;
  negativePrompt: string;
  tags: string[];
  referenceImages: ReferenceImage[];
  createdAt: string;
  updatedAt: string;
}

export interface SubjectBlock {
  type?: string;
  description?: string;
  action?: string;
  age?: string;
  appearance?: string;
}

export interface EnvironmentBlock {
  location?: string;
  season?: string;
  weather?: string;
  timeOfDay?: string;
  era?: string;
}

export interface MotionBlock {
  subjectMotion?: string;
  environmentMotion?: string;
  motionIntensity?: 'subtle' | 'moderate' | 'strong';
  rhythm?: 'slow' | 'steady' | 'dynamic';
}

export interface CameraBlock {
  shotType?: string;
  angle?: string;
  movement?: string;
  lensFeel?: string;
}

export interface TemporalStructureBlock {
  startState?: string;
  progression?: string;
  endState?: string;
  durationFeel?: string;
}

export interface ReferenceImage {
  id: string;
  type: 'style' | 'composition' | 'character' | 'mood' | 'palette';
  url: string;
  caption?: string;
}
```

For the MVP, reference images may remain unused if upload is not implemented yet.

---

## Video Prompting Principles

Video prompts differ from image prompts because they describe **a sequence over time rather than a static moment**.

The system must guide users to think in terms of motion and cinematic language.

Important distinctions:

- subject motion
- environment motion
- camera movement
- scene progression

Prompts should remain readable and coherent.

Avoid generating chaotic prompts with too many simultaneous actions.

Encourage clear cinematic structure.

Example conceptual structure:

- static environment
- character action
- subtle environmental motion
- camera movement
- scene progression

For the MVP, video support must focus on **single-shot prompts**.

Multi-shot timelines or storyboard editors are out of scope for the initial implementation.

---

The product should revolve around the idea of a **Prompt Project**, not just a single text prompt.

A Prompt Project should represent a creative concept and contain structured data.

Suggested shape:

```ts
export interface PromptProject {
  id: string;
  title: string;
  description?: string;
  subject: SubjectBlock;
  environment: EnvironmentBlock;
  mood?: string;
  style?: string;
  lighting?: string;
  composition?: string;
  details: string[];
  positivePrompt: string;
  negativePrompt: string;
  tags: string[];
  referenceImages: ReferenceImage[];
  createdAt: string;
  updatedAt: string;
}

export interface SubjectBlock {
  type?: string;
  description?: string;
  action?: string;
  age?: string;
  appearance?: string;
}

export interface EnvironmentBlock {
  location?: string;
  season?: string;
  weather?: string;
  timeOfDay?: string;
  era?: string;
}

export interface ReferenceImage {
  id: string;
  type: 'style' | 'composition' | 'character' | 'mood' | 'palette';
  url: string;
  caption?: string;
}
```

Phase 1 may keep `referenceImages` empty or only allow local metadata placeholders if image upload is not yet implemented.

---

## UX Direction

The experience must feel like building a visual scene, not filling out a technical form.

The app should help users move from:
- vague idea
- to structured scene
- to emotionally coherent final prompt

The interface should encourage inspiration and exploration.

### UX principles
- reduce blank-page anxiety
- guide without overwhelming
- keep choices visually legible
- make the prompt feel alive as it is built
- favor visual inspiration over dense text wherever possible
- make iteration fast and satisfying

### Recommended interaction patterns
- multi-panel creative workspace
- guided sections rather than long forms
- visual selection cards
- progressive disclosure
- live-updating prompt preview
- tag-like chips for scene details
- optional creative suggestion buttons

Examples of helpful actions:
- “Add atmosphere”
- “Make the scene more cinematic”
- “Add storytelling detail”
- “Suggest background ideas”
- “Increase emotional depth”

---

## Visual and Art Direction

This part is critical.

The target users are creative people. The interface must feel polished, premium, and intentionally designed.

Do not make the product look like:
- an enterprise dashboard
- a CRUD admin tool
- a spreadsheet-like utility
- a generic SaaS template

It should feel closer to:
- a creative studio
- a moodboard workspace
- a digital art direction assistant
- a cinematic design tool

### Visual personality
The visual style should be:
- dark, elegant, atmospheric
- minimal but highly polished
- spacious and premium
- subtle rather than flashy
- expressive without being noisy

### Suggested inspirations
Use these only as directional inspiration, not to copy:
- Figma
- Linear
- Arc browser
- Excalidraw (for clarity and friendliness)
- high-end portfolio sites
- modern creative tooling interfaces

### Color direction
Use a dark UI base with refined contrast.

Possible characteristics:
- deep charcoal / blue-black background
- elevated surfaces with subtle tonal separation
- restrained accent colors
- occasional luminous highlight for selected states
- soft glows used sparingly

Avoid overly saturated gamer aesthetics.
Avoid rainbow-heavy gradients.
Avoid visual clutter.

### Surface treatment
UI panels and cards may use:
- slight translucency or glass-like hints
- very subtle borders
- soft shadows
- rounded corners
- layered depth

These effects must remain tasteful and controlled.

### Typography
Typography must be clean and modern.

Use a highly legible sans-serif for the interface.
Prompt preview areas may have slightly more expressive treatment, but readability remains more important than novelty.

### Motion
Animations should be subtle and polished.

Good examples:
- soft hover elevation
- smooth selection transitions
- elegant content fade or slide
- prompt preview updating gracefully

Bad examples:
- bouncy gimmicks
- loud transitions
- excessive parallax
- decorative motion that distracts from work

### Layout feeling
The layout should breathe.

Use:
- generous spacing
- large cards
- clear hierarchy
- uncluttered panels
- calm visual rhythm

This should feel like entering a creative workshop.

---

## Suggested Core Screens

### 1. Landing / entry experience
Purpose:
- communicate product value immediately
- create a strong creative first impression
- invite users to start building a prompt

Potential sections:
- hero area
- visual statement of purpose
- sample creative prompt journey
- call to start a prompt project

### 2. Prompt builder workspace
This is the main screen.

Possible structure:
- left panel: scene-building sections
- center panel: project workspace / current selections
- right panel: live prompt preview and output tools

Or a responsive stacked layout for smaller screens.

### 3. Local library
In Phase 1, this is the locally stored prompt projects view.

Should support:
- reopen
- duplicate
- delete
- filter by tags or preset type

### 4. Template / preset browser
Allow users to start from curated creative templates.

---

## Suggested Information Architecture for the Builder

The builder can be organized into creative blocks such as:

### Subject
What is the main focus?
Examples:
- character
- creature
- object
- place
- narrative scene

### Context / Environment
Where does the scene happen?
Examples:
- ruined temple
- rainy alley
- snowy forest
- futuristic megacity
- warm painterly studio

### Atmosphere / Mood
What should the viewer feel?
Examples:
- melancholic
- tense
- hopeful
- mysterious
- serene
- oppressive

### Lighting
Examples:
- moonlight
- neon reflections
- warm candlelight
- overcast diffuse light
- dramatic backlight
- volumetric fog glow

### Composition
Examples:
- close-up portrait
- wide shot
- low angle
- symmetrical framing
- shallow depth of field
- cinematic perspective

### Storytelling Details
Examples:
- footprints in snow
- torn banners
- smoke in the distance
- abandoned cup on a table
- cat watching from a window
- wind moving fabric

Each block should help the user make more specific and expressive choices.

---

## Reusable Creative Library (MVP Feature Direction)

Users should be able to maintain a **personal creative library** containing reusable scene elements. The purpose of this system is to prevent users from repeatedly rewriting complex descriptions and to encourage the creation of consistent visual universes.

These reusable elements act as modular creative building blocks that can be quickly inserted into a prompt project.

Library elements may include:

- characters
- locations
- scenes
- atmosphere presets
- storytelling details

Examples:

Character example:
"old wounded samurai with long grey hair, worn armor, cloth bandage around arm"

Location example:
"rainy cyberpunk alley in Osaka with neon ramen signs and wet asphalt reflections"

Atmosphere example:
"melancholic quiet evening with drifting fog and distant lantern light"

The user should be able to insert these elements into a prompt project without rewriting the full description.

---

## UI Interaction Concept for Library

The UI should allow users to **quickly reuse library elements** in a creative and intuitive way.

Recommended interaction patterns:

- drag and drop from the library into the scene builder
- click to insert into the current project
- preview cards with optional image thumbnails

The experience should feel like **assembling pieces of a visual scene**.

Example workflow:

1. User opens the prompt builder
2. User drags a character card into the scene
3. User drags a location card
4. User adds atmosphere and lighting
5. The prompt updates automatically

The interface should visually represent inserted elements as chips or cards within the scene composition area.

The library panel should remain lightweight and not dominate the interface.

It should behave like a **creative drawer** that can be opened when needed.

---

## Library Element Domain Model

Introduce a new domain entity representing reusable building blocks.

```ts
export type LibraryElementType =
  | 'character'
  | 'location'
  | 'scene'
  | 'atmosphere'
  | 'detail';

export interface LibraryElement {
  id: string;
  type: LibraryElementType;
  name: string;
  description: string;
  tags: string[];
  previewImage?: string;
  createdAt: string;
  updatedAt: string;
}
```

A prompt project may reference multiple library elements.

Example extension:

```ts
libraryElements?: string[];
```

Where the array contains IDs referencing elements stored in the user library.

---

## Library Storage Strategy (MVP)

In Phase 1, the user library should be stored locally using **localStorage**, similar to prompt projects.

Use the same repository abstraction strategy.

Example:

- `LibraryElementRepository`
- `LocalLibraryElementRepository`

In Phase 2 this repository will be replaced with an API implementation.

Example future replacement:

`LocalLibraryElementRepository` → `ApiLibraryElementRepository`

The UI and domain layers must not depend directly on `localStorage`.

---

## Future Potential of the Library

Over time the creative library can become a powerful feature of the product.

Potential future capabilities:

- shareable characters and locations
- community element libraries
- style packs
- collaborative creative worlds
- visual universes built from reusable pieces

The architecture should keep this future evolution possible without complicating the MVP.

---

## Scene Graph Composition System (Advanced UI Direction)

To further enhance the creative workflow, the builder should evolve toward a **scene graph style composition interface**.

Instead of only editing text fields, users should be able to visually assemble a scene using modular blocks representing key creative elements.

These elements may include:

- characters
- locations
- atmosphere
- actions
- camera movement
- environmental effects

Each element acts as a **node in a scene graph**.

The final prompt is generated from the relationships between these nodes.

Example conceptual structure:

Character → Action → Location → Atmosphere → Lighting → Camera

Example scene graph representation:

```
[Character]
   |
[Action]
   |
[Location] ---- [Atmosphere]
   |
[Lighting]
   |
[Camera]
```

This structure helps the user think about the scene logically and visually rather than as a long block of text.

---

## Scene Graph UX Principles

The visual editor should behave like a creative composition board.

Recommended interaction ideas:

- drag elements from the library into the scene
- connect elements visually
- reorder blocks
- remove elements easily
- preview how each element affects the generated prompt

The system must remain **simple and approachable**.

For the MVP, the scene graph does not need to be a fully freeform node editor.

A simplified approach is recommended:

- a vertical or horizontal chain of scene blocks
- drag to reorder
- click to edit

The visual model should still reflect the idea of a scene graph internally.

This ensures the architecture can evolve later into a more advanced node-based editor if desired.

---

## Prompt Generation From Scene Graph

The prompt assembly logic should be able to generate prompts from the ordered scene graph elements.

The generator should:

- respect logical ordering
- merge descriptions from multiple nodes
- avoid duplication
- maintain readability

Example result:

"old wounded samurai walking slowly through a snowy bamboo forest, light snow falling, cloth moving in the wind, melancholic atmosphere, cinematic lighting, slow camera push-in"

The scene graph model should make this assembly deterministic and maintainable.

---

## Engineering Guidance

### Code organization
Separate the project clearly into:
- UI components
- domain logic
- storage / repositories
- utility functions
- styling tokens / design system primitives

Suggested folders:

```text
src/
  components/
  features/
    prompt-builder/
    prompt-library/
    prompt-templates/
  domain/
  repositories/
  composables/
  stores/
  utils/
  types/
```

### Domain logic should stay framework-light
Prompt composition logic should be reusable and testable without being tied to Vue components.

Examples:
- prompt assembly
- prompt enrichment suggestions
- consistency checks
- scoring / richness heuristics

### Keep persistence abstracted
Phase 1 should not scatter `localStorage` access all over the UI.

Wrap persistence in dedicated repository implementations.

Example:
- `LocalPromptProjectRepository`
- later `ApiPromptProjectRepository`

### Reusability
Components should be small, focused, and reusable.
Avoid oversized components that mix layout, state, business logic, and storage.

Factorize shared visual primitives.
Keep pages thin and orchestration-focused.

---

## Quality Requirements

The generated project must include:
- clean project structure
- TypeScript everywhere reasonable
- linting
- formatting
- unit tests for domain logic
- maintainable Vue components

The code should prioritize:
- readability
- extensibility
- separation of concerns
- ease of migration from Phase 1 to Phase 2

---

## Non-Goals for Phase 1

Do not implement these in the first phase unless explicitly requested later:
- backend API
- authentication
- database
- public gallery
- social feed
- comments
- notifications
- collaborative editing
- analytics platform
- workflow execution against ComfyUI

This product is not yet a ComfyUI runner.
It is a prompt creation and creative guidance tool.

---

## Future Extensions (for later phases)

These are valid future ideas, but not for the initial MVP:
- direct ComfyUI integration
- prompt-to-workflow recommendations
- AI-assisted prompt expansion
- visual moodboard generation
- style-consistency warnings
- prompt quality score
- gallery of public prompt projects
- collaborative workshops
- team libraries

---

## Final Implementation Mindset

Build the first version as a polished, inspiring creative tool.

It must already feel premium and useful in Phase 1, even without accounts or backend services.

The best outcome for the MVP is:
- users understand the concept instantly
- the interface feels beautiful and intentional
- building a prompt feels enjoyable
- the resulting prompts are richer and more evocative than what users would usually write on their own

The codebase should be ready for growth, but the product should stay focused.

A small, elegant creative studio is better than a bloated pseudo-platform.
