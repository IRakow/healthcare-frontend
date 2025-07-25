import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function PatientBilling() {
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const { data } = await supabase
          .from('visit_charges')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false });
        setCharges(data || []);
      } catch (error) {
        console.error('Error loading charges:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      case 'covered': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Your Visit Charges</h1>
        <Button variant="ghost" onClick={() => navigate('/patient')}>
          ← Back
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading charges...</div>
      ) : charges.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No visit charges yet</p>
          <p className="text-sm text-gray-400 mt-2">
            Your appointment charges will appear here
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {charges.map((c) => (
            <Card key={c.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {new Date(c.date || c.created_at).toLocaleDateString()}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {c.reason || 'Medical visit'}
                  </p>
                  <p className="text-lg font-semibold mt-2">
                    ${(c.amount || 0).toFixed(2)}
                  </p>
                </div>
                <Badge variant={getStatusColor(c.status)}>
                  {c.status || 'pending'}
                </Badge>
              </div>
              {c.notes && (
                <p className="text-sm text-gray-500 mt-3">{c.notes}</p>
              )}
            </Card>
          ))}
          
          <div className="text-center text-sm text-gray-500 mt-6">
            Total charges: {charges.length}
          </div>
        </div>
      )}
    </div>
  );
}