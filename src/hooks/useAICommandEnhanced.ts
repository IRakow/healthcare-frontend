// Finalized: useAICommand Enhanced — Real-time AI Dispatcher
import { useUser } from '@/hooks/useUser'
import { supabase } from '@/lib/supabase'
import { createClient } from 'openai-edge'
import { useTextToSpeech } from '@/hooks/useTextToSpeech'
import { useSpinner } from '@/hooks/useSpinner'

const openai = createClient({ apiKey: process.env.PURITYHEALTHOPENAI })

export function useAICommand() {
  const { role, userId, name } = useUser()
  const { speak } = useTextToSpeech()
  const { showSpinner, hideSpinner, switchSpinner } = useSpinner()

  const runCommand = async (input: string): Promise<{ response: string }> => {
    let response = 'Processing your request...'

    try {
      showSpinner('ai-processing')

      const { choices } = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an AI dispatcher. Given a user input, return ONLY a JSON object like:
            { action: string, payload: any }
            User name: ${name || 'unknown'}, Role: ${role}.
            If input is a question, use { action: 'askQuestion', payload: { topic } }.`
          },
          { role: 'user', content: input },
        ],
        temperature: 0,
      })

      const parsed = JSON.parse(choices[0]?.message?.content || '{}')

      // Patient Actions
      if (role === 'patient') {
        switch (parsed.action) {
          case 'logFood':
            await supabase.from('food_logs').insert({
              description: parsed.payload.description,
              patient_id: userId,
            })
            response = `✅ Meal logged: ${parsed.payload.description}`
            break
          case 'addMedication':
            await supabase.from('medications').insert({
              ...parsed.payload,
              patient_id: userId,
            })
            response = `💊 Medication added.`
            break
          case 'bookAppointment':
            await supabase.from('appointments').insert({
              patient_id: userId,
              ...parsed.payload,
            })
            response = `📅 Appointment request received.`
            break
          case 'askQuestion':
            response = `🤖 Here's what I found about: ${parsed.payload.topic}`
            break
          default:
            response = `⚠️ I'm not sure how to help with that.`
        }
      }

      // Admin/Owner Actions
      else if (role === 'admin' || role === 'owner') {
        if (parsed.action === 'exportInvoices') {
          response = '📤 Exporting invoice data now.'
        } else {
          response = '🗂️ Command received and logged.'
        }
      } else {
        response = '🚫 This action is not available to your role.'
      }

      await supabase.from('conversation_insights').insert({
        user_id: userId,
        role,
        input,
        response,
      })

      speak(response)
    } catch (err) {
      response = '⚠️ Something went wrong while processing your request.'
    } finally {
      switchSpinner('ai-processing', 'check')
      hideSpinner('ai-processing')
    }

    return { response }
  }

  return { runCommand }
}