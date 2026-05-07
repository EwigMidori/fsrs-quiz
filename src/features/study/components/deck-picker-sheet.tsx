import { Check, Layers3, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { MetricCard } from './metric-card'
import type { DeckStatsEntry } from '../lib/deck-stats'
import { formatDeckSource } from '../lib/deck-stats'

export function DeckPickerSheet({
  open,
  deckStats,
  selectedDeckId,
  onClose,
  onSelect,
}: {
  open: boolean
  deckStats: DeckStatsEntry[]
  selectedDeckId: string | null
  onClose: () => void
  onSelect: (deckId: string) => void
}) {
  if (!open) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(12,10,9,0.28)] px-4 pb-4 pt-14 sm:items-center sm:px-6"
      data-testid="deck-picker"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="关闭卡册弹窗"
        onClick={onClose}
      />

      <Card className="relative z-10 max-h-[78svh] w-full max-w-3xl overflow-hidden">
        <CardHeader className="border-b border-[color:var(--hairline)] bg-white/80">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <Badge>
                <Layers3 className="mr-1 size-3.5" />
                卡册
              </Badge>
              <CardTitle className="text-[1.6rem]">选择当前卡册</CardTitle>
              <CardDescription>
                首页只保留当前卡册。这里负责切换，不在首页铺满所有 deck。
              </CardDescription>
            </div>

            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="size-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="max-h-[60svh] space-y-3 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          {deckStats.map(({ deck, stats }) => {
            const selected = deck.id === selectedDeckId

            return (
              <button
                key={deck.id}
                type="button"
                data-testid={`deck-card-${deck.id}`}
                className={cn(
                  'w-full rounded-[1.65rem] border px-4 py-4 text-left transition-colors',
                  selected
                    ? 'border-[color:var(--ink)]/18 bg-white shadow-[0_18px_60px_rgba(12,10,9,0.08)]'
                    : 'border-[color:var(--hairline)] bg-[color:var(--canvas-soft)]/70 hover:bg-white/85',
                )}
                onClick={() => {
                  onSelect(deck.id)
                  onClose()
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{deck.fileName}</Badge>
                      {selected ? (
                        <Badge className="border-transparent bg-[color:var(--surface-strong)] text-[color:var(--body-strong)]">
                          当前
                        </Badge>
                      ) : null}
                    </div>
                    <div className="font-display text-[1.45rem] font-light tracking-[-0.03em] text-[color:var(--ink)]">
                      {deck.name}
                    </div>
                    <div className="text-sm leading-6 text-[color:var(--body)]">
                      {formatDeckSource(deck)}
                    </div>
                  </div>

                  <div
                    className={cn(
                      'grid size-10 shrink-0 place-items-center rounded-full border',
                      selected
                        ? 'border-[color:var(--ink)] bg-[color:var(--ink)] text-white'
                        : 'border-[color:var(--hairline-strong)] bg-white text-[color:var(--muted)]',
                    )}
                  >
                    <Check className="size-4" />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 sm:max-w-md">
                  <MetricCard label="到期" value={stats.dueCount} />
                  <MetricCard label="新卡" value={stats.newCount} />
                  <MetricCard label="总量" value={stats.total} />
                </div>
              </button>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
