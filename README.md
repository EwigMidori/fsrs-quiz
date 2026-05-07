# Examhacker

Mobile-first FSRS flashcards for exam cramming.

Examhacker is a React + TypeScript + Vite web app for studying structured decks stored as JSON or JSONL files. Cards are rendered as MDX, support inline/block formulas, and persist review state locally with IndexedDB. Normal mode follows FSRS due dates; cram mode ignores due dates and keeps cycling cards indefinitely.

## Features

- FSRS scheduling with normal and endless cram modes
- MDX-powered card content
- KaTeX-ready `InlineFormula` and `BlockFormula` content
- Multi-deck loading from `decks/**/*.json` and `decks/**/*.jsonl`
- IndexedDB persistence for review state and study history
- Mobile-first UI

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- `ts-fsrs`
- `@mdx-js/mdx`
- KaTeX

## Quick Start

```bash
npm install
npm run dev
```

Open the local Vite URL in your browser.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run validate:mdx
npm run preview
```

`npm run validate:mdx` checks:

- deck JSON / JSONL structure
- MDX syntax in every `front` and `back`
- KaTeX syntax inside every `InlineFormula` and `BlockFormula`

## Deck Format

Decks are discovered recursively from `decks/` and may use `.json` or `.jsonl`.

```json
{
  "deck_name": "focus",
  "language": "zh-CN",
  "source": "notes.md",
  "cards": [
    {
      "id": "card_01",
      "topic": "CAPM",
      "tags": ["finance", "pricing"],
      "front": "若 <InlineFormula>R_f = 3\\%</InlineFormula>，CAPM 公式是什么？",
      "back": "<BlockFormula>E(R_i) = R_f + \\beta_i(E(R_m)-R_f)</BlockFormula>"
    }
  ]
}
```

`JSONL` decks store one card object per non-empty line and use the file path as the deck identity. Example:

```jsonl
{"id":"card_01","topic":"CAPM","tags":["finance"],"front":"CAPM 公式是什么？","back":"<BlockFormula>E(R_i) = R_f + \\beta_i(E(R_m)-R_f)</BlockFormula>"}
{"id":"card_02","topic":"Sharpe ratio","tags":["finance"],"front":"Sharpe ratio 衡量什么？","back":"风险调整后收益。"}
```

## Project Structure

```text
src/                  app source
decks/                local study decks
docs/spec.md          product spec
DESIGN.md             visual direction
scripts/validate-mdx.mjs
```

## Publishing Notes

- The codebase is ready to publish as an open-source repository.
- Before making the repository public, review any deck content under `decks/` and any local source notes you used to build those decks to ensure you have redistribution rights for that material.
- Repository metadata fields such as `repository`, `homepage`, and `bugs` are intentionally left unset until you know the final GitHub URL.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Security

See [SECURITY.md](./SECURITY.md).

## License

MIT. See [LICENSE](./LICENSE).
