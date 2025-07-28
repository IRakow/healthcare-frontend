-- Add function to check if a user has provider role
CREATE OR REPLACE FUNCTION is_provider(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = $1 
    AND r.name = 'provider'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add check constraint to medications table to ensure prescriber is a provider
ALTER TABLE medications
ADD CONSTRAINT prescriber_must_be_provider
CHECK (prescriber_id IS NULL OR is_provider(prescriber_id));

-- Create index on user_roles for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_role ON user_roles(user_id, role_id);

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT prescriber_must_be_provider ON medications IS 
'Ensures that prescriber_id references a user with provider role';

-- Create a trigger to validate prescriber role on insert/update
CREATE OR REPLACE FUNCTION validate_prescriber_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.prescriber_id IS NOT NULL AND NOT is_provider(NEW.prescriber_id) THEN
    RAISE EXCEPTION 'Prescriber must have provider role';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for additional validation
CREATE TRIGGER ensure_prescriber_is_provider
  BEFORE INSERT OR UPDATE OF prescriber_id ON medications
  FOR EACH ROW
  EXECUTE FUNCTION validate_prescriber_role();

-- Add RLS policy for providers to prescribe medications
CREATE POLICY "Providers can prescribe medications"
  ON medications FOR INSERT
  WITH CHECK (
    auth.uid() = prescriber_id 
    AND is_provider(auth.uid())
  );

-- Update existing RLS policy for providers to view medications they prescribed
CREATE POLICY "Providers can view medications they prescribed"
  ON medications FOR SELECT
  USING (
    auth.uid() = prescriber_id 
    OR auth.uid() = patient_id
  );

-- Add helper view for provider prescriptions
CREATE OR REPLACE VIEW provider_prescriptions AS
SELECT 
  m.*,
  p.raw_user_meta_data->>'name' as patient_name,
  pr.raw_user_meta_data->>'name' as prescriber_name
FROM medications m
JOIN auth.users p ON m.patient_id = p.id
LEFT JOIN auth.users pr ON m.prescriber_id = pr.id
WHERE m.prescriber_id IS NOT NULL;

-- Grant access to the view for authenticated users
GRANT SELECT ON provider_prescriptions TO authenticated;