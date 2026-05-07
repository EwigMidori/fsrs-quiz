import { Infinity as InfinityIcon, Layers3, TimerReset } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { Deck, SessionMode, StudySession } from '@/lib/types'
import {
  formatAccuracy,
  formatLastSeen,
  formatModeLabel,
} from '@/lib/utils'

import { MetricCard } from './metric-card'
import type { DeckStats } from '../lib/deck-stats'
import { formatDeckSource } from '../lib/deck-stats'

export function HomeScreen({
  selectedDeck,
  selectedStats,
  decksCount,
  session,
  sessionDeckName,
  onOpenDeckPicker,
  onStartSession,
  onClearSession,
}: {
  selectedDeck: Deck | null
  selectedStats: DeckStats | null
  decksCount: number
  session: StudySession | null
  sessionDeckName: string | null
  onOpenDeckPicker: () => void
  onStartSession: (deckId: string, mode: SessionMode) => void
  onClearSession: () => void
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {session?.finishedAt ? (
        <Card className="border-[color:var(--ink)]/12 bg-white/80">
          <CardHeader>
            <Badge>{formatModeLabel(session.mode)}</Badge>
            <CardTitle>本轮已完成</CardTitle>
            <CardDescription>
              {session.mode === 'cram'
                ? '这轮冲刺已经记账到 FSRS。你可以继续刷，也可以切回正常模式。'
                : '今天到期的卡已经处理完。若还想压缩记忆，可以继续开无尽冲刺。'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <MetricCard label="已答" value={session.answeredCount} />
            <MetricCard
              label="正确率"
              value={formatAccuracy(session.correctCount, session.answeredCount)}
            />
            <MetricCard label="卡册" value={sessionDeckName ?? session.deckId} />
          </CardContent>
          <CardFooter className="grid gap-2 border-t border-[color:var(--hairline)] bg-white/50 p-4 sm:grid-cols-2">
            <Button variant="outline" size="lg" className="w-full" onClick={onClearSession}>
              回到首页
            </Button>
            <Button
              size="lg"
              className="w-full"
              onClick={() => onStartSession(session.deckId, session.mode)}
            >
              再开一轮
            </Button>
          </CardFooter>
        </Card>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
        <Card className="order-2 overflow-hidden lg:order-1">
          <CardHeader className="space-y-4">
            <div className="hidden flex-wrap items-center gap-2 sm:flex">
              <Badge>Web Mobile</Badge>
              <Badge>MDX + KaTeX</Badge>
              <Badge>IndexedDB</Badge>
            </div>
            <CardTitle className="max-w-2xl text-[1.9rem] leading-none sm:text-[2.8rem]">
              只看当前卡册，开始前再决定模式。
            </CardTitle>
            <CardDescription className="max-w-2xl text-base leading-7">
              首页不再平铺所有 deck。先锁定一套卡册，再进入“今日复习”或“无尽冲刺”。
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="rounded-[1.8rem] border border-[color:var(--hairline)] bg-[color:var(--canvas-soft)] px-4 py-4 sm:px-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>当前卡册</Badge>
                    <Badge className="border-transparent bg-white text-[color:var(--body-strong)]">
                      {selectedDeck?.fileName}
                    </Badge>
                  </div>
                  <div className="font-display text-[1.8rem] font-light tracking-[-0.03em] text-[color:var(--ink)]">
                    {selectedDeck?.name}
                  </div>
                  <div className="text-sm leading-6 text-[color:var(--body)]">
                    {selectedDeck ? formatDeckSource(selectedDeck) : '未选择卡册'}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  data-testid="open-deck-picker"
                  onClick={onOpenDeckPicker}
                >
                  <Layers3 className="size-4" />
                  选择卡册
                </Button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MetricCard label="到期" value={selectedStats?.dueCount ?? 0} />
                <MetricCard label="新卡" value={selectedStats?.newCount ?? 0} />
                <MetricCard label="已熟" value={selectedStats?.matureCount ?? 0} />
                <MetricCard
                  label="最近"
                  value={formatLastSeen(selectedStats?.latestReview ?? null)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="order-1 overflow-hidden lg:order-2">
          <CardHeader>
            <Badge>开始学习</Badge>
            <CardTitle>{selectedDeck?.name ?? '未选择卡册'}</CardTitle>
            <CardDescription>
              正常模式只看到期卡。无尽模式继续循环整套卡册，但仍会写回 FSRS 结果。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                disabled={!selectedDeck || !selectedStats?.dueCount}
                data-testid={`start-normal-${selectedDeck?.id ?? 'none'}`}
                onClick={() => selectedDeck && onStartSession(selectedDeck.id, 'normal')}
              >
                <TimerReset className="size-4" />
                今日复习
              </Button>
              <Button
                size="lg"
                className="w-full"
                disabled={!selectedDeck}
                data-testid={`start-cram-${selectedDeck?.id ?? 'none'}`}
                onClick={() => selectedDeck && onStartSession(selectedDeck.id, 'cram')}
              >
                <InfinityIcon className="size-4" />
                无尽冲刺
              </Button>
            </div>
            <div className="rounded-[1.25rem] border border-[color:var(--hairline)] bg-white/70 px-4 py-4 text-sm leading-7 text-[color:var(--body)]">
              当前页只保留三件事：切卡册、今日复习、无尽冲刺。
            </div>
            <div className="hidden grid-cols-2 gap-3 sm:grid">
              <MetricCard label="卡册" value={decksCount} />
              <MetricCard label="平台" value="Web Mobile" />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
