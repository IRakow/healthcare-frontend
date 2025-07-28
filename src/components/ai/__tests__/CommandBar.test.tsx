import { render, screen, fireEvent } from '@testing-library/react'
import { CommandBar } from '../CommandBar'
import { vi } from 'vitest'

// Mock the hooks
vi.mock('@/hooks/useAICommand', () => ({
  useAICommand: () => ({
    runCommand: vi.fn().mockResolvedValue({ response: 'Test response' })
  })
}))

vi.mock('@/hooks/useSpeechRecognition', () => ({
  useSpeechRecognition: () => ({
    transcript: '',
    listening: false,
    startListening: vi.fn(),
    stopListening: vi.fn(),
    resetTranscript: vi.fn()
  })
}))

vi.mock('@/hooks/useTextToSpeech', () => ({
  useTextToSpeech: () => ({
    speak: vi.fn()
  })
}))

describe('CommandBar', () => {
  it('renders command bar with input and buttons', () => {
    render(<CommandBar />)
    
    expect(screen.getByPlaceholderText('Ask me anything...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mic/i })).toBeInTheDocument()
  })

  it('handles text submission', async () => {
    const { runCommand } = await import('@/hooks/useAICommand')
    const mockRunCommand = vi.mocked(runCommand)
    
    render(<CommandBar />)
    
    const input = screen.getByPlaceholderText('Ask me anything...')
    const sendButton = screen.getByRole('button', { name: /send/i })
    
    fireEvent.change(input, { target: { value: 'Test command' } })
    fireEvent.click(sendButton)
    
    expect(mockRunCommand).toHaveBeenCalledWith('Test command')
  })
})