// File: src/components/patient/CareTeamPanel.tsx

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';

interface CareTeamMember {
  id: string;
  user_id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
}

export default function CareTeamPanel() {
  const { user } = useUser();
  const [team, setTeam] = useState<CareTeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const loadTeam = async () => {
      const { data, error } = await supabase
        .from('care_team')
        .select('*')
        .eq('patient_id', user.id);

      if (error) {
        console.error('❌ Error loading care team:', error.message);
      } else {
        setTeam(data || []);
      }

      setLoading(false);
    };

    loadTeam();
  }, [user]);

  return (
    <Card className="bg-white/80 backdrop-blur border border-white/20 rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-sky-900">👨‍⚕️ Care Team</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-gray-500">Loading care team...</p>
        ) : team.length === 0 ? (
          <p className="text-sm italic text-gray-400">No care team members found.</p>
        ) : (
          <ul className="space-y-4">
            {team.map((member) => (
              <li key={member.id} className="bg-white p-3 rounded-xl shadow border">
                <p className="font-medium text-gray-800">{member.name} – {member.specialty}</p>
                <p className="text-sm text-gray-600">{member.phone}</p>
                <p className="text-sm text-gray-600">{member.email}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
