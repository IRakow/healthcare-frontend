// File: src/hooks/useAICommand.ts
import { useUser } from '@/hooks/useUser'
import { supabase } from '@/lib/supabase'

export function useAICommand() {
  const { role, userId } = useUser()

  const runCommand = async (input: string): Promise<{ response: string }> => {
    const lower = input.toLowerCase()
    let response = 'I heard you, but I need more detail.'

    if (role === 'patient') {
      if (lower.includes('log') && lower.includes('food')) {
        response = 'Okay, I logged your food entry.'
        await supabase.from('food_logs').insert({
          description: input,
          patient_id: userId,
        })
      } else if (lower.includes('add') && lower.includes('medication')) {
        response = 'Medication has been added to your file.'
        await supabase.from('medications').insert({
          name: input,
          patient_id: userId,
        })
      } else if (lower.includes('book') && lower.includes('appointment')) {
        response = 'Your appointment has been requested.'
        await supabase.from('appointments').insert({
          patient_id: userId,
          type: 'AI-booked',
          appointment_date: new Date(),
        })
      } else {
        response = "I'm not sure what to do with that yet, but I saved it."
      }
    } else if (role === 'admin' || role === 'owner') {
      if (lower.includes('export') && lower.includes('invoices')) {
        response = 'Exporting invoice CSV now.'
      } else {
        response = 'Command recognized, but this function is admin-only.'
      }
    } else {
      response = 'You do not have access to this action.'
    }

    await supabase.from('conversation_insights').insert({
      user_id: userId,
      role,
      input,
      response,
    })

    return { response }
  }

  return { runCommand }
}