import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function WearableEntry() {
  const [sleep, setSleep] = useState('');

  async function save() {
    // Save logic here
  }

  return (
    <div>
      <Input label="Sleep (hrs)" type="number" value={sleep} onChange={(e) => setSleep(e.target.value)} />
      <Button onClick={save}>Submit</Button>
    </div>
  );
}