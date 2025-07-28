import { useState } from 'react'

interface SpinnerState {
  [key: string]: boolean | 'check'
}

export function useSpinner() {
  const [spinners, setSpinners] = useState<SpinnerState>({})

  const showSpinner = (id: string) => {
    setSpinners(prev => ({ ...prev, [id]: true }))
  }

  const hideSpinner = (id: string) => {
    setSpinners(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const switchSpinner = (id: string, state: 'check') => {
    setSpinners(prev => ({ ...prev, [id]: state }))
  }

  const isSpinning = (id: string) => spinners[id] === true
  const isChecked = (id: string) => spinners[id] === 'check'

  return {
    showSpinner,
    hideSpinner,
    switchSpinner,
    isSpinning,
    isChecked,
    spinners
  }
}