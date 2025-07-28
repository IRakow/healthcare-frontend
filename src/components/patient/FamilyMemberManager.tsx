import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';

interface FamilyMember {
  id: number;
  name: string;
  relationship: string;
  birthdate: string;
}

export const FamilyMemberManager: React.FC = () => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [birthdate, setBirthdate] = useState('');

  const addMember = () => {
    if (!name || !relationship || !birthdate) return;
    setMembers((prev) => [
      ...prev,
      { id: Date.now(), name, relationship, birthdate }
    ]);
    setName('');
    setRelationship('');
    setBirthdate('');
  };

  const removeMember = (id: number) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-6 shadow space-y-5"
    >
      <h3 className="text-xl font-semibold text-gray-800">Family Members</h3>
      <div className="grid md:grid-cols-3 gap-4">
        <Input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Relationship" value={relationship} onChange={(e) => setRelationship(e.target.value)} />
        <Input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
      </div>
      <Button onClick={addMember} className="mt-2">
        <Plus className="w-4 h-4 mr-1" /> Add Family Member
      </Button>

      <ul className="space-y-3">
        {members.map((m) => (
          <li key={m.id} className="flex justify-between items-center p-3 bg-white rounded-xl border shadow-sm">
            <div>
              <p className="text-sm font-medium text-gray-800">{m.name}</p>
              <p className="text-xs text-muted-foreground">{m.relationship} • {new Date(m.birthdate).toLocaleDateString()}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => removeMember(m.id)}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};