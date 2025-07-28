import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface AuditLogEntry {
  action: string
  entity_type: string
  entity_id?: string
  metadata?: Record<string, any>
  ip_address?: string
  user_agent?: string
}

export function useAuditLogger() {
  const { user } = useAuth()

  const log = async (entry: AuditLogEntry) => {
    if (!user) return

    try {
      // Get client info
      const ip_address = await getClientIP()
      const user_agent = navigator.userAgent

      const { error } = await supabase.from('audit_logs').insert({
        ...entry,
        user_id: user.id,
        ip_address: ip_address || entry.ip_address,
        user_agent: user_agent || entry.user_agent,
        created_at: new Date().toISOString()
      })

      if (error) {
        console.error('Failed to create audit log:', error)
      }
    } catch (err) {
      console.error('Audit logging error:', err)
    }
  }

  // HIPAA-compliant audit actions
  const logPatientDataAccess = (patientId: string, dataType: string) => {
    return log({
      action: 'patient_data.accessed',
      entity_type: 'patient',
      entity_id: patientId,
      metadata: { data_type: dataType }
    })
  }

  const logPatientDataModification = (patientId: string, dataType: string, changes: any) => {
    return log({
      action: 'patient_data.modified',
      entity_type: 'patient',
      entity_id: patientId,
      metadata: { data_type: dataType, changes }
    })
  }

  const logFileAccess = (fileId: string, fileName: string, action: 'viewed' | 'downloaded') => {
    return log({
      action: `file.${action}`,
      entity_type: 'file',
      entity_id: fileId,
      metadata: { file_name: fileName }
    })
  }

  const logAppointmentAction = (appointmentId: string, action: string, details?: any) => {
    return log({
      action: `appointment.${action}`,
      entity_type: 'appointment',
      entity_id: appointmentId,
      metadata: details
    })
  }

  const logAuthEvent = (action: 'login' | 'logout' | 'failed_login', metadata?: any) => {
    return log({
      action: `auth.${action}`,
      entity_type: 'user',
      entity_id: user?.id,
      metadata
    })
  }

  const logAdminAction = (action: string, targetType: string, targetId: string, details?: any) => {
    return log({
      action: `admin.${action}`,
      entity_type: targetType,
      entity_id: targetId,
      metadata: details
    })
  }

  const logConsentAction = (patientId: string, action: 'granted' | 'revoked', consentType: string) => {
    return log({
      action: `consent.${action}`,
      entity_type: 'patient',
      entity_id: patientId,
      metadata: { consent_type: consentType }
    })
  }

  const logEmergencyAccess = (patientId: string, reason: string) => {
    return log({
      action: 'emergency_access.granted',
      entity_type: 'patient',
      entity_id: patientId,
      metadata: { reason }
    })
  }

  return {
    log,
    logPatientDataAccess,
    logPatientDataModification,
    logFileAccess,
    logAppointmentAction,
    logAuthEvent,
    logAdminAction,
    logConsentAction,
    logEmergencyAccess
  }
}

// Helper function to get client IP (requires backend support)
async function getClientIP(): Promise<string | null> {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip
  } catch {
    return null
  }
}