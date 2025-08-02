import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function AdminAssistantBar({ onAsk }: { onAsk: (query: string) => void }) {
  const [query, setQuery] = useState('')

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (query.trim()) {
          onAsk(query)
          setQuery('')
        }
      }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
    >
      <div className="bg-white border rounded-xl shadow-lg flex items-center gap-2 px-4 py-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask Rachel anything..."
          className="flex-1 bg-transparent text-sm focus:outline-none"
        />
        <Button type="submit" variant="secondary" size="sm">Ask</Button>
      </div>
    </form>
  )
}