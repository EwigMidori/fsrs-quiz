import { cn, formatAccuracy } from '@/lib/utils'
import type { SessionMode } from '@/lib/types'

function SessionStat({
  label,
  value,
  testId,
  className,
}: {
  label: string
  value: string | number
  testId?: string
  className?: string
}) {
  return (
    <div
      data-testid={testId}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-[color:var(--hairline)] bg-white/75 px-3 py-1.5',
        className,
      )}
    >
      <div className="text-[9px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
        {label}
      </div>
      <div className="text-xs font-semibold text-[color:var(--ink)]">{value}</div>
    </div>
  )
}

function buildSessionSegments(
  mode: SessionMode,
  answeredCount: number,
  queueRemaining: number,
) {
  const segments = 12

  if (mode === 'normal') {
    const total = answeredCount + queueRemaining
    const filled = total ? Math.round((answeredCount / total) * segments) : 0

    return Array.from({ length: segments }, (_, index) => index < filled)
  }

  const active = answeredCount % segments

  return Array.from(
    { length: segments },
    (_, index) => answeredCount > 0 && index <= active,
  )
}

export function SessionVisualizer({
  mode,
  answeredCount,
  correctCount,
  queueRemaining,
  currentDue,
}: {
  mode: SessionMode
  answeredCount: number
  correctCount: number
  queueRemaining: number
  currentDue: string
}) {
  const segments = buildSessionSegments(mode, answeredCount, queueRemaining)

  return (
    <div className="rounded-[1.35rem] border border-[color:var(--hairline)] bg-[color:var(--canvas-soft)]/72 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <SessionStat
          label="正确率"
          value={formatAccuracy(correctCount, answeredCount)}
        />
        <SessionStat label="剩余" value={queueRemaining} testId="queue-remaining" />
        <SessionStat label="已答" value={answeredCount} className="hidden sm:inline-flex" />
        <SessionStat label="当前状态" value={currentDue} className="hidden sm:inline-flex" />
      </div>

      <div className="mt-3 flex gap-1.5" aria-hidden="true">
        {segments.map((active, index) => (
          <div
            key={index}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              active
                ? 'bg-[color:var(--ink)]'
                : 'bg-[color:var(--hairline)]',
            )}
          />
        ))}
      </div>

      <p className="mt-2 hidden text-[11px] leading-5 text-[color:var(--muted)] sm:block">
        {mode === 'cram'
          ? '无尽模式会把答过的卡重新放回队尾，只改变出题顺序，不丢掉 FSRS 调度结果。'
          : '正常模式只展示到期卡，把注意力留给当前这道题。'}
      </p>
    </div>
  )
}
