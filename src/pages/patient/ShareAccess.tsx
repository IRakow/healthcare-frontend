import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, X, Check } from 'lucide-react';

interface Share {
  id: string;
  shared_with_id: string;
  shared_with?: {
    full_name: string;
    email: string;
  };
  access_labs: boolean;
  access_meds: boolean;
  access_appointments: boolean;
  access_uploads: boolean;
  access_timeline: boolean;
  created_at: string;
  revoked: boolean;
}

export default function ShareAccess() {
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [sharing, setSharing] = useState(false);
  const [permissions, setPermissions] = useState({
    access_labs: true,
    access_meds: true,
    access_appointments: true,
    access_uploads: true,
    access_timeline: true
  });

  useEffect(() => {
    loadShares();
  }, []);

  async function loadShares() {
    try {
      const user = supabase.auth.user();
      const { data } = await supabase
        .from('patient_shares')
        .select(`
          *,
          shared_with:shared_with_id(full_name, email)
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      
      setShares(data || []);
    } catch (error) {
      console.error('Error loading shares:', error);
    } finally {
      setLoading(false);
    }
  }

  async function shareAccess() {
    if (!email.trim()) return;

    setSharing(true);
    try {
      const user = supabase.auth.user();
      
      // Find user by email
      const { data: sharedUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.trim())
        .single();

      if (!sharedUser) {
        alert('User not found with that email address');
        return;
      }

      // Check if already shared
      const existingShare = shares.find(s => s.shared_with_id === sharedUser.id && !s.revoked);
      if (existingShare) {
        alert('You already share access with this user');
        return;
      }

      // Create share
      const { error } = await supabase
        .from('patient_shares')
        .insert({
          owner_id: user.id,
          shared_with_id: sharedUser.id,
          ...permissions
        });

      if (error) throw error;

      // Reload shares
      await loadShares();
      setEmail('');
      alert('Access shared successfully!');
    } catch (error) {
      console.error('Error sharing access:', error);
      alert('Failed to share access');
    } finally {
      setSharing(false);
    }
  }

  async function revokeShare(shareId: string) {
    try {
      const { error } = await supabase
        .from('patient_shares')
        .update({ revoked: true })
        .eq('id', shareId);

      if (error) throw error;

      await loadShares();
    } catch (error) {
      console.error('Error revoking share:', error);
      alert('Failed to revoke access');
    }
  }

  async function updatePermissions(shareId: string, updates: Partial<typeof permissions>) {
    try {
      const { error } = await supabase
        .from('patient_shares')
        .update(updates)
        .eq('id', shareId);

      if (error) throw error;

      await loadShares();
    } catch (error) {
      console.error('Error updating permissions:', error);
      alert('Failed to update permissions');
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Users className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Share My Health Data</h1>
      </div>

      <Card className="p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Share Access with Someone
        </h2>
        
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Select what to share:</p>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={permissions.access_labs}
                onChange={(e) => setPermissions({ ...permissions, access_labs: e.target.checked })}
              />
              <span className="text-sm">Lab Results</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={permissions.access_meds}
                onChange={(e) => setPermissions({ ...permissions, access_meds: e.target.checked })}
              />
              <span className="text-sm">Medications & Medical History</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={permissions.access_appointments}
                onChange={(e) => setPermissions({ ...permissions, access_appointments: e.target.checked })}
              />
              <span className="text-sm">Appointments</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={permissions.access_uploads}
                onChange={(e) => setPermissions({ ...permissions, access_uploads: e.target.checked })}
              />
              <span className="text-sm">Documents</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={permissions.access_timeline}
                onChange={(e) => setPermissions({ ...permissions, access_timeline: e.target.checked })}
              />
              <span className="text-sm">Timeline Events</span>
            </label>
          </div>

          <Button 
            onClick={shareAccess} 
            disabled={sharing || !email.trim()}
            className="w-full"
          >
            {sharing ? 'Sharing...' : 'Share Access'}
          </Button>
        </div>
      </Card>

      {/* Active Shares */}
      <div className="space-y-4">
        <h2 className="font-semibold text-lg">People with Access</h2>
        
        {shares.filter(s => !s.revoked).length === 0 ? (
          <Card className="p-6 text-center text-gray-500">
            You haven't shared your health data with anyone yet
          </Card>
        ) : (
          shares.filter(s => !s.revoked).map((share) => (
            <Card key={share.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{share.shared_with?.full_name}</h3>
                  <p className="text-sm text-gray-600">{share.shared_with?.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Shared on {new Date(share.created_at).toLocaleDateString()}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {share.access_labs && <Badge variant="secondary">Labs</Badge>}
                    {share.access_meds && <Badge variant="secondary">Medications</Badge>}
                    {share.access_appointments && <Badge variant="secondary">Appointments</Badge>}
                    {share.access_uploads && <Badge variant="secondary">Documents</Badge>}
                    {share.access_timeline && <Badge variant="secondary">Timeline</Badge>}
                  </div>
                </div>
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => revokeShare(share.id)}
                >
                  <X className="h-4 w-4" />
                  Revoke
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Revoked Shares */}
      {shares.filter(s => s.revoked).length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-lg text-gray-600">Revoked Access</h2>
          
          {shares.filter(s => s.revoked).map((share) => (
            <Card key={share.id} className="p-4 opacity-60">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{share.shared_with?.full_name}</h3>
                  <p className="text-sm text-gray-600">{share.shared_with?.email}</p>
                  <p className="text-xs text-gray-500">Access revoked</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}