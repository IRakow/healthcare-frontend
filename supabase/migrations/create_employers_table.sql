-- Create employers table
CREATE TABLE IF NOT EXISTS employers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    billing_plan TEXT CHECK (billing_plan IN ('per_member', 'flat_rate')),
    monthly_fee_per_member INT,
    custom_invoice_note TEXT,
    -- Branding fields
    primary_color TEXT DEFAULT '#3b82f6',
    logo_url TEXT,
    subdomain TEXT UNIQUE,
    tagline TEXT,
    voice_preference TEXT DEFAULT 'Rachel',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security)
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;

-- Create index on name for faster searches
CREATE INDEX idx_employers_name ON employers(name);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_employers_updated_at BEFORE UPDATE ON employers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
INSERT INTO employers (name, billing_plan, monthly_fee_per_member, custom_invoice_note) VALUES
    ('Glow Tech Inc.', 'per_member', 150, 'Invoice due on the 1st of each month'),
    ('Sunset Wellness', 'per_member', 120, 'Preferred payment method: ACH'),
    ('Horizon Labs', 'flat_rate', NULL, 'Flat rate: $18,500/month'),
    ('BioPulse', 'per_member', 100, NULL),
    ('ElevateX', 'flat_rate', NULL, 'Quarterly billing preferred');

-- Create RLS policies
-- Policy for authenticated users to read employers
CREATE POLICY "Authenticated users can view employers" ON employers
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for admin/owner roles to manage employers
CREATE POLICY "Admin can manage employers" ON employers
    FOR ALL USING (
        auth.jwt() ->> 'role' IN ('admin', 'owner')
    );