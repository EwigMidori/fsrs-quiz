import {
  Rating,
  State,
  createEmptyCard,
  fsrs,
  type Grade,
  type Card,
  type CardInput,
} from 'ts-fsrs'

import type { Deck, SessionMode, StoredCardState } from '@/lib/types'

const scheduler = fsrs({
  request_retention: 0.9,
  maximum_interval: 36500,
  enable_fuzz: false,
  enable_short_term: true,
})

export const ratingOrder = [
  Rating.Again,
  Rating.Hard,
  Rating.Good,
  Rating.Easy,
] as const

export function makeProgressKey(deckId: string, cardId: string) {
  return `${deckId}::${cardId}`
}

function toStoredCard(card: Card): StoredCardState {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review ? card.last_review.toISOString() : null,
  }
}

function fromStoredCard(
  stored?: StoredCardState,
  now = new Date(),
): CardInput | Card {
  if (!stored) {
    return createEmptyCard(now)
  }

  return {
    due: stored.due,
    stability: stored.stability,
    difficulty: stored.difficulty,
    elapsed_days: stored.elapsed_days,
    scheduled_days: stored.scheduled_days,
    learning_steps: stored.learning_steps,
    reps: stored.reps,
    lapses: stored.lapses,
    state: stored.state,
    last_review: stored.last_review,
  }
}

export function isCardDue(stored: StoredCardState | undefined, now = new Date()) {
  if (!stored) {
    return true
  }

  return new Date(stored.due).getTime() <= now.getTime()
}

export function buildSessionQueue(
  deck: Deck,
  progress: Record<string, StoredCardState>,
  mode: SessionMode,
  now = new Date(),
) {
  const orderedCards = deck.cards
    .map((card) => {
      const progressKey = makeProgressKey(deck.id, card.id)
      const stored = progress[progressKey]

      return {
        id: card.id,
        topic: card.topic,
        reps: stored?.reps ?? 0,
        dueAt: stored ? new Date(stored.due).getTime() : now.getTime(),
        due: isCardDue(stored, now),
      }
    })
    .sort(
      (left, right) =>
        left.dueAt - right.dueAt ||
        left.reps - right.reps ||
        left.topic.localeCompare(right.topic, 'zh-CN'),
    )

  if (mode === 'cram') {
    return orderedCards.map((card) => card.id)
  }

  return orderedCards.filter((card) => card.due).map((card) => card.id)
}

export function reviewCard(
  stored: StoredCardState | undefined,
  rating: Grade,
  now = new Date(),
) {
  const result = scheduler.next(fromStoredCard(stored, now), now, rating)

  return toStoredCard(result.card)
}

export function previewRatings(
  stored: StoredCardState | undefined,
  now = new Date(),
) {
  const preview = scheduler.repeat(fromStoredCard(stored, now), now)

  return {
    [Rating.Again]: toStoredCard(preview[Rating.Again].card),
    [Rating.Hard]: toStoredCard(preview[Rating.Hard].card),
    [Rating.Good]: toStoredCard(preview[Rating.Good].card),
    [Rating.Easy]: toStoredCard(preview[Rating.Easy].card),
  }
}

export function isMatureCard(stored: StoredCardState | undefined) {
  if (!stored) {
    return false
  }

  return stored.state === State.Review && stored.scheduled_days >= 14
}
