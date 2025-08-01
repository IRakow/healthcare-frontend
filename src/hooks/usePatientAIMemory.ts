// src/hooks/usePatientAIMemory.ts

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function usePatientAIMemory(patientId: string) {
  const [memory, setMemory] = useState<any>({})

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('patient_ai_memory')
        .select('*')
        .eq('patient_id', patientId)
        .single()
      if (data?.memory) setMemory(JSON.parse(data.memory))
    }
    load()
  }, [patientId])

  const updateMemory = async (updates: any) => {
    const next = { ...memory, ...updates }
    setMemory(next)
    await supabase
      .from('patient_ai_memory')
      .upsert({ patient_id: patientId, memory: JSON.stringify(next) }, { onConflict: 'patient_id' })
  }

  return { memory, updateMemory }
}