-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- Format: 'YYYY-MM'
    total_amount INT NOT NULL,
    status TEXT CHECK (status IN ('Pending', 'Paid', 'Overdue', 'Processing')),
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS (Row Level Security)
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_invoices_employer_id ON invoices(employer_id);
CREATE INDEX idx_invoices_month ON invoices(month);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_employer_month ON invoices(employer_id, month);

-- Create updated_at trigger
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add unique constraint to prevent duplicate invoices for same employer/month
ALTER TABLE invoices ADD CONSTRAINT unique_employer_month UNIQUE (employer_id, month);

-- Insert sample data (optional)
INSERT INTO invoices (employer_id, month, total_amount, status, pdf_url) VALUES
    ((SELECT id FROM employers WHERE name = 'Glow Tech Inc.'), '2025-07', 14200, 'Paid', '/invoices/glow-tech-2025-07.pdf'),
    ((SELECT id FROM employers WHERE name = 'Glow Tech Inc.'), '2025-06', 13800, 'Paid', '/invoices/glow-tech-2025-06.pdf'),
    ((SELECT id FROM employers WHERE name = 'Glow Tech Inc.'), '2025-05', 12500, 'Paid', '/invoices/glow-tech-2025-05.pdf'),
    ((SELECT id FROM employers WHERE name = 'Sunset Wellness'), '2025-07', 8300, 'Paid', '/invoices/sunset-2025-07.pdf'),
    ((SELECT id FROM employers WHERE name = 'Sunset Wellness'), '2025-06', 7900, 'Paid', '/invoices/sunset-2025-06.pdf'),
    ((SELECT id FROM employers WHERE name = 'Horizon Labs'), '2025-07', 18500, 'Processing', NULL),
    ((SELECT id FROM employers WHERE name = 'Horizon Labs'), '2025-06', 18300, 'Paid', '/invoices/horizon-2025-06.pdf'),
    ((SELECT id FROM employers WHERE name = 'BioPulse'), '2025-07', 6000, 'Pending', NULL),
    ((SELECT id FROM employers WHERE name = 'ElevateX'), '2025-07', 10750, 'Processing', NULL);

-- Create RLS policies
-- Policy for authenticated users to view invoices
CREATE POLICY "Authenticated users can view invoices" ON invoices
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for admin/owner roles to manage invoices
CREATE POLICY "Admin can manage invoices" ON invoices
    FOR ALL USING (
        auth.jwt() ->> 'role' IN ('admin', 'owner')
    );

-- Create view for invoice summaries with employer info
CREATE VIEW invoice_summaries AS
SELECT 
    i.id,
    i.month,
    i.total_amount,
    i.status,
    i.pdf_url,
    i.created_at,
    e.id as employer_id,
    e.name as employer_name,
    e.billing_plan,
    e.custom_invoice_note
FROM invoices i
JOIN employers e ON i.employer_id = e.id
ORDER BY i.month DESC, e.name;