import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface Allergy {
  id: number;
  substance: string;
  reaction: string;
}

export const AllergyEditor: React.FC = () => {
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [substance, setSubstance] = useState('');
  const [reaction, setReaction] = useState('');

  const addAllergy = () => {
    if (!substance || !reaction) return;
    setAllergies((prev) => [
      ...prev,
      { id: Date.now(), substance, reaction }
    ]);
    setSubstance('');
    setReaction('');
  };

  const removeAllergy = (id: number) => {
    setAllergies((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-6 shadow space-y-4"
    >
      <h3 className="text-xl font-semibold text-gray-800">Allergies</h3>

      <div className="grid md:grid-cols-2 gap-4">
        <Input placeholder="Substance (e.g. Peanuts)" value={substance} onChange={(e) => setSubstance(e.target.value)} />
        <Input placeholder="Reaction (e.g. Hives, anaphylaxis)" value={reaction} onChange={(e) => setReaction(e.target.value)} />
      </div>

      <Button onClick={addAllergy} className="mt-2">
        <Plus className="w-4 h-4 mr-1" /> Add Allergy
      </Button>

      <ul className="space-y-3">
        {allergies.map((a) => (
          <li key={a.id} className="flex justify-between items-center bg-white p-3 rounded-xl border shadow-sm">
            <div>
              <p className="text-sm font-medium text-gray-800">{a.substance}</p>
              <p className="text-xs text-muted-foreground">{a.reaction}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => removeAllergy(a.id)}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};