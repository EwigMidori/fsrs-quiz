# Contributing

## Setup

```bash
npm install
npm run dev
```

## Before Opening a PR

Run the local checks:

```bash
npm run lint
npm run build
npm run validate:mdx
```

## Deck Content

- Decks live in `decks/*.json`.
- `front` and `back` are MDX strings.
- Formulas should be wrapped with `InlineFormula` or `BlockFormula`.
- Run `npm run validate:mdx` after editing any deck.

## Scope

- Keep changes focused.
- Do not commit secrets, local environment files, or generated build artifacts.
- If you add external content to decks, make sure you have redistribution rights.

## Style

- TypeScript + React only
- Follow the existing Tailwind and component patterns
- Prefer small, reviewable patches over broad refactors
