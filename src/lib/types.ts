import type { Rating, State } from 'ts-fsrs'

export type SessionMode = 'normal' | 'cram'

export interface Flashcard {
  id: string
  topic: string
  tags: string[]
  front: string
  back: string
}

export interface DeckFile {
  deck_name?: string
  language?: string
  source?: string
  cards?: Partial<Flashcard>[]
}

export interface Deck {
  id: string
  fileName: string
  name: string
  language: string
  source?: string
  cards: Flashcard[]
}

export interface StoredCardState {
  due: string
  stability: number
  difficulty: number
  elapsed_days: number
  scheduled_days: number
  learning_steps: number
  reps: number
  lapses: number
  state: State
  last_review: string | null
}

export interface StudyEvent {
  deckId: string
  cardId: string
  mode: SessionMode
  rating: Rating
  reviewedAt: string
  dueAt: string
}

export interface StudySession {
  deckId: string
  mode: SessionMode
  queue: string[]
  revealed: boolean
  answeredCount: number
  correctCount: number
  startedAt: string
  finishedAt: string | null
}
