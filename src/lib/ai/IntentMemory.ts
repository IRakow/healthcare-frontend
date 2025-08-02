interface IntentLog {
  timestamp: string
  prompt: string
  response: string
  success: boolean
  route?: string
}

let memory: IntentLog[] = []

export const IntentMemory = {
  log(prompt: string, response: string, success: boolean, route?: string) {
    memory.unshift({
      timestamp: new Date().toISOString(),
      prompt,
      response,
      success,
      route
    })
    memory = memory.slice(0, 20) // keep last 20
  },

  getLast(): IntentLog | null {
    return memory[0] || null
  },

  getRecent(n: number = 5): IntentLog[] {
    return memory.slice(0, n)
  },

  getPreviousRoute(): string | null {
    return memory.find(m => m.route)?.route || null
  }
}