import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash } from 'lucide-react';

interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
}

export const MedicationManager: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');

  const addMedication = () => {
    if (!name || !dosage || !frequency) return;
    const newMed: Medication = {
      id: Date.now(),
      name,
      dosage,
      frequency
    };
    setMedications((prev) => [...prev, newMed]);
    setName('');
    setDosage('');
    setFrequency('');
  };

  const removeMedication = (id: number) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-6 shadow space-y-5"
    >
      <h3 className="text-xl font-semibold text-gray-800">Current Medications</h3>

      <div className="grid md:grid-cols-3 gap-3">
        <Input placeholder="Medication name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Dosage (e.g. 10mg)" value={dosage} onChange={(e) => setDosage(e.target.value)} />
        <Input placeholder="Frequency (e.g. 2x/day)" value={frequency} onChange={(e) => setFrequency(e.target.value)} />
      </div>
      <Button onClick={addMedication} className="mt-2">
        <Plus className="w-4 h-4 mr-1" /> Add Medication
      </Button>

      {medications.length > 0 && (
        <ul className="space-y-3 mt-4">
          {medications.map((m) => (
            <li
              key={m.id}
              className="flex justify-between items-center bg-white p-4 rounded-xl border shadow"
            >
              <div>
                <p className="font-medium text-gray-800">{m.name}</p>
                <p className="text-sm text-muted-foreground">
                  {m.dosage} • {m.frequency}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeMedication(m.id)}>
                <Trash className="w-4 h-4 text-red-500" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
};