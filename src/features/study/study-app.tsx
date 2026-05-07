import { useEffect, useMemo, useState } from 'react'
import { Layers3, Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { deckCatalog } from '@/lib/decks'
import { makeProgressKey, previewRatings } from '@/lib/fsrs'
import type { SessionMode } from '@/lib/types'
import { formatReviewDistance } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'

import { DeckPickerSheet } from './components/deck-picker-sheet'
import { HomeScreen } from './components/home-screen'
import { ReviewScreen } from './components/review-screen'
import { buildDeckStatsEntries } from './lib/deck-stats'

export function StudyApp() {
  const [hydrated, setHydrated] = useState(() => useAppStore.persist.hasHydrated())
  const [deckPickerOpen, setDeckPickerOpen] = useState(false)

  const decks = useAppStore((state) => state.decks)
  const selectedDeckId = useAppStore((state) => state.selectedDeckId)
  const progress = useAppStore((state) => state.progress)
  const session = useAppStore((state) => state.session)
  const setDecks = useAppStore((state) => state.setDecks)
  const selectDeck = useAppStore((state) => state.selectDeck)
  const startSession = useAppStore((state) => state.startSession)
  const revealAnswer = useAppStore((state) => state.revealAnswer)
  const gradeCurrentCard = useAppStore((state) => state.gradeCurrentCard)
  const clearSession = useAppStore((state) => state.clearSession)

  useEffect(() => {
    setDecks(deckCatalog)

    const unsubscribeHydrate = useAppStore.persist.onHydrate(() => {
      setHydrated(false)
    })
    const unsubscribeFinish = useAppStore.persist.onFinishHydration(() => {
      setHydrated(true)
    })

    return () => {
      unsubscribeHydrate()
      unsubscribeFinish()
    }
  }, [setDecks])

  const selectedDeck = useMemo(
    () => decks.find((deck) => deck.id === selectedDeckId) ?? decks[0] ?? null,
    [decks, selectedDeckId],
  )

  const deckStats = useMemo(
    () => buildDeckStatsEntries(decks, progress),
    [decks, progress],
  )

  const selectedEntry = useMemo(
    () =>
      deckStats.find(({ deck }) => deck.id === selectedDeck?.id) ??
      (selectedDeck && deckStats.length ? deckStats[0] : null),
    [deckStats, selectedDeck],
  )

  const sessionDeck = useMemo(
    () => (session ? decks.find((deck) => deck.id === session.deckId) ?? null : null),
    [decks, session],
  )

  const activeDeck = sessionDeck ?? selectedDeck

  const currentCard = useMemo(() => {
    if (!session || session.finishedAt || session.queue.length === 0 || !sessionDeck) {
      return null
    }

    return sessionDeck.cards.find((card) => card.id === session.queue[0]) ?? null
  }, [session, sessionDeck])

  const currentProgress = useMemo(() => {
    if (!currentCard || !activeDeck) {
      return undefined
    }

    return progress[makeProgressKey(activeDeck.id, currentCard.id)]
  }, [activeDeck, currentCard, progress])

  const previewBase = new Date()
  const currentPreview = currentCard
    ? previewRatings(currentProgress, previewBase)
    : null
  const currentDue = currentProgress
    ? formatReviewDistance(currentProgress.due, previewBase)
    : '新卡'

  if (!hydrated) {
    return (
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <Badge>加载中</Badge>
            <CardTitle>正在准备卡册</CardTitle>
            <CardDescription>IndexedDB 和 deck 文件正在同步到本地。</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!decks.length) {
    return (
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <Badge>空状态</Badge>
            <CardTitle>没有可用卡册</CardTitle>
            <CardDescription>
              请在 `decks/` 目录放入至少一个 deck `JSON` 或 `JSONL` 文件。
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[4%] top-[8%] h-40 w-40 rounded-full bg-[rgba(167,229,211,0.36)] blur-3xl" />
        <div className="absolute right-[8%] top-[12%] h-52 w-52 rounded-full bg-[rgba(244,197,168,0.32)] blur-3xl" />
        <div className="absolute bottom-[8%] right-[16%] h-60 w-60 rounded-full bg-[rgba(200,184,224,0.30)] blur-3xl" />
      </div>

      <DeckPickerSheet
        open={deckPickerOpen}
        deckStats={deckStats}
        selectedDeckId={selectedDeck?.id ?? null}
        onClose={() => setDeckPickerOpen(false)}
        onSelect={selectDeck}
      />

      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-8 pt-4 sm:px-6">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-full bg-[color:var(--ink)] text-white shadow-editorial">
              <Sparkles className="size-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--muted)]">
                Examhacker
              </div>
              <div className="font-display text-2xl font-light tracking-[-0.03em] text-[color:var(--ink)]">
                FSRS 闪卡
              </div>
            </div>
          </div>

          <Badge className="hidden sm:inline-flex">
            <Layers3 className="mr-1 size-3.5" />
            {decks.length} 个卡册
          </Badge>
        </header>

        <main className="mt-6 flex-1">
          {!session || session.finishedAt ? (
            <HomeScreen
              selectedDeck={selectedDeck}
              selectedStats={selectedEntry?.stats ?? null}
              decksCount={decks.length}
              session={session}
              sessionDeckName={sessionDeck?.name ?? null}
              onOpenDeckPicker={() => setDeckPickerOpen(true)}
              onStartSession={(deckId, mode: SessionMode) => startSession(deckId, mode)}
              onClearSession={clearSession}
            />
          ) : currentCard && activeDeck ? (
            <ReviewScreen
              activeDeck={activeDeck}
              currentCard={currentCard}
              session={session}
              currentPreview={currentPreview}
              previewBase={previewBase}
              currentDue={currentDue}
              onExit={clearSession}
              onRevealAnswer={revealAnswer}
              onGradeCurrentCard={gradeCurrentCard}
            />
          ) : null}
        </main>
      </div>
    </div>
  )
}

export default StudyApp
