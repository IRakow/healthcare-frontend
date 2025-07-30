import { supabase } from '@/lib/supabase';

// Service for fetching public/demo data without authentication
// Uses either public tables or hardcoded demo user IDs

const DEMO_USER_ID = 'demo-user-001'; // You can set this to a real user ID for demos

export const publicDataService = {
  // Fetch basic health stats
  async getHealthStats() {
    try {
      // Try to get real data from a demo user
      const { data: vitals } = await supabase
        .from('wearables')
        .select('heart_rate, sleep_hours, hydration_oz, steps')
        .eq('user_id', DEMO_USER_ID)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      const { data: nutrition } = await supabase
        .from('nutrition_summary')
        .select('protein_g, calories, carbs_g, fat_g')
        .eq('user_id', DEMO_USER_ID)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      const { data: aiLogs } = await supabase
        .from('ai_conversations')
        .select('id')
        .eq('user_id', DEMO_USER_ID)
        .gte('created_at', new Date().toISOString().split('T')[0]);

      return {
        success: true,
        data: {
          heartRate: vitals?.heart_rate ? `${vitals.heart_rate} bpm` : '72 bpm',
          sleep: vitals?.sleep_hours ? `${vitals.sleep_hours} hrs` : '7.5 hrs',
          protein: nutrition?.protein_g ? `${nutrition.protein_g}g` : '65g',
          hydration: vitals?.hydration_oz ? `${vitals.hydration_oz} oz` : '64 oz',
          steps: vitals?.steps ? vitals.steps.toLocaleString() : '8,432',
          aiLogs: aiLogs?.length?.toString() || '3',
          calories: nutrition?.calories || 1850,
          carbs: nutrition?.carbs_g || 210,
          fat: nutrition?.fat_g || 70
        }
      };
    } catch (error) {
      console.log('Using fallback demo data');
      // Return default demo data if Supabase fails
      return {
        success: false,
        data: {
          heartRate: '72 bpm',
          sleep: '7.5 hrs',
          protein: '65g',
          hydration: '64 oz',
          steps: '8,432',
          aiLogs: '3',
          calories: 1850,
          carbs: 210,
          fat: 70
        }
      };
    }
  },

  // Fetch upcoming appointments
  async getUpcomingAppointments() {
    try {
      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          appointment_type,
          provider:providers(name),
          status
        `)
        .eq('patient_id', DEMO_USER_ID)
        .gte('appointment_date', new Date().toISOString())
        .order('appointment_date')
        .limit(3);

      if (appointments && appointments.length > 0) {
        return {
          success: true,
          data: appointments.map(apt => ({
            id: apt.id,
            title: apt.appointment_type || 'Medical Appointment',
            provider: apt.provider?.name || 'Healthcare Provider',
            date: new Date(apt.appointment_date).toLocaleDateString(),
            time: new Date(apt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }))
        };
      }

      // Fallback demo appointments
      return {
        success: false,
        data: [
          {
            id: '1',
            title: 'Annual Checkup',
            provider: 'Dr. Smith - Primary Care',
            date: 'Dec 15, 2024',
            time: '2:00 PM'
          },
          {
            id: '2',
            title: 'Lab Work',
            provider: 'Quest Diagnostics',
            date: 'Dec 20, 2024',
            time: '9:00 AM'
          }
        ]
      };
    } catch (error) {
      return {
        success: false,
        data: [
          {
            id: '1',
            title: 'Annual Checkup',
            provider: 'Dr. Smith - Primary Care',
            date: 'Dec 15, 2024',
            time: '2:00 PM'
          },
          {
            id: '2',
            title: 'Lab Work',
            provider: 'Quest Diagnostics',
            date: 'Dec 20, 2024',
            time: '9:00 AM'
          }
        ]
      };
    }
  },

  // Fetch medications
  async getMedications() {
    try {
      const { data: medications } = await supabase
        .from('medications')
        .select('*')
        .eq('patient_id', DEMO_USER_ID)
        .eq('active', true)
        .limit(5);

      if (medications && medications.length > 0) {
        return {
          success: true,
          data: medications.map(med => ({
            id: med.id,
            name: med.medication_name,
            dosage: med.dosage,
            frequency: med.frequency,
            status: 'Active'
          }))
        };
      }

      // Fallback demo medications
      return {
        success: false,
        data: [
          {
            id: '1',
            name: 'Metformin',
            dosage: '500mg',
            frequency: 'Twice daily with meals',
            status: 'Active'
          },
          {
            id: '2',
            name: 'Lisinopril',
            dosage: '10mg',
            frequency: 'Once daily in the morning',
            status: 'Active'
          }
        ]
      };
    } catch (error) {
      return {
        success: false,
        data: [
          {
            id: '1',
            name: 'Metformin',
            dosage: '500mg',
            frequency: 'Twice daily with meals',
            status: 'Active'
          },
          {
            id: '2',
            name: 'Lisinopril',
            dosage: '10mg',
            frequency: 'Once daily in the morning',
            status: 'Active'
          }
        ]
      };
    }
  },

  // Fetch recent documents
  async getRecentDocuments() {
    try {
      const { data: documents } = await supabase
        .from('patient_files')
        .select('*')
        .eq('patient_id', DEMO_USER_ID)
        .order('uploaded_at', { ascending: false })
        .limit(5);

      if (documents && documents.length > 0) {
        return {
          success: true,
          data: documents.map(doc => ({
            id: doc.id,
            name: doc.file_name,
            type: doc.file_type,
            date: new Date(doc.uploaded_at).toLocaleDateString()
          }))
        };
      }

      // Fallback demo documents
      return {
        success: false,
        data: [
          {
            id: '1',
            name: 'Lab Results - CBC',
            type: 'Lab Report',
            date: 'Dec 1, 2024'
          },
          {
            id: '2',
            name: 'Visit Summary',
            type: 'Clinical Note',
            date: 'Nov 15, 2024'
          }
        ]
      };
    } catch (error) {
      return {
        success: false,
        data: [
          {
            id: '1',
            name: 'Lab Results - CBC',
            type: 'Lab Report',
            date: 'Dec 1, 2024'
          },
          {
            id: '2',
            name: 'Visit Summary',
            type: 'Clinical Note',
            date: 'Nov 15, 2024'
          }
        ]
      };
    }
  }
};

// Configuration function to set demo user ID if needed
export function setDemoUserId(userId: string) {
  // You could store this in localStorage or a global state
  localStorage.setItem('demo_user_id', userId);
}

export function getDemoUserId(): string {
  return localStorage.getItem('demo_user_id') || DEMO_USER_ID;
}