import { supabase } from '@/lib/supabase'

export async function getEmployerSettings(employerId: string) {
  const { data, error } = await supabase
    .from('employer_settings')
    .select('*')
    .eq('employer_id', employerId)
    .single()
  if (error) console.error(error)
  return data
}

export async function updateVoice(employerId: string, voice: string) {
  const { error } = await supabase
    .from('employer_settings')
    .upsert({ employer_id: employerId, default_voice: voice }, { onConflict: 'employer_id' })
  if (error) console.error(error)
}

export async function updateFeatures(employerId: string, features: any) {
  const { error } = await supabase
    .from('employer_settings')
    .upsert({ employer_id: employerId, features }, { onConflict: 'employer_id' })
  if (error) console.error(error)
}