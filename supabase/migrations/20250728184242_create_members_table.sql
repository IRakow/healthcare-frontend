-- Create members table (needed for invoice generation)
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS (Row Level Security)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_members_employer_id ON members(employer_id);
CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_members_active ON members(active);
CREATE INDEX idx_members_email ON members(email);

-- Create updated_at trigger
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO members (employer_id, first_name, last_name, email, active) VALUES
    ((SELECT id FROM employers WHERE name = 'Glow Tech Inc.'), 'John', 'Doe', 'john.doe@glowtech.com', true),
    ((SELECT id FROM employers WHERE name = 'Glow Tech Inc.'), 'Jane', 'Smith', 'jane.smith@glowtech.com', true),
    ((SELECT id FROM employers WHERE name = 'Glow Tech Inc.'), 'Bob', 'Johnson', 'bob.johnson@glowtech.com', true),
    ((SELECT id FROM employers WHERE name = 'Glow Tech Inc.'), 'Alice', 'Williams', 'alice.williams@glowtech.com', false),
    ((SELECT id FROM employers WHERE name = 'Sunset Wellness'), 'Michael', 'Brown', 'michael.brown@sunset.com', true),
    ((SELECT id FROM employers WHERE name = 'Sunset Wellness'), 'Sarah', 'Davis', 'sarah.davis@sunset.com', true),
    ((SELECT id FROM employers WHERE name = 'BioPulse'), 'David', 'Miller', 'david.miller@biopulse.com', true),
    ((SELECT id FROM employers WHERE name = 'BioPulse'), 'Emily', 'Wilson', 'emily.wilson@biopulse.com', true);

-- RLS Policies
-- Members can view their own record
CREATE POLICY "Members can view own record" ON members
    FOR SELECT USING (auth.uid() = user_id);

-- Members can view other members from same employer
CREATE POLICY "Members can view colleagues" ON members
    FOR SELECT USING (
        employer_id IN (
            SELECT employer_id FROM members WHERE user_id = auth.uid()
        )
    );

-- Admin/Owner can manage all members
CREATE POLICY "Admin can manage members" ON members
    FOR ALL USING (
        auth.jwt() ->> 'role' IN ('admin', 'owner')
    );