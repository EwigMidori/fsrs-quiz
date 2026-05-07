# Flashcard FSRS App Spec

## Objective
Build a mobile-only web flashcard app for exam cramming with:
- React + TypeScript
- Vite
- Tailwind CSS
- Shadcn UI
- Zustand state management
- IndexedDB persistence
- MDX rendering for card content
- FSRS-based scheduling with an endless cram mode

## Source Data
- Primary deck data comes from `decks/*.json`.
- Each file represents one deck and is discovered at startup.
- The app must support multiple decks from day one.
- Card content may contain MDX-flavored text, inline formula tags, and block formula tags.

## Product Rules
- Mobile-first web only.
- No native app shell.
- Reviews must work offline after initial load.
- All progress and review state must persist in IndexedDB.
- Normal mode should respect FSRS due dates.
- Cram mode must ignore future due dates and keep serving cards indefinitely.

## User Flows
1. Open app and see deck summary.
2. Start a review session.
3. Read a card front rendered as MDX.
4. Reveal the back.
5. Grade the response.
6. App updates FSRS state and chooses the next card.
7. In cram mode, the queue never ends even if every card is scheduled into the future.

## Core Screens
- Deck home
- Review session
- Session summary
- Settings

## Data Model
### Deck
- `id`
- `name`
- `language`
- `source`
- `cards[]`

### Deck File
- `decks/<name>.json`
- One file per deck
- Stable file name is the deck identity source

### Card
- `id`
- `topic`
- `tags[]`
- `front`
- `back`

### Review State
- `cardId`
- `stability`
- `difficulty`
- `reps`
- `lapses`
- `dueAt`
- `lastReviewedAt`
- `state`

### Session State
- `mode` (`normal` | `cram`)
- `currentCardId`
- `revealed`
- `answeredCount`
- `correctCount`
- `queue[]`

## Scheduling Rules
- Use an FSRS engine module as the single source of scheduling truth.
- Each answer must update the stored scheduling state for that card.
- Normal mode:
  - Show due cards first.
  - Hide cards that are not due yet.
- Cram mode:
  - Ignore due dates when choosing the next card.
  - Keep the session infinite by recycling cards after the queue is exhausted.
  - Still write FSRS updates so future normal-mode sessions stay accurate.

## MDX Rendering
- Render front/back content through MDX.
- Support inline and block formula components.
- Keep the renderer safe and deterministic for local flashcard content.

## Persistence
- Use Zustand for app state.
- Use IndexedDB for durable persistence of:
  - deck metadata
  - per-card review state
  - session preferences
  - study history
- Persist should survive refresh and browser restarts.

## UI Constraints
- Touch-friendly controls.
- One-handed review flow.
- Large answer buttons.
- Minimal navigation depth.
- Light editorial visual language per `DESIGN.md`.

## Acceptance Criteria
- The app loads all deck files from `decks/`.
- Cards render with MDX content.
- Review answers update FSRS state.
- IndexedDB keeps progress after reload.
- Cram mode continues indefinitely.
- The UI is usable on a phone viewport.
