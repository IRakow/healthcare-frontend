import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, User, Calendar, Pill, FileText, 
  Activity, Upload, Brain, Clock, AlertCircle 
} from 'lucide-react';
import { checkPatientAccess } from '@/utils/patientAccess';

interface PatientInfo {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  created_at: string;
}

interface TimelineEvent {
  id: string;
  patient_id: string;
  type: 'visit' | 'med' | 'upload' | 'ai' | 'update' | 'vitals' | 'lab';
  label: string;
  data: any;
  created_at: string;
}

interface Medication {
  id: string;
  name: string;
  strength: string;
  dosage: string;
  frequency: string;
  is_active: boolean;
  created_at: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  type: string;
  reason: string;
  status: string;
  provider?: {
    full_name: string;
  };
}

interface PatientIntake {
  conditions: string[];
  surgeries: string[];
  allergies: string[];
  family_history: string[];
}

export default function PatientFile() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [intake, setIntake] = useState<PatientIntake | null>(null);
  const [uploads, setUploads] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('timeline');
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [access, setAccess] = useState<any>(null);

  useEffect(() => {
    if (patientId) {
      loadPatientData();
    }
  }, [patientId]);

  async function loadPatientData() {
    try {
      // Check access permissions first
      const accessPermissions = await checkPatientAccess(patientId!);
      setAccess(accessPermissions);

      // Load patient profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', patientId)
        .single();
      
      if (profile) {
        setPatientInfo(profile);
      }

      // Load timeline events if access permitted
      if (accessPermissions.canSeeTimeline) {
        const { data: timelineData } = await supabase
          .from('patient_timeline_events')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false });
        
        setEvents(timelineData || []);
      }

      // Load medications if access permitted
      if (accessPermissions.canSeeMeds) {
        const { data: medsData } = await supabase
          .from('medications')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false });
        
        setMedications(medsData || []);

        // Load intake data (part of medical history)
        const { data: intakeData } = await supabase
          .from('patient_intake')
          .select('*')
          .eq('patient_id', patientId)
          .maybeSingle();
        
        setIntake(intakeData);
      }

      // Load appointments if access permitted
      if (accessPermissions.canSeeAppointments) {
        const { data: apptData } = await supabase
          .from('appointments')
          .select(`
            *,
            provider:users!appointments_provider_id_fkey(full_name)
          `)
          .eq('patient_id', patientId)
          .order('date', { ascending: false })
          .order('time', { ascending: false });
        
        setAppointments(apptData || []);
      }

      // Load uploads if access permitted
      if (accessPermissions.canSeeUploads) {
        const { data: uploadsData } = await supabase
          .from('uploads')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false });
        
        setUploads(uploadsData || []);
      }

    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveSOAPNote() {
    if (!note.trim() || !patientId) return;

    setSavingNote(true);
    try {
      const { error } = await supabase.from('patient_timeline_events').insert({
        patient_id: patientId,
        type: 'visit',
        label: 'SOAP Note',
        data: { 
          note: note.trim(),
          date: new Date().toISOString(),
          provider_id: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (error) throw error;

      // Clear note and reload timeline
      setNote('');
      await loadPatientData();
      
      // Switch to timeline tab to show the new note
      setActiveTab('timeline');
    } catch (error) {
      console.error('Error saving SOAP note:', error);
      alert('Failed to save SOAP note');
    } finally {
      setSavingNote(false);
    }
  }

  const getEventIcon = (type: string) => {
    const icons = {
      visit: Calendar,
      med: Pill,
      upload: Upload,
      ai: Brain,
      update: FileText,
      vitals: Activity,
      lab: FileText
    };
    return icons[type as keyof typeof icons] || FileText;
  };

  const getEventColor = (type: string) => {
    const colors = {
      visit: 'text-blue-600 bg-blue-50',
      med: 'text-green-600 bg-green-50',
      upload: 'text-purple-600 bg-purple-50',
      ai: 'text-indigo-600 bg-indigo-50',
      update: 'text-gray-600 bg-gray-50',
      vitals: 'text-red-600 bg-red-50',
      lab: 'text-yellow-600 bg-yellow-50'
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-50';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateAge = (dob?: string) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="p-6 max-w-screen-xl mx-auto">
        <div className="text-center py-12 text-gray-500">
          Loading patient information...
        </div>
      </div>
    );
  }

  if (!patientInfo) {
    return (
      <div className="p-6 max-w-screen-xl mx-auto">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Patient not found</p>
          <Button onClick={() => navigate('/provider/dashboard')} className="mt-4">
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
          onClick={() => navigate('/provider/dashboard')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      {/* Patient Info Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{patientInfo.full_name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                <span>{patientInfo.email}</span>
                {patientInfo.phone && <span>• {patientInfo.phone}</span>}
                <span>• Age: {calculateAge(patientInfo.date_of_birth)}</span>
              </div>
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>Patient ID: {patientInfo.id.slice(0, 8)}...</p>
            <p>Member since: {new Date(patientInfo.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Medical History Summary */}
        {intake && access?.canSeeMeds && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Conditions</p>
              <p className="text-lg font-semibold">{intake.conditions?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Allergies</p>
              <p className="text-lg font-semibold">{intake.allergies?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Medications</p>
              <p className="text-lg font-semibold">
                {medications.filter((m: any) => m.is_active).length}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Appointments</p>
              <p className="text-lg font-semibold">{appointments.length}</p>
            </div>
          </div>
        )}
      </Card>

      {/* SOAP Note Section - Only show for owners */}
      {access?.isOwner && (
        <Card title="Add SOAP Note">
          <textarea 
            value={note} 
            onChange={(e) => setNote(e.target.value)} 
            placeholder="Enter SOAP note (Subjective, Objective, Assessment, Plan)..."
            className="w-full border rounded p-2 text-sm" 
            rows={5} 
          />
          <Button 
            onClick={saveSOAPNote} 
            disabled={!note.trim() || savingNote}
            className="mt-2"
          >
            {savingNote ? 'Saving...' : 'Save Note'}
          </Button>
        </Card>
      )}

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="medical-history">Medical History</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          {!access?.canSeeTimeline ? (
            <Card className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">You don't have permission to view timeline events</p>
            </Card>
          ) : events.length === 0 ? (
            <Card className="p-8 text-center">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No timeline events yet</p>
            </Card>
          ) : (
            events.map((event) => {
              const Icon = getEventIcon(event.type);
              const colorClass = getEventColor(event.type);
              
              return (
                <Card key={event.id} className="p-4">
                  <div className="flex gap-4">
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{event.label}</h3>
                        <span className="text-sm text-gray-500">
                          {formatDate(event.created_at)}
                        </span>
                      </div>
                      {event.data && (
                        <div className="mt-2 text-sm text-gray-600">
                          <pre className="bg-gray-50 p-2 rounded overflow-auto">
                            {JSON.stringify(event.data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications" className="space-y-4">
          {!access?.canSeeMeds ? (
            <Card className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">You don't have permission to view medications</p>
            </Card>
          ) : medications.length === 0 ? (
            <Card className="p-8 text-center">
              <Pill className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No medications recorded</p>
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
                  <Badge variant={med.is_active ? "default" : "secondary"}>
                    {med.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-4">
          {!access?.canSeeAppointments ? (
            <Card className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">You don't have permission to view appointments</p>
            </Card>
          ) : appointments.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No appointments recorded</p>
            </Card>
          ) : (
            appointments.map((appt) => (
              <Card key={appt.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      {new Date(appt.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} at {appt.time}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {appt.reason} • {appt.type} • with {appt.provider?.full_name || 'Provider'}
                    </p>
                  </div>
                  <Badge>{appt.status}</Badge>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Medical History Tab */}
        <TabsContent value="medical-history" className="space-y-6">
          {!access?.canSeeMeds ? (
            <Card className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">You don't have permission to view medical history</p>
            </Card>
          ) : !intake ? (
            <Card className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No medical history recorded</p>
            </Card>
          ) : (
            <>
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Medical Conditions</h3>
                <div className="flex flex-wrap gap-2">
                  {intake.conditions?.length > 0 ? (
                    intake.conditions.map((condition, i) => (
                      <Badge key={i} variant="secondary">{condition}</Badge>
                    ))
                  ) : (
                    <p className="text-gray-500">None reported</p>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Allergies</h3>
                <div className="flex flex-wrap gap-2">
                  {intake.allergies?.length > 0 ? (
                    intake.allergies.map((allergy, i) => (
                      <Badge key={i} variant="destructive">{allergy}</Badge>
                    ))
                  ) : (
                    <p className="text-gray-500">None reported</p>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Previous Surgeries</h3>
                <div className="flex flex-wrap gap-2">
                  {intake.surgeries?.length > 0 ? (
                    intake.surgeries.map((surgery, i) => (
                      <Badge key={i} variant="outline">{surgery}</Badge>
                    ))
                  ) : (
                    <p className="text-gray-500">None reported</p>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Family History</h3>
                <div className="flex flex-wrap gap-2">
                  {intake.family_history?.length > 0 ? (
                    intake.family_history.map((history, i) => (
                      <Badge key={i} variant="outline">{history}</Badge>
                    ))
                  ) : (
                    <p className="text-gray-500">None reported</p>
                  )}
                </div>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          {!access?.canSeeUploads ? (
            <Card className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">You don't have permission to view documents</p>
            </Card>
          ) : uploads.length === 0 ? (
            <Card className="p-8 text-center">
              <Upload className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No documents uploaded</p>
            </Card>
          ) : (
            <Card>
              <div className="p-6">
                <h3 className="font-semibold mb-4">Uploaded Documents</h3>
              <div className="space-y-3">
                {uploads.map((u, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <a 
                      href={u.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                    >
                      <span>📄</span>
                      <span>{u.filename}</span>
                    </a>
                    <div className="text-sm text-gray-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}