import { ActionSuggestor } from './ActionSuggestor'

let timeout: NodeJS.Timeout | null = null

export const RachelAfterAction = {
  init(delay = 4000) {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      ActionSuggestor.suggest()
    }, delay)
  },
  cancel() {
    if (timeout) clearTimeout(timeout)
    timeout = null
  }
}