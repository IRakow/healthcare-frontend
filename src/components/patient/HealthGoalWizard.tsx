import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Select from '@/components/ui/select';

interface HealthGoalWizardProps {
  onFinish: () => void;
}

export const HealthGoalWizard: React.FC<HealthGoalWizardProps> = ({ onFinish }) => {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState('maintain');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [allergies, setAllergies] = useState('');
  const [diet, setDiet] = useState('Mediterranean');

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const steps = [
    {
      label: 'What is your main health goal?',
      content: (
        <Select
          label="Goal"
          value={goal}
          onChange={(v) => setGoal(v)}
          options={['maintain', 'lose weight', 'gain muscle']}
        />
      )
    },
    {
      label: 'What is your current weight and height?',
      content: (
        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="Weight (lbs)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
          <Input
            placeholder="Height (in)"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
        </div>
      )
    },
    {
      label: 'Do you have any food allergies?',
      content: (
        <Input
          placeholder="e.g. peanuts, shellfish, gluten"
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
        />
      )
    },
    {
      label: 'Preferred diet style?',
      content: (
        <Select
          label="Diet Style"
          value={diet}
          onChange={(v) => setDiet(v)}
          options={['Mediterranean', 'Low Carb', 'Balanced', 'Vegetarian']}
        />
      )
    },
    {
      label: 'Ready to launch your plan?',
      content: (
        <div className="text-sm text-muted-foreground">
          Based on your goal to <strong>{goal}</strong>, your profile will begin tracking your macros, hydration, and food patterns. You will be shown meal suggestions, grocery ideas, and AI-driven coaching every step of the way.
        </div>
      )
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-6 shadow space-y-6 max-w-3xl mx-auto"
    >
      <h3 className="text-xl font-semibold text-gray-800">Health Goal Setup</h3>
      <p className="text-sm text-muted-foreground">Step {step + 1} of {steps.length}: {steps[step].label}</p>
      <div>{steps[step].content}</div>

      <div className="flex justify-between pt-4">
        {step > 0 ? <Button onClick={back} variant="outline">Back</Button> : <div />}
        {step < steps.length - 1 ? (
          <Button onClick={next}>Next</Button>
        ) : (
          <Button onClick={onFinish}>Launch Plan</Button>
        )}
      </div>
    </motion.div>
  );
};