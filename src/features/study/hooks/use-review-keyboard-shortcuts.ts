import { useEffect } from 'react'
import type { Grade } from 'ts-fsrs'

import { getShortcutRating, isEditableTarget } from '../lib/review-options'

export function useReviewKeyboardShortcuts({
  enabled,
  onRate,
}: {
  enabled: boolean
  onRate: (rating: Grade) => void
}) {
  useEffect(() => {
    if (!enabled) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.repeat ||
        event.isComposing ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        isEditableTarget(event.target)
      ) {
        return
      }

      const rating = getShortcutRating(event.code, event.key)

      if (!rating) {
        return
      }

      event.preventDefault()
      onRate(rating)
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, onRate])
}
