-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_context_gin ON audit_logs USING gin(context);

-- Add RLS (Row Level Security)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for audit logs
-- Only admins and owners can view audit logs
CREATE POLICY "Admin can view audit logs" ON audit_logs
  FOR SELECT USING (
    auth.jwt() ->> 'role' IN ('admin', 'owner')
  );

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- No one can update audit logs (immutable)
-- No one can delete audit logs (immutable)

-- Create function to log actions
CREATE OR REPLACE FUNCTION log_action(
  p_action TEXT,
  p_context JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO audit_logs (user_id, action, context)
  VALUES (auth.uid(), p_action, p_context)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function for automatic logging
CREATE OR REPLACE FUNCTION trigger_audit_log() RETURNS TRIGGER AS $$
DECLARE
  v_action TEXT;
  v_context JSONB;
BEGIN
  -- Determine action type
  v_action := TG_TABLE_NAME || '.' || TG_OP;
  
  -- Build context
  v_context := jsonb_build_object(
    'table_name', TG_TABLE_NAME,
    'operation', TG_OP,
    'schema_name', TG_TABLE_SCHEMA
  );
  
  -- Add record data based on operation
  IF TG_OP = 'INSERT' THEN
    v_context := v_context || jsonb_build_object('new_data', to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    v_context := v_context || jsonb_build_object(
      'old_data', to_jsonb(OLD),
      'new_data', to_jsonb(NEW),
      'changed_fields', (
        SELECT jsonb_object_agg(key, value)
        FROM jsonb_each(to_jsonb(NEW))
        WHERE value IS DISTINCT FROM (to_jsonb(OLD) ->> key)::jsonb
      )
    );
  ELSIF TG_OP = 'DELETE' THEN
    v_context := v_context || jsonb_build_object('old_data', to_jsonb(OLD));
  END IF;
  
  -- Insert audit log
  INSERT INTO audit_logs (user_id, action, context)
  VALUES (auth.uid(), v_action, v_context);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example: Add audit triggers to important tables
-- Audit employer changes
CREATE TRIGGER audit_employers
  AFTER INSERT OR UPDATE OR DELETE ON employers
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

-- Audit invoice changes
CREATE TRIGGER audit_invoices
  AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

-- Create view for easy audit log access
CREATE OR REPLACE VIEW audit_log_summary AS
SELECT 
  al.id,
  al.created_at,
  al.action,
  al.context,
  u.email as user_email,
  u.raw_user_meta_data->>'full_name' as user_name,
  al.context->>'table_name' as table_name,
  al.context->>'operation' as operation
FROM audit_logs al
LEFT JOIN auth.users u ON al.user_id = u.id
ORDER BY al.created_at DESC;

-- Grant access to the view
GRANT SELECT ON audit_log_summary TO authenticated;

-- Sample data
INSERT INTO audit_logs (user_id, action, context) VALUES
  (NULL, 'system.startup', jsonb_build_object('version', '1.0.0', 'environment', 'production')),
  (NULL, 'invoice.generated', jsonb_build_object('month', '2025-07', 'count', 15, 'total_amount', 125000)),
  (NULL, 'email.sent', jsonb_build_object('type', 'invoice', 'recipient', 'billing@glowtech.com', 'status', 'delivered'));