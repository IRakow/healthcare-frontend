// File: src/pages/patient/Allergies.tsx

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';

interface Allergy {
  id: number;
  substance: string;
  reaction: string;
  patient_id?: string;
}

export default function Allergies() {
  const { user } = useUser();
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [substance, setSubstance] = useState('');
  const [reaction, setReaction] = useState('');
  const [error, setError] = useState('');
  const substanceRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user?.id) return;
    const fetchAllergies = async () => {
      const { data, error } = await supabase
        .from('patient_allergies')
        .select('*')
        .eq('patient_id', user.id);

      if (error) {
        toast.error('Failed to load allergies.');
        console.error(error);
      } else {
        setAllergies(data || []);
      }
    };
    fetchAllergies();
  }, [user]);

  const addAllergy = async () => {
    if (!substance || !reaction) {
      setError('Please fill out both fields.');
      return;
    }
    setError('');

    const newAllergy = { substance, reaction, patient_id: user?.id };
    const { data, error } = await supabase
      .from('patient_allergies')
      .insert(newAllergy)
      .select()
      .single();

    if (error) {
      toast.error('Failed to add allergy.');
      return;
    }

    setAllergies((prev) => [...prev, data]);
    toast.success(`✅ Added: ${substance}`);
    setSubstance('');
    setReaction('');
    substanceRef.current?.focus();
  };

  const removeAllergy = async (id: number) => {
    const { error } = await supabase
      .from('patient_allergies')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to remove allergy.');
      return;
    }

    setAllergies((prev) => prev.filter((a) => a.id !== id));
    toast.info('❌ Allergy removed');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl border border-white/30 bg-white/60 backdrop-blur-lg p-6 md:p-8 shadow-xl space-y-6"
    >
      <h3 className="text-2xl font-semibold text-gray-800">Allergies</h3>

      <div className="grid md:grid-cols-2 gap-4">
        <Input
          ref={substanceRef}
          placeholder="Substance (e.g. Peanuts)"
          value={substance}
          onChange={(e) => setSubstance(e.target.value)}
        />
        <Input
          placeholder="Reaction (e.g. Hives)"
          value={reaction}
          onChange={(e) => setReaction(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button
        onClick={addAllergy}
        className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-xl"
      >
        <Plus className="w-4 h-4 mr-2" /> Add Allergy
      </Button>

      <ul className="space-y-3">
        {allergies.map((a) => (
          <motion.li
            key={a.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex justify-between items-center bg-white/90 p-4 rounded-xl border shadow-sm"
          >
            <div>
              <p className="text-sm font-medium text-gray-800">{a.substance}</p>
              <p className="text-xs text-muted-foreground">{a.reaction}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => removeAllergy(a.id)}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

export const AllergyEditor = Allergies;