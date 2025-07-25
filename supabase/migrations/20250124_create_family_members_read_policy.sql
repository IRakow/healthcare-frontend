-- Create RLS policy: Only owner can read their family
CREATE POLICY "Only owner can read their family" ON family_members
FOR SELECT USING (auth.uid() = account_holder_id);