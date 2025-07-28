import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  MessageCircle, 
  Phone, 
  Video, 
  Calendar,
  Stethoscope,
  Heart,
  Brain,
  Activity,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageModal } from '@/components/ui/MessageModal';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  specialty?: string;
  status: 'available' | 'in_clinic' | 'offline';
  lastSeen?: string;
  avatar?: string;
  provider?: {
    practice_location?: string;
    phone?: string;
    availability_status?: string;
  };
}

const statusConfig = {
  available: { 
    label: 'Available', 
    class: 'bg-green-100 text-green-700 border-green-200',
    icon: <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
  },
  in_clinic: { 
    label: 'In Clinic', 
    class: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: <div className="w-2 h-2 bg-blue-500 rounded-full" />
  },
  offline: { 
    label: 'Offline', 
    class: 'bg-gray-100 text-gray-600 border-gray-200',
    icon: <div className="w-2 h-2 bg-gray-400 rounded-full" />
  }
};

const roleIcons: Record<string, React.ReactNode> = {
  'Primary Care': <Stethoscope className="w-4 h-4" />,
  'Cardiologist': <Heart className="w-4 h-4" />,
  'Neurologist': <Brain className="w-4 h-4" />,
  'Care Coordinator': <Activity className="w-4 h-4" />,
  'Nurse': <User className="w-4 h-4" />
};

export const CareTeamPanel: React.FC = () => {
  const { userId } = useUser();
  const navigate = useNavigate();
  const [careTeam, setCareTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState('');
  const [messageRecipientId, setMessageRecipientId] = useState('');

  useEffect(() => {
    if (userId) {
      loadCareTeam();
      
      // Subscribe to real-time status updates
      const subscription = supabase
        .channel('care-team-status')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'providers',
          filter: `patient_care_teams.patient_id=eq.${userId}`
        }, (payload) => {
          loadCareTeam(); // Reload when status changes
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [userId]);

  const loadCareTeam = async () => {
    try {
      setError(null);
      
      // First get the patient ID
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (patientError) throw patientError;

      // Get care team assignments
      const { data: assignments, error: assignError } = await supabase
        .from('patient_care_teams')
        .select(`
          id,
          role,
          is_primary,
          provider:providers(
            id,
            user_id,
            specialty,
            practice_location,
            phone,
            availability_status
          )
        `)
        .eq('patient_id', patient.id)
        .eq('is_active', true)
        .order('is_primary', { ascending: false });

      if (assignError) throw assignError;

      // Get user details for each provider
      const providerUserIds = assignments
        ?.map(a => a.provider?.user_id)
        .filter(Boolean) || [];

      if (providerUserIds.length > 0) {
        const { data: userData, error: userError } = await supabase
          .from('auth.users')
          .select('id, email, raw_user_meta_data')
          .in('id', providerUserIds);

        if (userError) throw userError;

        // Map the data
        const teamMembers: TeamMember[] = assignments?.map(assignment => {
          const user = userData?.find(u => u.id === assignment.provider?.user_id);
          const metadata = user?.raw_user_meta_data || {};
          
          return {
            id: assignment.provider?.id || '',
            name: metadata.name || user?.email || 'Unknown Provider',
            role: assignment.role || assignment.provider?.specialty || 'Healthcare Provider',
            specialty: assignment.provider?.specialty,
            status: mapAvailabilityStatus(assignment.provider?.availability_status),
            avatar: metadata.avatar_url,
            provider: assignment.provider
          };
        }) || [];

        setCareTeam(teamMembers);
      } else {
        // No care team assigned yet
        setCareTeam([]);
      }
    } catch (error) {
      console.error('Failed to load care team:', error);
      setError('Failed to load care team members');
    } finally {
      setLoading(false);
    }
  };

  const mapAvailabilityStatus = (status?: string): 'available' | 'in_clinic' | 'offline' => {
    switch (status) {
      case 'available':
      case 'online':
        return 'available';
      case 'busy':
      case 'in_appointment':
        return 'in_clinic';
      default:
        return 'offline';
    }
  };

  const handleMessage = (memberId: string, memberName: string) => {
    setMessageRecipient(memberName);
    setMessageRecipientId(memberId);
    setMessageModalOpen(true);
  };

  const handleVideoCall = (memberId: string) => {
    navigate(`/patient/telemed?provider=${memberId}`);
  };

  const handleSchedule = (memberId: string) => {
    navigate(`/patient/appointments/new?provider=${memberId}`);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur p-6 shadow space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Your Care Team
        </h3>
        <Badge variant="outline" className="text-xs">
          {careTeam.length} {careTeam.length === 1 ? 'Member' : 'Members'}
        </Badge>
      </div>

      {careTeam.length === 0 ? (
        <div className="text-center py-8">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No care team members assigned yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Your care team will appear here once assigned
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {careTeam.map((member) => (
            <motion.li
              key={member.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {member.avatar ? (
                      <img 
                        src={member.avatar} 
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        {roleIcons[member.role] || <User className="w-5 h-5 text-primary" />}
                      </div>
                    )}
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">
                          {member.name}
                        </span>
                        <div className="flex items-center gap-1">
                          {statusConfig[member.status].icon}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {member.role}
                        {member.specialty && member.specialty !== member.role && 
                          ` • ${member.specialty}`
                        }
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary"
                      className={`text-xs ${statusConfig[member.status].class}`}
                    >
                      {statusConfig[member.status].label}
                    </Badge>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                    onClick={() => handleMessage(member.id, member.name)}
                  >
                    <MessageCircle className="w-3.5 h-3.5 mr-1" />
                    Message
                  </Button>
                  
                  {member.status === 'available' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => handleVideoCall(member.id)}
                    >
                      <Video className="w-3.5 h-3.5 mr-1" />
                      Video Call
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                    onClick={() => handleSchedule(member.id)}
                  >
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    Schedule
                  </Button>
                </div>

                {member.provider?.practice_location && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <span className="font-medium">Location:</span> {member.provider.practice_location}
                  </div>
                )}
              </div>
            </motion.li>
          ))}
        </ul>
      )}

      {/* Quick actions */}
      <div className="pt-4 border-t">
        <p className="text-xs text-muted-foreground mb-3">Quick Actions</p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/patient/appointments')}
            className="flex-1"
          >
            <Calendar className="w-3.5 h-3.5 mr-1" />
            View All Appointments
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/patient/messages')}
            className="flex-1"
          >
            <MessageCircle className="w-3.5 h-3.5 mr-1" />
            Messages
          </Button>
        </div>
      </div>

      {/* Message Modal */}
      <MessageModal 
        isOpen={messageModalOpen} 
        onClose={() => setMessageModalOpen(false)} 
        recipient={messageRecipient}
        recipientId={messageRecipientId}
      />
    </motion.div>
  );
};