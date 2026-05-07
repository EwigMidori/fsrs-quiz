import { Rating } from 'ts-fsrs'
import type { Grade } from 'ts-fsrs'

import { formatReviewDistance } from '@/lib/utils'
import type { StoredCardState } from '@/lib/types'

export type ReviewPreview = Record<Grade, StoredCardState>

export interface RatingOption {
  rating: Grade
  label: string
  helper: string
  interval: string
  shortcut: string
  className: string
}

export const ratingShortcutMap: Record<string, Grade> = {
  Digit1: Rating.Again,
  Digit2: Rating.Hard,
  Digit3: Rating.Good,
  Digit4: Rating.Easy,
  Numpad1: Rating.Again,
  Numpad2: Rating.Hard,
  Numpad3: Rating.Good,
  Numpad4: Rating.Easy,
  '1': Rating.Again,
  '2': Rating.Hard,
  '3': Rating.Good,
  '4': Rating.Easy,
}

export function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  const tagName = target.tagName

  return (
    target.isContentEditable ||
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT'
  )
}

export function getShortcutRating(code: string, key: string): Grade | null {
  return ratingShortcutMap[code] ?? ratingShortcutMap[key] ?? null
}

export function buildRatingOptions(
  preview: ReviewPreview | null,
  previewBase: Date,
): RatingOption[] {
  if (!preview) {
    return []
  }

  return [
    {
      rating: Rating.Again,
      label: '重来',
      helper: '立即回炉',
      interval: formatReviewDistance(preview[Rating.Again].due, previewBase),
      shortcut: '1',
      className:
        'border-rose-200 bg-[rgba(232,184,196,0.24)] text-[#5f1d31] hover:bg-[rgba(232,184,196,0.38)]',
    },
    {
      rating: Rating.Hard,
      label: '困难',
      helper: '压缩间隔',
      interval: formatReviewDistance(preview[Rating.Hard].due, previewBase),
      shortcut: '2',
      className:
        'border-amber-200 bg-[rgba(244,197,168,0.28)] text-[#6b3d0f] hover:bg-[rgba(244,197,168,0.4)]',
    },
    {
      rating: Rating.Good,
      label: '记住',
      helper: '按计划推进',
      interval: formatReviewDistance(preview[Rating.Good].due, previewBase),
      shortcut: '3',
      className:
        'border-[color:var(--ink)] bg-[color:var(--ink)] text-white hover:bg-[color:var(--primary-active)]',
    },
    {
      rating: Rating.Easy,
      label: '熟练',
      helper: '拉长间隔',
      interval: formatReviewDistance(preview[Rating.Easy].due, previewBase),
      shortcut: '4',
      className:
        'border-emerald-200 bg-[rgba(167,229,211,0.32)] text-[#124437] hover:bg-[rgba(167,229,211,0.46)]',
    },
  ]
}
