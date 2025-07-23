import { useState } from 'react';

export default function OnboardingForm() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', age: '', sex: '', goals: '', allergies: '' });

  const handleNext = () => setStep(step + 1);
  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">📝 AI-Powered Patient Intake</h1>
      {step === 1 && (
        <div className="space-y-4">
          <input type="text" name="name" placeholder="Full Name" className="input" onChange={handleChange} />
          <input type="number" name="age" placeholder="Age" className="input" onChange={handleChange} />
          <select name="sex" className="input" onChange={handleChange}>
            <option>Select Sex</option>
            <option>Male</option>
            <option>Female</option>
          </select>
          <button onClick={handleNext} className="btn-primary">Next</button>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <textarea name="goals" placeholder="What are your health goals?" className="input" onChange={handleChange} />
          <textarea name="allergies" placeholder="Food or medication allergies?" className="input" onChange={handleChange} />
          <button className="btn-primary">Submit</button>
        </div>
      )}
    </div>
  );
}