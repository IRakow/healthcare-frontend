-- Create audit logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target TEXT,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs(target);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Add comments
COMMENT ON TABLE audit_logs IS 'Audit trail for user actions';
COMMENT ON COLUMN audit_logs.action IS 'Type of action performed (e.g., invoice_pdf_download, invoice_pdf_generate)';
COMMENT ON COLUMN audit_logs.target IS 'ID of the resource being acted upon';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional context about the action';

-- Example audit log actions:
-- invoice_pdf_download - User downloaded/viewed an invoice PDF
-- invoice_pdf_generate - User generated a new invoice PDF
-- invoice_created - New invoice was created
-- invoice_updated - Invoice was modified
-- invoice_sent - Invoice was sent to employer