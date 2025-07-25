import { supabase } from '@/lib/supabase';

interface AuditContext {
  [key: string]: any;
}

export const auditService = {
  // Patient-related actions
  async logPatientView(patientId: string, page: string) {
    await supabase.from('audit_logs').insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      action: 'VIEWED_PATIENT_FILE',
      context: { patient_id: patientId, page },
    });
  },

  async logPatientUpdate(patientId: string, changes: any) {
    await supabase.from('audit_logs').insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      action: 'UPDATED_PATIENT_INFO',
      context: { patient_id: patientId, changes },
    });
  },

  // Medical record actions
  async logMedicalRecordAccess(patientId: string, recordType: string) {
    await supabase.from('audit_logs').insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      action: 'ACCESSED_MEDICAL_RECORD',
      context: { patient_id: patientId, record_type: recordType },
    });
  },

  // Invoice actions
  async logInvoiceGeneration(employerId: string, invoiceId: string, amount: number) {
    await supabase.from('audit_logs').insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      action: 'GENERATED_INVOICE',
      context: { employer_id: employerId, invoice_id: invoiceId, amount },
    });
  },

  async logInvoiceEmail(invoiceId: string, recipientEmail: string) {
    await supabase.from('audit_logs').insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      action: 'SENT_INVOICE_EMAIL',
      context: { invoice_id: invoiceId, recipient: recipientEmail },
    });
  },

  // Authentication actions
  async logLogin(email: string, role: string) {
    await supabase.from('audit_logs').insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      action: 'USER_LOGIN',
      context: { email, role, timestamp: new Date().toISOString() },
    });
  },

  async logLogout(email: string) {
    await supabase.from('audit_logs').insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      action: 'USER_LOGOUT',
      context: { email, timestamp: new Date().toISOString() },
    });
  },

  // AI Assistant actions
  async logAIQuery(query: string, model: string, employerId?: string) {
    await supabase.from('audit_logs').insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      action: 'AI_QUERY',
      context: { query, model, employer_id: employerId },
    });
  },

  async logVoiceTranscription(duration: number, employerId?: string) {
    await supabase.from('audit_logs').insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      action: 'VOICE_TRANSCRIPTION',
      context: { duration_seconds: duration, employer_id: employerId },
    });
  },

  // File operations
  async logFileUpload(fileName: string, fileSize: number, bucket: string) {
    await supabase.from('audit_logs').insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      action: 'FILE_UPLOAD',
      context: { file_name: fileName, file_size: fileSize, bucket },
    });
  },

  async logFileDownload(fileName: string, bucket: string) {
    await supabase.from('audit_logs').insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      action: 'FILE_DOWNLOAD',
      context: { file_name: fileName, bucket },
    });
  },

  // Symptom checker actions
  async logSymptomCheck(symptoms: string, analysisId?: string) {
    await supabase.from('audit_logs').insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      action: 'SYMPTOM_CHECK',
      context: { symptoms, analysis_id: analysisId },
    });
  },

  // Security-related actions
  async logFailedLogin(email: string, reason: string) {
    await supabase.from('audit_logs').insert({
      user_id: null,
      action: 'FAILED_LOGIN',
      context: { email, reason, ip: await getClientIP() },
    });
  },

  async logPermissionDenied(resource: string, action: string) {
    await supabase.from('audit_logs').insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      action: 'PERMISSION_DENIED',
      context: { resource, attempted_action: action },
    });
  },

  // Generic audit logging
  async log(action: string, context: AuditContext = {}) {
    await supabase.from('audit_logs').insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      action,
      context,
    });
  },
};

// Helper function to get client IP (placeholder - implement based on your setup)
async function getClientIP(): Promise<string> {
  // In production, you might get this from request headers or a service
  return 'Unknown';
}