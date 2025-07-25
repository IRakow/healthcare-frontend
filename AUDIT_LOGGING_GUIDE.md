# Audit Logging Guide

## Overview
The audit logging system tracks all important actions within the application for compliance, security, and debugging purposes.

## Quick Start

### Basic Usage
```typescript
import { auditService } from '@/services/auditService';

// Log a simple action
await auditService.log('USER_ACTION', { 
  details: 'User performed an action' 
});

// Log patient-related actions
await auditService.logPatientView('patient123', 'Vitals');
await auditService.logMedicalRecordAccess('patient123', 'medications');
```

### Using the Supabase Client Directly
```typescript
import { supabase } from '@/lib/supabase';

await supabase.from('audit_logs').insert({
  user_id: (await supabase.auth.getUser()).data.user?.id,
  action: 'VIEWED_PATIENT_FILE',
  context: { patient_id: 'abc123', page: 'Vitals' },
});
```

## Available Methods

### Patient Actions
- `logPatientView(patientId, page)` - Track patient file views
- `logPatientUpdate(patientId, changes)` - Track patient data updates
- `logMedicalRecordAccess(patientId, recordType)` - Track sensitive record access

### Invoice Actions
- `logInvoiceGeneration(employerId, invoiceId, amount)` - Track invoice creation
- `logInvoiceEmail(invoiceId, recipientEmail)` - Track invoice emails

### Authentication Actions
- `logLogin(email, role)` - Track user logins
- `logLogout(email)` - Track user logouts
- `logFailedLogin(email, reason)` - Track failed login attempts

### AI Assistant Actions
- `logAIQuery(query, model, employerId)` - Track AI queries
- `logVoiceTranscription(duration, employerId)` - Track voice usage

### File Operations
- `logFileUpload(fileName, fileSize, bucket)` - Track file uploads
- `logFileDownload(fileName, bucket)` - Track file downloads

### Symptom Checker
- `logSymptomCheck(symptoms, analysisId)` - Track symptom checks

### Security Actions
- `logPermissionDenied(resource, action)` - Track permission denials

## Integration Examples

### In React Components
```typescript
import { auditService } from '@/services/auditService';

function PatientDashboard({ patientId }) {
  useEffect(() => {
    // Log when component mounts
    auditService.logPatientView(patientId, 'Dashboard');
  }, [patientId]);

  const handleUpdate = async (data) => {
    await updatePatient(data);
    await auditService.logPatientUpdate(patientId, data);
  };
  
  return <div>...</div>;
}
```

### In API Routes
```typescript
export async function generateInvoice(employerId: string) {
  const invoice = await createInvoice(employerId);
  
  await auditService.logInvoiceGeneration(
    employerId, 
    invoice.id, 
    invoice.amount
  );
  
  return invoice;
}
```

### In Auth Flows
```typescript
const handleLogin = async (email, password) => {
  try {
    const { user } = await signIn(email, password);
    await auditService.logLogin(email, user.role);
  } catch (error) {
    await auditService.logFailedLogin(email, error.message);
    throw error;
  }
};
```

## Viewing Audit Logs

### Admin UI
Navigate to `/owner/audit-logs` to view the audit log interface with:
- Search and filtering capabilities
- Export to CSV
- Detailed context viewing

### Database Queries
```sql
-- View recent actions by a user
SELECT * FROM audit_log_summary 
WHERE user_email = 'user@example.com'
ORDER BY created_at DESC
LIMIT 50;

-- Find all patient file accesses
SELECT * FROM audit_logs
WHERE action LIKE '%PATIENT%'
ORDER BY created_at DESC;

-- Search by context
SELECT * FROM audit_logs
WHERE context @> '{"patient_id": "abc123"}'::jsonb;
```

## Best Practices

1. **Log Important Actions**: Focus on actions that matter for compliance and security
2. **Include Context**: Always include relevant IDs and details
3. **Don't Log Sensitive Data**: Never log passwords, SSNs, or credit card numbers
4. **Use Consistent Action Names**: Use UPPER_SNAKE_CASE for action names
5. **Fire and Forget**: Audit logging should not block user actions

## Security Considerations

- Audit logs are immutable - they cannot be updated or deleted
- Only admin and owner roles can view audit logs
- All logs include automatic timestamps
- User IDs are automatically captured from the session

## Automatic Triggers

The following tables have automatic audit triggers:
- `employers` - All changes are logged
- `invoices` - All changes are logged

Additional triggers can be added using:
```sql
CREATE TRIGGER audit_[table_name]
  AFTER INSERT OR UPDATE OR DELETE ON [table_name]
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();
```