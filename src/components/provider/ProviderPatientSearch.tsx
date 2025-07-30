import React, { useEffect, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, Search, Calendar, Pill, AlertCircle, Phone, Mail, ChevronRight, Loader2, Clock, Heart, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { debounce } from 'lodash';

interface PatientProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  age: number;
  lastVisit?: string;
  nextAppointment?: string;
  primaryConditions: string[];
  activeMedications: number;
  riskScore?: 'low' | 'medium' | 'high';
  recentVitals?: {
    bloodPressure?: string;
    heartRate?: number;
    lastRecorded?: string;
  };
  complianceScore?: number;
  hasUnreviewedLabs?: boolean;
  hasOverdueTasks?: boolean;
}

interface SearchFilters {
  hasAppointmentToday: boolean;
  hasHighRisk: boolean;
  hasUnreviewedLabs: boolean;
  condition?: string;
}

export const ProviderPatientSearch: React.FC = () => {
  const { userId } = useUser();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PatientProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    hasAppointmentToday: false,
    hasHighRisk: false,
    hasUnreviewedLabs: false
  });
  const [recentPatients, setRecentPatients] = useState<PatientProfile[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);

  useEffect(() => {
    if (userId) {
      loadRecentPatients();
      loadCommonConditions();
    }
  }, [userId]);

  useEffect(() => {
    if (query || Object.values(filters).some(v => v)) {
      debouncedSearch();
    } else {
      setResults([]);
    }
  }, [query, filters]);

  const loadRecentPatients = async () => {
    try {
      const { data: recentAppointments, error } = await supabase
        .from('appointments')
        .select(`
          patient_id,
          patient:patients(
            id,
            user:auth.users(
              email,
              user_metadata
            ),
            profile:patient_profiles(
              date_of_birth,
              chronic_conditions
            )
          )
        `)
        .eq('provider_id', userId)
        .eq('status', 'completed')
        .order('appointment_date', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Get unique patients
      const uniquePatients = Array.from(
        new Map(recentAppointments?.map(apt => [apt.patient_id, apt.patient]) || []).values()
      );

      const formattedPatients = await Promise.all(uniquePatients.map(async (patient) => {
        return await formatPatientData(patient.id);
      }));

      setRecentPatients(formattedPatients.filter(p => p !== null) as PatientProfile[]);
    } catch (error) {
      console.error('Failed to load recent patients:', error);
    }
  };

  const loadCommonConditions = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_profiles')
        .select('chronic_conditions');

      if (error) throw error;

      // Extract unique conditions
      const allConditions = data?.flatMap(p => p.chronic_conditions || []) || [];
      const uniqueConditions = Array.from(new Set(allConditions));
      setConditions(uniqueConditions.slice(0, 10)); // Top 10 conditions
    } catch (error) {
      console.error('Failed to load conditions:', error);
    }
  };

  const formatPatientData = async (patientId: string): Promise<PatientProfile | null> => {
    try {
      // Load patient data
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
            chronic_conditions
          )
        `)
        .eq('id', patientId)
        .single();

      if (patientError) throw patientError;

      // Load appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .order('appointment_date', { ascending: false });

      // Load medications count
      const { count: medCount } = await supabase
        .from('medications')
        .select('*', { count: 'exact', head: true })
        .eq('patient_id', patientId)
        .eq('is_active', true);

      // Load recent vitals
      const { data: vitals } = await supabase
        .from('vitals')
        .select('*')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();

      // Load risk flags
      const { data: riskFlags } = await supabase
        .from('patient_risk_flags')
        .select('severity')
        .eq('patient_id', patientId)
        .eq('is_active', true);

      // Check for unreviewed labs
      const { count: unreviewedLabs } = await supabase
        .from('lab_results')
        .select('*', { count: 'exact', head: true })
        .eq('patient_id', patientId)
        .is('review.status', null);

      // Calculate age
      const birthDate = new Date(patient.profile?.date_of_birth || '');
      const age = new Date().getFullYear() - birthDate.getFullYear();

      // Find last visit and next appointment
      const completedAppointments = appointments?.filter(a => a.status === 'completed') || [];
      const upcomingAppointments = appointments?.filter(a => 
        a.status === 'scheduled' && new Date(a.appointment_date) > new Date()
      ) || [];

      // Determine risk score
      const highRiskCount = riskFlags?.filter(f => f.severity === 'high').length || 0;
      const mediumRiskCount = riskFlags?.filter(f => f.severity === 'medium').length || 0;
      const riskScore = highRiskCount > 0 ? 'high' : mediumRiskCount > 0 ? 'medium' : 'low';

      return {
        id: patient.id,
        name: patient.user?.user_metadata?.full_name || 'Unknown Patient',
        email: patient.user?.email || '',
        phone: patient.user?.user_metadata?.phone,
        age,
        lastVisit: completedAppointments[0]?.appointment_date,
        nextAppointment: upcomingAppointments[0]?.appointment_date,
        primaryConditions: patient.profile?.chronic_conditions || [],
        activeMedications: medCount || 0,
        riskScore: riskScore as 'low' | 'medium' | 'high',
        recentVitals: vitals ? {
          bloodPressure: `${vitals.blood_pressure_systolic}/${vitals.blood_pressure_diastolic}`,
          heartRate: vitals.heart_rate,
          lastRecorded: vitals.recorded_at
        } : undefined,
        hasUnreviewedLabs: (unreviewedLabs || 0) > 0,
        // Calculate compliance score (simplified)
        complianceScore: completedAppointments.length > 0 ? 85 : 0
      };
    } catch (error) {
      console.error('Failed to format patient data:', error);
      return null;
    }
  };

  const searchPatients = async () => {
    setLoading(true);
    try {
      let patientIds: string[] = [];

      // Search by name or email
      if (query) {
        const { data: users } = await supabase
          .from('auth.users')
          .select('id')
          .or(`email.ilike.%${query}%,raw_user_meta_data->>full_name.ilike.%${query}%`);

        const userIds = users?.map(u => u.id) || [];
        
        if (userIds.length > 0) {
          const { data: patients } = await supabase
            .from('patients')
            .select('id')
            .in('user_id', userIds);
          
          patientIds = patients?.map(p => p.id) || [];
        }
      } else {
        // If no query, get all patients for this provider
        const { data: appointments } = await supabase
          .from('appointments')
          .select('patient_id')
          .eq('provider_id', userId);

        patientIds = Array.from(new Set(appointments?.map(a => a.patient_id) || []));
      }

      // Format patient data
      const formattedPatients = await Promise.all(
        patientIds.slice(0, 20).map(id => formatPatientData(id))
      );

      let filteredResults = formattedPatients.filter(p => p !== null) as PatientProfile[];

      // Apply filters
      if (filters.hasAppointmentToday) {
        const today = new Date().toDateString();
        filteredResults = filteredResults.filter(p => 
          p.nextAppointment && new Date(p.nextAppointment).toDateString() === today
        );
      }

      if (filters.hasHighRisk) {
        filteredResults = filteredResults.filter(p => p.riskScore === 'high');
      }

      if (filters.hasUnreviewedLabs) {
        filteredResults = filteredResults.filter(p => p.hasUnreviewedLabs);
      }

      if (filters.condition) {
        filteredResults = filteredResults.filter(p => 
          p.primaryConditions.includes(filters.condition!)
        );
      }

      setResults(filteredResults);
    } catch (error) {
      console.error('Failed to search patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce(searchPatients, 300),
    [query, filters, userId]
  );

  const getRiskBadge = (riskScore?: string) => {
    switch (riskScore) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">High Risk</Badge>;
      case 'medium':
        return <Badge variant="default" className="text-xs">Medium Risk</Badge>;
      default:
        return null;
    }
  };

  const navigateToPatient = (patientId: string) => {
    window.location.href = `/provider/patient/${patientId}/overview`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur p-6 shadow space-y-6"
    >
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-primary" /> Patient Search
        </h3>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, or condition..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.hasAppointmentToday ? "default" : "outline"}
            size="sm"
            onClick={() => setFilters({ ...filters, hasAppointmentToday: !filters.hasAppointmentToday })}
          >
            <Calendar className="w-4 h-4 mr-1" />
            Today's Appointments
          </Button>
          <Button
            variant={filters.hasHighRisk ? "default" : "outline"}
            size="sm"
            onClick={() => setFilters({ ...filters, hasHighRisk: !filters.hasHighRisk })}
          >
            <AlertCircle className="w-4 h-4 mr-1" />
            High Risk
          </Button>
          <Button
            variant={filters.hasUnreviewedLabs ? "default" : "outline"}
            size="sm"
            onClick={() => setFilters({ ...filters, hasUnreviewedLabs: !filters.hasUnreviewedLabs })}
          >
            <Activity className="w-4 h-4 mr-1" />
            Unreviewed Labs
          </Button>
        </div>

        {/* Condition Filter */}
        {conditions.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Filter by condition:</p>
            <div className="flex flex-wrap gap-2">
              {conditions.map((condition) => (
                <Badge
                  key={condition}
                  variant={filters.condition === condition ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFilters({ 
                    ...filters, 
                    condition: filters.condition === condition ? undefined : condition 
                  })}
                >
                  {condition}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Recent Patients (when no search) */}
          {!query && results.length === 0 && recentPatients.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Patients</h4>
              <ul className="space-y-3">
                {recentPatients.map((patient) => (
                  <PatientCard key={patient.id} patient={patient} onClick={() => navigateToPatient(patient.id)} />
                ))}
              </ul>
            </div>
          )}

          {/* Search Results */}
          {results.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Found {results.length} patient{results.length !== 1 ? 's' : ''}
              </p>
              <ul className="space-y-3">
                <AnimatePresence>
                  {results.map((patient) => (
                    <motion.div
                      key={patient.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <PatientCard patient={patient} onClick={() => navigateToPatient(patient.id)} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          )}

          {/* No Results */}
          {query && results.length === 0 && !loading && (
            <Card className="p-8 text-center">
              <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-muted-foreground">No patients found matching your search</p>
            </Card>
          )}
        </div>
      )}
    </motion.div>
  );
};

// Patient Card Component
const PatientCard: React.FC<{ patient: PatientProfile; onClick: () => void }> = ({ patient, onClick }) => {
  const getRiskBadge = (riskScore?: string) => {
    switch (riskScore) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">High Risk</Badge>;
      case 'medium':
        return <Badge variant="default" className="text-xs">Medium Risk</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card 
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h5 className="font-medium text-gray-800">{patient.name}</h5>
            <span className="text-sm text-muted-foreground">• {patient.age} years</span>
            {getRiskBadge(patient.riskScore)}
            {patient.hasUnreviewedLabs && (
              <Badge variant="outline" className="text-xs bg-yellow-50">
                Labs Pending
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {patient.email}
            </span>
            {patient.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {patient.phone}
              </span>
            )}
          </div>

          {patient.primaryConditions.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {patient.primaryConditions.slice(0, 3).map((condition, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {condition}
                </Badge>
              ))}
              {patient.primaryConditions.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{patient.primaryConditions.length - 3} more
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center gap-4 text-xs">
            {patient.lastVisit && (
              <span className="text-gray-600">
                Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
              </span>
            )}
            {patient.nextAppointment && (
              <span className="text-blue-600 font-medium">
                Next: {new Date(patient.nextAppointment).toLocaleDateString()}
              </span>
            )}
            <span className="text-gray-600">
              <Pill className="w-3 h-3 inline mr-1" />
              {patient.activeMedications} active meds
            </span>
          </div>

          {patient.recentVitals && (
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                BP: {patient.recentVitals.bloodPressure}
              </span>
              <span>HR: {patient.recentVitals.heartRate}</span>
              <span className="text-muted-foreground">
                <Clock className="w-3 h-3 inline mr-1" />
                {new Date(patient.recentVitals.lastRecorded!).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </Card>
  );
};