import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, User, Calendar, Pill, FileText, 
  Activity, Upload, Clock, AlertCircle, Shield
} from 'lucide-react';
import { checkPatientAccess } from '@/utils/patientAccess';

export default function SharedPatientView() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [access, setAccess] = useState<any>(null);
  const [labs, setLabs] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [uploads, setUploads] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('labs');

  useEffect(() => {
    if (patientId) {
      loadSharedData();
    }
  }, [patientId]);

  async function loadSharedData() {
    try {
      // Check access permissions
      const accessPermissions = await checkPatientAccess(patientId!);
      setAccess(accessPermissions);

      // If no access at all, don't load anything
      if (!accessPermissions.canSeeLabs && !accessPermissions.canSeeMeds && 
          !accessPermissions.canSeeAppointments && !accessPermissions.canSeeUploads && 
          !accessPermissions.canSeeTimeline) {
        setLoading(false);
        return;
      }

      // Load patient info
      const { data: profile } = await supabase
        .from('users')
        .select('id, full_name, email')
        .eq('id', patientId)
        .single();
      
      setPatientInfo(profile);

      // Load data based on permissions
      if (accessPermissions.canSeeLabs) {
        const { data: labData } = await supabase
          .from('lab_results')
          .select('*')
          .eq('patient_id', patientId)
          .order('date', { ascending: false });
        setLabs(labData || []);
      }

      if (accessPermissions.canSeeMeds) {
        const { data: medData } = await supabase
          .from('medications')
          .select('*')
          .eq('patient_id', patientId)
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        setMedications(medData || []);
      }

      if (accessPermissions.canSeeAppointments) {
        const { data: apptData } = await supabase
          .from('appointments')
          .select('*')
          .eq('patient_id', patientId)
          .order('date', { ascending: false });
        setAppointments(apptData || []);
      }

      if (accessPermissions.canSeeTimeline) {
        const { data: timelineData } = await supabase
          .from('patient_timeline_events')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false })
          .limit(20);
        setTimeline(timelineData || []);
      }

      if (accessPermissions.canSeeUploads) {
        const { data: uploadData } = await supabase
          .from('uploads')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false });
        setUploads(uploadData || []);
      }

    } catch (error) {
      console.error('Error loading shared data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-screen-xl mx-auto">
        <div className="text-center py-12 text-gray-500">
          Loading shared health data...
        </div>
      </div>
    );
  }

  if (!access || (!access.canSeeLabs && !access.canSeeMeds && !access.canSeeAppointments && 
      !access.canSeeUploads && !access.canSeeTimeline)) {
    return (
      <div className="p-6 max-w-screen-xl mx-auto">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">You don't have access to view this patient's data</p>
          <Button onClick={() => navigate('/patient')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/patient')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Patient Info */}
      {patientInfo && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{patientInfo.full_name}'s Health Data</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Shared with you</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          {access.canSeeLabs && <TabsTrigger value="labs">Lab Results</TabsTrigger>}
          {access.canSeeMeds && <TabsTrigger value="medications">Medications</TabsTrigger>}
          {access.canSeeAppointments && <TabsTrigger value="appointments">Appointments</TabsTrigger>}
          {access.canSeeTimeline && <TabsTrigger value="timeline">Timeline</TabsTrigger>}
          {access.canSeeUploads && <TabsTrigger value="documents">Documents</TabsTrigger>}
        </TabsList>

        {/* Labs Tab */}
        {access.canSeeLabs && (
          <TabsContent value="labs" className="space-y-4">
            {labs.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No lab results available</p>
              </Card>
            ) : (
              labs.map((lab, i) => (
                <Card key={i} className="p-4">
                  <h3 className="font-semibold">{lab.panel} - {lab.date}</h3>
                  <table className="w-full text-sm mt-3">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="pb-1">Test</th>
                        <th className="pb-1">Value</th>
                        <th className="pb-1">Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(lab.results || []).map((r: any, j: number) => (
                        <tr key={j} className="border-b">
                          <td className="py-1">{r.name}</td>
                          <td className="py-1 font-medium">{r.value} {r.unit}</td>
                          <td className="py-1 text-gray-500">{r.reference}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              ))
            )}
          </TabsContent>
        )}

        {/* Medications Tab */}
        {access.canSeeMeds && (
          <TabsContent value="medications" className="space-y-4">
            {medications.length === 0 ? (
              <Card className="p-8 text-center">
                <Pill className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No active medications</p>
              </Card>
            ) : (
              medications.map((med) => (
                <Card key={med.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{med.name}</h3>
                      <div className="text-sm text-gray-600 space-y-1 mt-1">
                        <p>Strength: {med.strength}</p>
                        <p>Dosage: {med.dosage}</p>
                        <p>Frequency: {med.frequency}</p>
                      </div>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        )}

        {/* Appointments Tab */}
        {access.canSeeAppointments && (
          <TabsContent value="appointments" className="space-y-4">
            {appointments.length === 0 ? (
              <Card className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No appointments scheduled</p>
              </Card>
            ) : (
              appointments.map((appt) => (
                <Card key={appt.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{appt.reason}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(appt.date).toLocaleDateString()} at {appt.time}
                      </p>
                      <p className="text-sm text-gray-600">{appt.type}</p>
                    </div>
                    <Badge>{appt.status}</Badge>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        )}

        {/* Timeline Tab */}
        {access.canSeeTimeline && (
          <TabsContent value="timeline" className="space-y-4">
            {timeline.length === 0 ? (
              <Card className="p-8 text-center">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No timeline events</p>
              </Card>
            ) : (
              timeline.map((event) => (
                <Card key={event.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{event.label}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(event.created_at).toLocaleDateString()} at{' '}
                        {new Date(event.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge variant="secondary">{event.type}</Badge>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        )}

        {/* Documents Tab */}
        {access.canSeeUploads && (
          <TabsContent value="documents" className="space-y-4">
            {uploads.length === 0 ? (
              <Card className="p-8 text-center">
                <Upload className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No documents uploaded</p>
              </Card>
            ) : (
              uploads.map((upload) => (
                <Card key={upload.id} className="p-4">
                  <a 
                    href={upload.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    📄 {upload.filename}
                  </a>
                  <p className="text-sm text-gray-500 mt-1">
                    Uploaded on {new Date(upload.created_at).toLocaleDateString()}
                  </p>
                </Card>
              ))
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}