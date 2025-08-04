// src/pages/admin/AdminUserManager.tsx

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { speak } from '@/lib/voice/RachelTTSQueue';
import { executeAdminSkill } from '@/lib/voice/RachelAdminPowers';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { setMemory } from '@/lib/voice/RachelMemoryStore';
import AssistantBarOverlay from '@/components/ai/AssistantBarOverlay';

export default function AdminUserManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchUsers = async () => {
    setLoading(true);
    let query = supabase.from('users').select('*').order('created_at', { ascending: false });
    if (filter === 'provider') query = query.eq('role', 'provider');
    if (filter === 'created_this_week') {
      const since = new Date();
      since.setDate(since.getDate() - 7);
      query = query.gte('created_at', since.toISOString());
    }
    const { data, error } = await query;
    if (!error && data) setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const handleRoleChange = async (id: string, newRole: string) => {
    const { error } = await supabase.from('users').update({ role: newRole }).eq('id', id);
    if (!error) {
      speak(`Role updated to ${newRole}`);
      fetchUsers();
    }
  };

  const handleImpersonate = (user: any) => {
    setMemory('impersonation_mode', user.email);
    speak(`Now impersonating ${user.email}`);
  };

  const handleVoiceIntent = async (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('show all providers')) {
      setFilter('provider');
      return speak('Filtered to providers.');
    }
    if (lower.includes('created this week')) {
      setFilter('created_this_week');
      return speak('Showing users created this week.');
    }
    const match = lower.match(/promote (.+) to (admin|owner|provider)/);
    if (match) {
      const name = match[1].trim();
      const role = match[2];
      const user = users.find(
        (u) => u.name?.toLowerCase().includes(name) || u.email?.toLowerCase().includes(name)
      );
      if (user) {
        await handleRoleChange(user.id, role);
      } else {
        speak(`I couldn't find ${name}.`);
      }
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative min-h-screen p-6 space-y-6 pb-24">
      <h2 className="text-3xl font-bold tracking-tight">User Manager</h2>

      <div className="flex flex-wrap gap-4 items-center">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={fetchUsers} disabled={loading}>Refresh</Button>
        <Button onClick={() => setFilter('all')}>All</Button>
        <Button onClick={() => setFilter('provider')}>Providers</Button>
        <Button onClick={() => setFilter('created_this_week')}>New This Week</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="bg-white/60 backdrop-blur-lg shadow-xl rounded-2xl p-4">
            <CardContent className="space-y-2">
              <div className="text-lg font-semibold">{user.name || 'Unnamed User'}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
              <Badge className="capitalize">{user.role}</Badge>
              <div className="flex gap-2 mt-3 flex-wrap">
                {['admin', 'owner', 'provider'].map((role) => (
                  <Button
                    key={role}
                    size="sm"
                    variant={user.role === role ? 'default' : 'outline'}
                    onClick={() => handleRoleChange(user.id, role)}
                  >
                    {role}
                  </Button>
                ))}
                <Button size="sm" variant="ghost" onClick={() => handleImpersonate(user)}>
                  Impersonate
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AssistantBarOverlay onSubmit={handleVoiceIntent} />
    </div>
  );
}