import { isCardDue, isMatureCard, makeProgressKey } from '@/lib/fsrs'
import type { Deck, StoredCardState } from '@/lib/types'

export interface DeckStats {
  dueCount: number
  newCount: number
  matureCount: number
  latestReview: string | null
  total: number
}

export interface DeckStatsEntry {
  deck: Deck
  stats: DeckStats
}

export function getDeckStats(
  deck: Deck,
  progress: Record<string, StoredCardState>,
  now = new Date(),
): DeckStats {
  let dueCount = 0
  let newCount = 0
  let matureCount = 0
  let latestReview: string | null = null

  for (const card of deck.cards) {
    const stored = progress[makeProgressKey(deck.id, card.id)]

    if (!stored) {
      newCount += 1
      dueCount += 1
      continue
    }

    if (isCardDue(stored, now)) {
      dueCount += 1
    }

    if (isMatureCard(stored)) {
      matureCount += 1
    }

    if (stored.last_review && (!latestReview || stored.last_review > latestReview)) {
      latestReview = stored.last_review
    }
  }

  return {
    dueCount,
    newCount,
    matureCount,
    latestReview,
    total: deck.cards.length,
  }
}

export function buildDeckStatsEntries(
  decks: Deck[],
  progress: Record<string, StoredCardState>,
  now = new Date(),
): DeckStatsEntry[] {
  return decks.map((deck) => ({
    deck,
    stats: getDeckStats(deck, progress, now),
  }))
}

export function formatDeckSource(deck: Deck) {
  return deck.source ? `${deck.language} · ${deck.source}` : deck.language
}
