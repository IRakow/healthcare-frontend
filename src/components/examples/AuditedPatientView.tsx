import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { auditService } from '@/services/auditService';

interface PatientData {
  id: string;
  name: string;
  vitals?: any;
  medications?: any;
  allergies?: any;
}

export default function AuditedPatientView({ patientId }: { patientId: string }) {
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [activeTab, setActiveTab] = useState('vitals');

  useEffect(() => {
    // Log initial patient file view
    auditService.logPatientView(patientId, 'Overview');
    
    // Fetch patient data
    fetchPatientData();
  }, [patientId]);

  const fetchPatientData = async () => {
    // Simulated data fetch
    setPatient({
      id: patientId,
      name: 'John Doe',
      vitals: { bp: '120/80', temp: '98.6°F' },
      medications: ['Lisinopril', 'Metformin'],
      allergies: ['Penicillin']
    });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // Log which section of patient file was viewed
    auditService.logPatientView(patientId, tab);
    
    // Log access to sensitive medical records
    if (tab === 'medications' || tab === 'allergies') {
      auditService.logMedicalRecordAccess(patientId, tab);
    }
  };

  const handlePatientUpdate = async (field: string, value: any) => {
    // Update patient data
    const changes = { [field]: value };
    
    // Log the update
    await auditService.logPatientUpdate(patientId, changes);
    
    // Perform actual update...
  };

  if (!patient) return <div>Loading...</div>;

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-4">{patient.name}</h2>
      
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <Tabs.List>
          <Tabs.Trigger value="vitals">Vitals</Tabs.Trigger>
          <Tabs.Trigger value="medications">Medications</Tabs.Trigger>
          <Tabs.Trigger value="allergies">Allergies</Tabs.Trigger>
        </Tabs.List>
        
        <Tabs.Content value="vitals">
          <div className="space-y-2">
            <p>Blood Pressure: {patient.vitals?.bp}</p>
            <p>Temperature: {patient.vitals?.temp}</p>
          </div>
        </Tabs.Content>
        
        <Tabs.Content value="medications">
          <ul className="list-disc pl-5">
            {patient.medications?.map((med: string, i: number) => (
              <li key={i}>{med}</li>
            ))}
          </ul>
        </Tabs.Content>
        
        <Tabs.Content value="allergies">
          <ul className="list-disc pl-5">
            {patient.allergies?.map((allergy: string, i: number) => (
              <li key={i} className="text-red-600">{allergy}</li>
            ))}
          </ul>
        </Tabs.Content>
      </Tabs>
    </Card>
  );
}