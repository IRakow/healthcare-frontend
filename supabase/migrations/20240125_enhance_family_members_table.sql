-- Add updated_at column to family_members table
ALTER TABLE family_members ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create or replace the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_family_members_updated_at ON family_members;
CREATE TRIGGER update_family_members_updated_at 
    BEFORE UPDATE ON family_members 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Update foreign key to reference auth.users
ALTER TABLE family_members DROP CONSTRAINT IF EXISTS family_members_account_holder_id_fkey;
ALTER TABLE family_members 
    ADD CONSTRAINT family_members_account_holder_id_fkey 
    FOREIGN KEY (account_holder_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

-- Add NOT NULL constraint to account_holder_id
ALTER TABLE family_members ALTER COLUMN account_holder_id SET NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_family_members_account_holder_id ON family_members(account_holder_id);
CREATE INDEX IF NOT EXISTS idx_family_members_created_at ON family_members(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_family_members_birthdate ON family_members(birthdate);

-- Enable Row Level Security
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own family members" ON family_members;
DROP POLICY IF EXISTS "Users can insert their own family members" ON family_members;
DROP POLICY IF EXISTS "Users can update their own family members" ON family_members;
DROP POLICY IF EXISTS "Users can delete their own family members" ON family_members;

-- Create RLS policies
-- Policy for viewing: Users can only see their own family members
CREATE POLICY "Users can view their own family members" ON family_members
    FOR SELECT USING (auth.uid() = account_holder_id);

-- Policy for inserting: Users can only add family members to their own account
CREATE POLICY "Users can insert their own family members" ON family_members
    FOR INSERT WITH CHECK (auth.uid() = account_holder_id);

-- Policy for updating: Users can only update their own family members
CREATE POLICY "Users can update their own family members" ON family_members
    FOR UPDATE USING (auth.uid() = account_holder_id)
    WITH CHECK (auth.uid() = account_holder_id);

-- Policy for deleting: Users can only delete their own family members
CREATE POLICY "Users can delete their own family members" ON family_members
    FOR DELETE USING (auth.uid() = account_holder_id);

-- Add comment to table
COMMENT ON TABLE family_members IS 'Stores family members associated with user accounts';
COMMENT ON COLUMN family_members.account_holder_id IS 'References the auth.users id of the account holder';
COMMENT ON COLUMN family_members.full_name IS 'Full name of the family member';
COMMENT ON COLUMN family_members.birthdate IS 'Date of birth of the family member';
COMMENT ON COLUMN family_members.relation IS 'Relationship to the account holder (e.g., spouse, child, parent)';