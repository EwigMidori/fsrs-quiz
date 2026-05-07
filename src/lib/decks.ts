import type { Deck, DeckFile, Flashcard } from '@/lib/types'

const deckModules = import.meta.glob('../../decks/*.json', {
  eager: true,
  import: 'default',
})

function sanitizeCard(card: Partial<Flashcard>, index: number): Flashcard {
  return {
    id: card.id?.trim() || `card_${index + 1}`,
    topic: card.topic?.trim() || `Card ${index + 1}`,
    tags: Array.isArray(card.tags) ? card.tags : [],
    front: card.front?.trim() || '',
    back: card.back?.trim() || '',
  }
}

function normalizeDeck(path: string, rawDeck: DeckFile): Deck {
  const fileName = path.split('/').pop()?.replace(/\.json$/, '') ?? 'deck'
  const cards = Array.isArray(rawDeck.cards)
    ? rawDeck.cards.map((card, index) => sanitizeCard(card, index))
    : []

  return {
    id: fileName,
    fileName,
    name: rawDeck.deck_name?.trim() || fileName,
    language: rawDeck.language?.trim() || 'zh-CN',
    source: rawDeck.source?.trim(),
    cards,
  }
}

export const deckCatalog = Object.entries(deckModules)
  .map(([path, rawDeck]) => normalizeDeck(path, rawDeck as DeckFile))
  .sort((left, right) => left.name.localeCompare(right.name, 'zh-CN'))
