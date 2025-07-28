import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, HeartPulse, ClipboardList, Calendar, Phone, Mail, AlertCircle, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PatientOverviewCardProps {
  patientId: string;
}

interface VitalTrend {
  current: number;
  previous: number;
  trend: 'up' | 'down' | 'stable';
}

interface PatientData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  age: number;
  dateOfBirth: string;
  bloodType?: string;
  allergies?: string[];
  lastVisit?: string;
  nextAppointment?: string;
  vitals: {
    bloodPressure?: { value: string; trend: VitalTrend };
    heartRate?: { value: number; trend: VitalTrend };
    temperature?: { value: number; trend: VitalTrend };
    weight?: { value: number; trend: VitalTrend };
    oxygenSaturation?: { value: number; trend: VitalTrend };
  };
  chronicConditions?: string[];
  activeMedications?: number;
  recentLabs?: {
    name: string;
    date: string;
    hasAbnormal: boolean;
  }[];
  riskFlags?: {
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }[];
  clinicalSummary?: string;
}

export const PatientOverviewCard: React.FC<PatientOverviewCardProps> = ({ patientId }) => {
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientId) {
      loadPatientData();
    }
  }, [patientId]);

  const loadPatientData = async () => {
    setLoading(true);
    try {
      // Load patient profile
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select(`
          *,
          user:auth.users(
            email,
            user_metadata
          ),
          profile:patient_profiles(
            date_of_birth,
            blood_type,
            allergies,
            chronic_conditions
          )
        `)
        .eq('id', patientId)
        .single();

      if (patientError) throw patientError;

      // Load latest vitals with trends
      const { data: vitals, error: vitalsError } = await supabase
        .from('vitals')
        .select('*')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false })
        .limit(2);

      if (vitalsError) throw vitalsError;

      // Load appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .order('appointment_date', { ascending: false });

      if (appointmentsError) throw appointmentsError;

      // Load medications count
      const { count: medicationCount, error: medError } = await supabase
        .from('medications')
        .select('*', { count: 'exact', head: true })
        .eq('patient_id', patientId)
        .eq('is_active', true);

      // Load recent labs
      const { data: labs, error: labsError } = await supabase
        .from('lab_results')
        .select('*')
        .eq('patient_id', patientId)
        .order('test_date', { ascending: false })
        .limit(3);

      if (labsError) throw labsError;

      // Load risk flags
      const { data: riskFlags, error: riskError } = await supabase
        .from('patient_risk_flags')
        .select('*')
        .eq('patient_id', patientId)
        .eq('is_active', true);

      if (riskError) throw riskError;

      // Load AI-generated summary
      const { data: summaryData, error: summaryError } = await supabase.functions.invoke('generate-patient-summary', {
        body: { patientId }
      });

      // Calculate age
      const birthDate = new Date(patient.profile?.date_of_birth || '');
      const age = new Date().getFullYear() - birthDate.getFullYear();

      // Process vitals with trends
      const currentVitals = vitals[0] || {};
      const previousVitals = vitals[1] || {};

      const calculateTrend = (current: number, previous: number): VitalTrend => {
        if (!previous) return { current, previous: 0, trend: 'stable' };
        const diff = ((current - previous) / previous) * 100;
        return {
          current,
          previous,
          trend: Math.abs(diff) < 5 ? 'stable' : diff > 0 ? 'up' : 'down'
        };
      };

      // Find last visit and next appointment
      const completedAppointments = appointments.filter(a => a.status === 'completed');
      const upcomingAppointments = appointments.filter(a => 
        a.status === 'scheduled' && new Date(a.appointment_date) > new Date()
      );

      const formattedData: PatientData = {
        id: patient.id,
        name: patient.user?.user_metadata?.full_name || 'Unknown Patient',
        email: patient.user?.email || '',
        phone: patient.user?.user_metadata?.phone,
        age,
        dateOfBirth: patient.profile?.date_of_birth || '',
        bloodType: patient.profile?.blood_type,
        allergies: patient.profile?.allergies || [],
        lastVisit: completedAppointments[0]?.appointment_date,
        nextAppointment: upcomingAppointments[0]?.appointment_date,
        vitals: {
          bloodPressure: currentVitals.blood_pressure_systolic ? {
            value: `${currentVitals.blood_pressure_systolic}/${currentVitals.blood_pressure_diastolic}`,
            trend: calculateTrend(
              currentVitals.blood_pressure_systolic,
              previousVitals.blood_pressure_systolic
            )
          } : undefined,
          heartRate: currentVitals.heart_rate ? {
            value: currentVitals.heart_rate,
            trend: calculateTrend(currentVitals.heart_rate, previousVitals.heart_rate)
          } : undefined,
          temperature: currentVitals.temperature ? {
            value: currentVitals.temperature,
            trend: calculateTrend(currentVitals.temperature, previousVitals.temperature)
          } : undefined,
          weight: currentVitals.weight ? {
            value: currentVitals.weight,
            trend: calculateTrend(currentVitals.weight, previousVitals.weight)
          } : undefined,
          oxygenSaturation: currentVitals.oxygen_saturation ? {
            value: currentVitals.oxygen_saturation,
            trend: calculateTrend(currentVitals.oxygen_saturation, previousVitals.oxygen_saturation)
          } : undefined
        },
        chronicConditions: patient.profile?.chronic_conditions || [],
        activeMedications: medicationCount || 0,
        recentLabs: labs.map(lab => ({
          name: lab.file_name,
          date: lab.test_date,
          hasAbnormal: lab.is_abnormal || false
        })),
        riskFlags: riskFlags.map(flag => ({
          type: flag.flag_type,
          severity: flag.severity,
          description: flag.description
        })),
        clinicalSummary: summaryData?.summary
      };

      setPatientData(formattedData);
    } catch (error) {
      console.error('Failed to load patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend?: VitalTrend) => {
    if (!trend) return null;
    switch (trend.trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-orange-500" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-blue-500" />;
      default:
        return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  const getRiskBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </Card>
    );
  }

  if (!patientData) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">No patient data available</p>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur p-6 shadow space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> 
            {patientData.name}, {patientData.age}
          </h3>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {patientData.email}
            </span>
            {patientData.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {patientData.phone}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm">
            {patientData.lastVisit && (
              <span className="text-muted-foreground">
                Last Visit: {new Date(patientData.lastVisit).toLocaleDateString()}
              </span>
            )}
            {patientData.nextAppointment && (
              <Badge variant="outline" className="text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                Next: {new Date(patientData.nextAppointment).toLocaleDateString()}
              </Badge>
            )}
          </div>
        </div>
        <ClipboardList className="w-6 h-6 text-gray-400" />
      </div>

      {/* Risk Flags */}
      {patientData.riskFlags && patientData.riskFlags.length > 0 && (
        <Card className="p-3 border-orange-200 bg-orange-50">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800">Risk Alerts</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {patientData.riskFlags.map((flag, i) => (
                  <Badge key={i} variant={getRiskBadgeVariant(flag.severity)} className="text-xs">
                    {flag.type}: {flag.description}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Patient Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <Card className="p-3">
          <p className="text-muted-foreground text-xs">DOB</p>
          <p className="font-medium">{new Date(patientData.dateOfBirth).toLocaleDateString()}</p>
        </Card>
        <Card className="p-3">
          <p className="text-muted-foreground text-xs">Blood Type</p>
          <p className="font-medium">{patientData.bloodType || 'Unknown'}</p>
        </Card>
        <Card className="p-3">
          <p className="text-muted-foreground text-xs">Active Meds</p>
          <p className="font-medium">{patientData.activeMedications}</p>
        </Card>
        <Card className="p-3">
          <p className="text-muted-foreground text-xs">Allergies</p>
          <p className="font-medium">{patientData.allergies?.length || 0}</p>
        </Card>
      </div>

      {/* Vitals */}
      <div>
        <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
          <HeartPulse className="w-4 h-4" /> Current Vitals
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
          {patientData.vitals.bloodPressure && (
            <Card className="p-3">
              <p className="text-muted-foreground text-xs">Blood Pressure</p>
              <div className="flex items-center gap-1">
                <p className="font-medium">{patientData.vitals.bloodPressure.value}</p>
                {getTrendIcon(patientData.vitals.bloodPressure.trend)}
              </div>
            </Card>
          )}
          {patientData.vitals.heartRate && (
            <Card className="p-3">
              <p className="text-muted-foreground text-xs">Heart Rate</p>
              <div className="flex items-center gap-1">
                <p className="font-medium">{patientData.vitals.heartRate.value} bpm</p>
                {getTrendIcon(patientData.vitals.heartRate.trend)}
              </div>
            </Card>
          )}
          {patientData.vitals.temperature && (
            <Card className="p-3">
              <p className="text-muted-foreground text-xs">Temperature</p>
              <div className="flex items-center gap-1">
                <p className="font-medium">{patientData.vitals.temperature.value}°F</p>
                {getTrendIcon(patientData.vitals.temperature.trend)}
              </div>
            </Card>
          )}
          {patientData.vitals.weight && (
            <Card className="p-3">
              <p className="text-muted-foreground text-xs">Weight</p>
              <div className="flex items-center gap-1">
                <p className="font-medium">{patientData.vitals.weight.value} lbs</p>
                {getTrendIcon(patientData.vitals.weight.trend)}
              </div>
            </Card>
          )}
          {patientData.vitals.oxygenSaturation && (
            <Card className="p-3">
              <p className="text-muted-foreground text-xs">O2 Sat</p>
              <div className="flex items-center gap-1">
                <p className="font-medium">{patientData.vitals.oxygenSaturation.value}%</p>
                {getTrendIcon(patientData.vitals.oxygenSaturation.trend)}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Clinical Info */}
      <div className="space-y-4">
        {/* Chronic Conditions */}
        {patientData.chronicConditions && patientData.chronicConditions.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">Chronic Conditions</h4>
            <div className="flex flex-wrap gap-2">
              {patientData.chronicConditions.map((condition, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {condition}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Allergies */}
        {patientData.allergies && patientData.allergies.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">Allergies</h4>
            <div className="flex flex-wrap gap-2">
              {patientData.allergies.map((allergy, i) => (
                <Badge key={i} variant="destructive" className="text-xs">
                  {allergy}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Recent Labs */}
        {patientData.recentLabs && patientData.recentLabs.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">Recent Labs</h4>
            <div className="space-y-1">
              {patientData.recentLabs.map((lab, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span>{lab.name}</span>
                  <div className="flex items-center gap-2">
                    {lab.hasAbnormal && (
                      <Badge variant="outline" className="text-xs bg-orange-50">
                        Abnormal
                      </Badge>
                    )}
                    <span className="text-muted-foreground">
                      {new Date(lab.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clinical Summary */}
        {patientData.clinicalSummary && (
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
            <p className="text-sm font-medium mb-2">AI Clinical Summary</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {patientData.clinicalSummary}
            </p>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 pt-2">
        <Button size="sm" variant="outline" onClick={() => window.location.href = `/provider/patient/${patientId}/chart`}>
          View Full Chart
        </Button>
        <Button size="sm" variant="outline" onClick={() => window.location.href = `/provider/patient/${patientId}/vitals`}>
          Record Vitals
        </Button>
        <Button size="sm" variant="default" onClick={() => window.location.href = `/provider/soap/new?patientId=${patientId}`}>
          Start SOAP Note
        </Button>
      </div>
    </motion.div>
  );
};