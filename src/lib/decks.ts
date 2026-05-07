import type { Deck, DeckFile, Flashcard } from '@/lib/types'

const deckModules = import.meta.glob(['../../decks/**/*.json', '../../decks/**/*.jsonl'], {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

const DECK_EXTENSION_RE = /\.(json|jsonl)$/

function sanitizeCard(card: Partial<Flashcard>, index: number): Flashcard {
  return {
    id: card.id?.trim() || `card_${index + 1}`,
    topic: card.topic?.trim() || `Card ${index + 1}`,
    tags: Array.isArray(card.tags) ? card.tags : [],
    front: card.front?.trim() || '',
    back: card.back?.trim() || '',
  }
}

function formatDeckError(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

function getDeckPathParts(path: string) {
  const normalizedPath = path.replace(/\\/g, '/')
  const relativePath = normalizedPath.split('/decks/').pop() ?? normalizedPath
  const fileName = relativePath.replace(DECK_EXTENSION_RE, '')
  const baseName = fileName.split('/').pop() ?? 'deck'
  const extension = relativePath.endsWith('.jsonl') ? '.jsonl' : '.json'

  return {
    baseName,
    extension,
    fileName,
    relativePath,
  }
}

function parseJsonlDeck(rawSource: string, relativePath: string): DeckFile {
  const cards: Partial<Flashcard>[] = []
  const lines = rawSource.split(/\r?\n/)

  for (const [index, line] of lines.entries()) {
    const trimmed = line.trim()

    if (!trimmed) {
      continue
    }

    try {
      const card = JSON.parse(trimmed)

      if (!card || typeof card !== 'object' || Array.isArray(card)) {
        throw new Error('card line must be a JSON object')
      }

      cards.push(card as Partial<Flashcard>)
    } catch (error) {
      throw new Error(`${relativePath}:${index + 1}: JSONL parse failed\n${formatDeckError(error)}`, {
        cause: error,
      })
    }
  }

  return { cards }
}

function parseDeckSource(path: string, rawSource: string): DeckFile {
  const { extension, relativePath } = getDeckPathParts(path)

  if (extension === '.jsonl') {
    return parseJsonlDeck(rawSource, relativePath)
  }

  try {
    const parsed = JSON.parse(rawSource)

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('deck root must be an object')
    }

    return parsed as DeckFile
  } catch (error) {
    throw new Error(`${relativePath}: JSON parse failed\n${formatDeckError(error)}`, {
      cause: error,
    })
  }
}

function normalizeDeck(path: string, rawSource: string): Deck {
  const rawDeck = parseDeckSource(path, rawSource)
  const { baseName, fileName } = getDeckPathParts(path)
  const cards = Array.isArray(rawDeck.cards)
    ? rawDeck.cards.map((card, index) => sanitizeCard(card, index))
    : []

  return {
    id: fileName,
    fileName,
    name: rawDeck.deck_name?.trim() || baseName,
    language: rawDeck.language?.trim() || 'zh-CN',
    source: rawDeck.source?.trim(),
    cards,
  }
}

export const deckCatalog = Object.entries(deckModules)
  .map(([path, rawSource]) => normalizeDeck(path, rawSource))
  .sort(
    (left, right) =>
      left.name.localeCompare(right.name, 'zh-CN') ||
      left.fileName.localeCompare(right.fileName, 'zh-CN'),
  )
