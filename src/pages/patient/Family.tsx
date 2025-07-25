import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Family() {
  const [family, setFamily] = useState<any[]>([]);
  const [newMember, setNewMember] = useState({ full_name: '', birthdate: '', relation: '' });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from('family_members').select('*').eq('account_holder_id', user?.id);
      setFamily(data || []);
    })();
  }, []);

  async function addFamilyMember() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('family_members').insert({
      ...newMember,
      account_holder_id: user?.id,
    }).select();

    if (!error && data) {
      setFamily([...family, data[0]]);
      setNewMember({ full_name: '', birthdate: '', relation: '' });
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Family Members</h1>

      {family.map((f, i) => (
        <Card key={i} title={f.full_name}>
          <p className="text-sm">DOB: {f.birthdate}</p>
          <p className="text-sm">Relation: {f.relation}</p>
        </Card>
      ))}

      <Card title="Add Family Member" className="mt-6">
        <Input label="Full Name" value={newMember.full_name} onChange={(e) => setNewMember({ ...newMember, full_name: e.target.value })} />
        <Input label="Birthdate" type="date" value={newMember.birthdate} onChange={(e) => setNewMember({ ...newMember, birthdate: e.target.value })} />
        <Input label="Relation" value={newMember.relation} onChange={(e) => setNewMember({ ...newMember, relation: e.target.value })} />
        <Button className="mt-3" onClick={addFamilyMember}>Add</Button>
      </Card>
    </div>
  );
}