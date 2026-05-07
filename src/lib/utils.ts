import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import type { SessionMode } from '@/lib/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatModeLabel(mode: SessionMode) {
  return mode === 'cram' ? '无尽冲刺' : 'FSRS 正常复习'
}

export function formatAccuracy(correctCount: number, answeredCount: number) {
  if (!answeredCount) {
    return '0%'
  }

  return `${Math.round((correctCount / answeredCount) * 100)}%`
}

export function formatReviewDistance(targetIso: string, from = new Date()) {
  const diff = new Date(targetIso).getTime() - from.getTime()
  const absDiff = Math.abs(diff)
  const minute = 60_000
  const hour = minute * 60
  const day = hour * 24

  if (absDiff < minute) {
    return diff >= 0 ? '即刻' : '刚刚'
  }

  if (absDiff < hour) {
    return `${Math.round(diff / minute)}m`
  }

  if (absDiff < day) {
    return `${Math.round(diff / hour)}h`
  }

  return `${Math.round(diff / day)}d`
}

export function formatLastSeen(targetIso: string | null) {
  if (!targetIso) {
    return '未复习'
  }

  const diff = new Date(targetIso).getTime() - Date.now()
  if (diff >= 0) {
    return '刚刚'
  }

  const absolute = formatReviewDistance(targetIso)
  return absolute.startsWith('-') ? `${absolute.slice(1)} 前` : `${absolute} 前`
}
