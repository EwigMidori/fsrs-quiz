import { ArrowLeft } from 'lucide-react'
import type { Grade } from 'ts-fsrs'

import { MdxContent } from '@/components/mdx-content'
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
import type { Deck, Flashcard, StudySession } from '@/lib/types'
import { cn, formatModeLabel } from '@/lib/utils'

import { SessionVisualizer } from './session-visualizer'
import {
  buildRatingOptions,
  type ReviewPreview,
} from '../lib/review-options'
import { useReviewKeyboardShortcuts } from '../hooks/use-review-keyboard-shortcuts'

export function ReviewScreen({
  activeDeck,
  currentCard,
  session,
  currentPreview,
  previewBase,
  currentDue,
  onExit,
  onRevealAnswer,
  onGradeCurrentCard,
}: {
  activeDeck: Deck
  currentCard: Flashcard
  session: StudySession
  currentPreview: ReviewPreview | null
  previewBase: Date
  currentDue: string
  onExit: () => void
  onRevealAnswer: () => void
  onGradeCurrentCard: (rating: Grade) => void
}) {
  const ratingOptions = buildRatingOptions(currentPreview, previewBase)

  useReviewKeyboardShortcuts({
    enabled: session.revealed && ratingOptions.length > 0,
    onRate: onGradeCurrentCard,
  })

  const queueRemaining = session.queue.length

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <header className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="icon" onClick={onExit}>
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex flex-1 flex-wrap items-center justify-center gap-2">
          <Badge>{activeDeck.name}</Badge>
          <Badge>{formatModeLabel(session.mode)}</Badge>
        </div>
        <Button variant="outline" size="sm" onClick={onExit}>
          结束
        </Button>
      </header>

      <Card className="overflow-hidden">
        <CardHeader className="space-y-3 border-b border-[color:var(--hairline)] bg-white/50 p-5 sm:space-y-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{currentCard.topic}</Badge>
                <Badge className="border-transparent bg-[color:var(--surface-strong)] text-[color:var(--body-strong)]">
                  {session.revealed ? '已翻面' : '题面'}
                </Badge>
                {currentCard.tags.slice(0, 1).map((tag) => (
                  <Badge
                    key={tag}
                    className="border-transparent bg-white text-[color:var(--body-strong)]"
                  >
                    {tag}
                  </Badge>
                ))}
                {currentCard.tags.slice(1, 3).map((tag) => (
                  <Badge
                    key={tag}
                    className="hidden border-transparent bg-white text-[color:var(--body-strong)] sm:inline-flex"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <CardTitle className="max-w-3xl text-[1.35rem] leading-tight sm:text-[1.9rem]">
                {currentCard.topic}
              </CardTitle>
              <CardDescription className="hidden text-sm leading-7 sm:block">
                先答题，再看进度。评分按钮颜色和 1-4 编号已经区分，电脑上也可直接按 1-4。
              </CardDescription>
            </div>

            <div className="rounded-full border border-[color:var(--hairline)] bg-white/75 px-3 py-2 text-right">
              <div className="text-[9px] uppercase tracking-[0.2em] text-[color:var(--muted)]">
                下一次
              </div>
              <div className="mt-1 text-sm font-semibold text-[color:var(--ink)]">
                {currentDue}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-4 sm:space-y-5 sm:pt-6">
          <div className="rounded-[1.75rem] border border-[color:var(--ink)]/8 bg-white px-4 py-4 shadow-[0_18px_60px_rgba(12,10,9,0.06)] sm:px-6 sm:py-5">
            <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.26em] text-[color:var(--muted)]">
              <span>题目</span>
              <span className="h-px flex-1 bg-[color:var(--hairline)]" />
            </div>
            <div data-testid="review-front">
              <MdxContent
                source={currentCard.front}
                className="text-[16px] leading-8 sm:text-[18px] sm:leading-8"
              />
            </div>
          </div>

          <SessionVisualizer
            mode={session.mode}
            answeredCount={session.answeredCount}
            correctCount={session.correctCount}
            queueRemaining={queueRemaining}
            currentDue={currentDue}
          />

          {session.revealed ? (
            <div
              className="rounded-[1.6rem] border border-[color:var(--hairline)] bg-white/82 px-4 py-4 sm:px-6 sm:py-5"
              data-testid="review-back"
            >
              <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-[color:var(--muted)]">
                <span>答案</span>
                <span className="h-px flex-1 bg-[color:var(--hairline)]" />
              </div>
              <MdxContent source={currentCard.back} className="text-[15px] leading-7 sm:text-[16px]" />
            </div>
          ) : (
            <div className="rounded-[1.6rem] border border-dashed border-[color:var(--hairline-strong)] bg-white/65 px-4 py-5 text-sm leading-7 text-[color:var(--body)]">
              先在心里作答，确认已经回忆过，再点“显示答案”。
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t border-[color:var(--hairline)] bg-white/50 p-3 sm:p-4">
          {!session.revealed ? (
            <Button
              size="lg"
              className="w-full"
              data-testid="reveal-answer"
              onClick={onRevealAnswer}
            >
              显示答案
            </Button>
          ) : (
            <div className="grid w-full grid-cols-4 gap-2 sm:grid-cols-2 sm:gap-3">
              {ratingOptions.map((item) => (
                <Button
                  key={item.rating}
                  variant="outline"
                  className={cn(
                    'h-auto min-h-[4.9rem] w-full flex-col items-center justify-start rounded-[1.2rem] border px-2 py-2 text-center shadow-none sm:min-h-20 sm:items-start sm:rounded-[1.5rem] sm:px-4 sm:py-3 sm:text-left',
                    item.className,
                  )}
                  data-testid={`rate-${item.rating}`}
                  onClick={() => onGradeCurrentCard(item.rating)}
                >
                  <div className="flex w-full items-center justify-between gap-2 sm:items-start sm:justify-between sm:gap-3">
                    <span className="text-[12px] font-semibold sm:text-sm">{item.label}</span>
                    <span className="inline-flex min-w-6 items-center justify-center rounded-full border border-current/20 bg-white/55 px-1.5 py-1 text-[10px] font-semibold leading-none text-current shadow-sm sm:min-w-7 sm:px-2 sm:text-[11px]">
                      {item.shortcut}
                    </span>
                  </div>
                  <span className="hidden text-[10px] font-medium tracking-[0.1em] text-current/75 sm:block sm:text-[11px] sm:tracking-[0.12em]">
                    {item.helper}
                  </span>
                  <span className="mt-auto text-[10px] tracking-[0.08em] text-current/60 sm:text-[11px] sm:tracking-[0.2em]">
                    {item.interval}
                  </span>
                </Button>
              ))}
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
