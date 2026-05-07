import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { Rating, type Grade } from 'ts-fsrs'

import { buildSessionQueue, makeProgressKey, reviewCard } from '@/lib/fsrs'
import { indexedDbStorage } from '@/lib/storage'
import type { Deck, SessionMode, StoredCardState, StudyEvent, StudySession } from '@/lib/types'

interface AppStore {
  decks: Deck[]
  selectedDeckId: string | null
  progress: Record<string, StoredCardState>
  history: StudyEvent[]
  session: StudySession | null
  setDecks: (decks: Deck[]) => void
  selectDeck: (deckId: string) => void
  startSession: (deckId: string, mode: SessionMode) => void
  revealAnswer: () => void
  gradeCurrentCard: (rating: Grade) => void
  clearSession: () => void
}

const MAX_HISTORY = 300

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      decks: [],
      selectedDeckId: null,
      progress: {},
      history: [],
      session: null,
      setDecks: (decks) =>
        set((state) => ({
          decks,
          selectedDeckId:
            decks.some((deck) => deck.id === state.selectedDeckId)
              ? state.selectedDeckId
              : decks[0]?.id ?? null,
        })),
      selectDeck: (deckId) =>
        set((state) => {
          const deckExists = state.decks.some((deck) => deck.id === deckId)

          return {
            selectedDeckId: deckExists ? deckId : state.selectedDeckId,
          }
        }),
      startSession: (deckId, mode) => {
        const { decks, progress } = get()
        const deck = decks.find((item) => item.id === deckId)

        if (!deck) {
          return
        }

        const now = new Date()
        const queue = buildSessionQueue(deck, progress, mode, now)

        set({
          selectedDeckId: deckId,
          session: {
            deckId,
            mode,
            queue,
            revealed: false,
            answeredCount: 0,
            correctCount: 0,
            startedAt: now.toISOString(),
            finishedAt: queue.length === 0 ? now.toISOString() : null,
          },
        })
      },
      revealAnswer: () =>
        set((state) => {
          if (!state.session) {
            return state
          }

          return {
            session: {
              ...state.session,
              revealed: true,
            },
          }
        }),
      gradeCurrentCard: (rating) =>
        set((state) => {
          if (!state.session || state.session.finishedAt || state.session.queue.length === 0) {
            return state
          }

          const deck = state.decks.find((item) => item.id === state.session?.deckId)
          const currentCardId = state.session.queue[0]

          if (!deck) {
            return state
          }

          const progressKey = makeProgressKey(deck.id, currentCardId)
          const now = new Date()
          const nextProgress = reviewCard(state.progress[progressKey], rating, now)
          const remainingQueue = state.session.queue.slice(1)
          const nextQueue =
            state.session.mode === 'cram'
              ? [...remainingQueue, currentCardId]
              : remainingQueue
          const finishedAt =
            state.session.mode === 'normal' && nextQueue.length === 0
              ? now.toISOString()
              : null

          return {
            progress: {
              ...state.progress,
              [progressKey]: nextProgress,
            },
            history: [
              {
                deckId: deck.id,
                cardId: currentCardId,
                mode: state.session.mode,
                rating,
                reviewedAt: now.toISOString(),
                dueAt: nextProgress.due,
              },
              ...state.history,
            ].slice(0, MAX_HISTORY),
            session: {
              ...state.session,
              queue: nextQueue,
              revealed: false,
              answeredCount: state.session.answeredCount + 1,
              correctCount:
                state.session.correctCount + (rating === Rating.Again ? 0 : 1),
              finishedAt,
            },
          }
        }),
      clearSession: () => set({ session: null }),
    }),
    {
      name: 'examhacker-store',
      version: 1,
      storage: createJSONStorage(() => indexedDbStorage),
      partialize: (state) => ({
        selectedDeckId: state.selectedDeckId,
        progress: state.progress,
        history: state.history,
        session: state.session,
      }),
    },
  ),
)
