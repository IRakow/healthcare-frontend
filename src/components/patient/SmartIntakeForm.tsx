import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { AllergyEditor } from '@/components/patient/Allergies'
import { supabase } from '@/lib/supabase'
import { createAIChat } from '@/lib/openaiClient'
// @ts-ignore - react-speech-recognition doesn't have types
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

interface IntakeFormData {
  allergies: string
  medications: string
  conditions: string
  surgeries: string
  lifestyle: string
}

export const SmartIntakeForm = () => {
  const [form, setForm] = useState<IntakeFormData>({
    allergies: '',
    medications: '',
    conditions: '',
    surgeries: '',
    lifestyle: ''
  })
  
  const { transcript, listening, resetTranscript } = useSpeechRecognition()

  const handleChange = (field: keyof IntakeFormData, value: string) => {
    setForm(f => ({ ...f, [field]: value }))
  }
  
  const handleVoiceMedications = () => {
    resetTranscript()
    SpeechRecognition.startListening({ continuous: false })
  }
  
  useEffect(() => {
    if (!listening && transcript) {
      handleChange('medications', transcript)
    }
  }, [transcript, listening])

  const handleSubmit = async () => {
    const user = await supabase.auth.getUser()
    const patientId = user?.data.user?.id

    const { error } = await supabase.from('patient_intake_forms').insert({
      patient_id: patientId,
      data: JSON.stringify(form),
      submitted_at: new Date().toISOString()
    })

    if (error) {
      console.error('Error saving form:', error)
    } else {
      console.log('Intake saved.')
      
      // Generate AI summary
      try {
        const aiPrompt = `Summarize the following patient intake data:\n${JSON.stringify(form, null, 2)}`
        const summary = await createAIChat(aiPrompt)
        console.log('AI Summary:', summary)
      } catch (err) {
        console.error('Error generating AI summary:', err)
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-8 shadow-xl space-y-8"
    >
      <div>
        <h2 className="text-2xl font-bold text-sky-800">Medical Intake Form</h2>
        <p className="text-sm text-gray-500">Fill out your history and lifestyle information</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Manage Allergies</h3>
        <AllergyEditor />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Medications</label>
          <div className="flex gap-2 items-center">
            <Textarea
              placeholder="List current medications..."
              value={form.medications}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('medications', e.target.value)}
            />
            <Button type="button" onClick={handleVoiceMedications}>🎤</Button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Conditions</label>
          <Textarea
            placeholder="Describe any chronic conditions..."
            value={form.conditions}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('conditions', e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Surgical History</label>
          <Textarea
            placeholder="Any prior surgeries or hospitalizations?"
            value={form.surgeries}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('surgeries', e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Lifestyle Habits</label>
          <Textarea
            placeholder="Diet, sleep, exercise routines..."
            value={form.lifestyle}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('lifestyle', e.target.value)}
          />
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <Button className="w-full md:w-40" onClick={handleSubmit}>
          Submit Intake
        </Button>
      </div>
    </motion.div>
  )
}