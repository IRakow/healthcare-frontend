import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AllergyEditor } from '@/components/patient/Allergies';

interface IntakeFormData {
  allergies: string;
  medications: string;
  conditions: string;
  surgeries: string;
  lifestyle: string;
}

export const SmartIntakeForm: React.FC = () => {
  const [form, setForm] = useState<IntakeFormData>({
    allergies: '',
    medications: '',
    conditions: '',
    surgeries: '',
    lifestyle: ''
  });

  const handleChange = (field: keyof IntakeFormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = () => {
    // TODO: Save form to Supabase
    console.log('Submitting intake:', form);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-6 shadow space-y-5"
    >
      <h3 className="text-xl font-semibold text-gray-800">Medical Intake Form</h3>

      <div className="mb-6">
        <h4 className="text-lg font-medium text-gray-700 mb-3">Manage Your Allergies</h4>
        <AllergyEditor />
      </div>

      <Textarea
        placeholder="List current medications..."
        value={form.medications}
        onChange={(e) => handleChange('medications', e.target.value)}
        label="Medications"
      />
      <Textarea
        placeholder="Describe any ongoing conditions..."
        value={form.conditions}
        onChange={(e) => handleChange('conditions', e.target.value)}
        label="Conditions"
      />
      <Textarea
        placeholder="List any past surgeries or hospitalizations..."
        value={form.surgeries}
        onChange={(e) => handleChange('surgeries', e.target.value)}
        label="Surgical History"
      />
      <Textarea
        placeholder="Describe your lifestyle: diet, exercise, sleep..."
        value={form.lifestyle}
        onChange={(e) => handleChange('lifestyle', e.target.value)}
        label="Lifestyle Habits"
      />

      <Button onClick={handleSubmit}>Submit Intake</Button>
    </motion.div>
  );
};