-- Create invoices table
CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid REFERENCES employers(id) ON DELETE CASCADE,
  month text NOT NULL,
  total_amount decimal(10, 2) NOT NULL CHECK (total_amount >= 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  pdf_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  paid_at timestamptz,
  due_date date
);

-- Create indexes
CREATE INDEX idx_invoices_employer_id ON invoices(employer_id);
CREATE INDEX idx_invoices_month ON invoices(month);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_created_at ON invoices(created_at DESC);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Employers can view their own invoices
CREATE POLICY "Employers can view own invoices" ON invoices
  FOR SELECT USING (
    employer_id IN (
      SELECT id FROM employers WHERE owner_id = auth.uid()
    )
  );

-- Admins can view all invoices
CREATE POLICY "Admins can view all invoices" ON invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Admins can create invoices
CREATE POLICY "Admins can create invoices" ON invoices
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Admins can update invoices
CREATE POLICY "Admins can update invoices" ON invoices
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_invoices_updated_at 
  BEFORE UPDATE ON invoices 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE invoices IS 'Monthly invoices for employer billing';
COMMENT ON COLUMN invoices.month IS 'Format: YYYY-MM';
COMMENT ON COLUMN invoices.status IS 'Invoice payment status';
COMMENT ON COLUMN invoices.pdf_url IS 'URL to generated PDF invoice';