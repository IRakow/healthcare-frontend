-- Add photo analysis columns to food_log table if they don't exist
ALTER TABLE food_log 
ADD COLUMN IF NOT EXISTS meal_type text,
ADD COLUMN IF NOT EXISTS total_fiber numeric,
ADD COLUMN IF NOT EXISTS health_score integer CHECK (health_score >= 1 AND health_score <= 10),
ADD COLUMN IF NOT EXISTS photo_analysis jsonb,
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_food_log_patient_date ON food_log(patient_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_food_log_meal_type ON food_log(meal_type);

-- Create a view for daily nutrition summary
CREATE OR REPLACE VIEW daily_nutrition_summary AS
SELECT 
  patient_id,
  date::date as date,
  COUNT(*) as meal_count,
  SUM(total_calories) as total_calories,
  SUM(total_protein) as total_protein,
  SUM(total_carbs) as total_carbs,
  SUM(total_fat) as total_fat,
  SUM(total_fiber) as total_fiber,
  SUM(total_water_oz) as total_water,
  AVG(health_score) as avg_health_score
FROM food_log
GROUP BY patient_id, date::date;

-- Create a function to get weekly macro trends
CREATE OR REPLACE FUNCTION get_weekly_macro_trends(p_patient_id uuid)
RETURNS TABLE(
  date date,
  protein numeric,
  carbs numeric,
  fat numeric,
  fiber numeric,
  calories numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fl.date::date,
    COALESCE(SUM(fl.total_protein), 0) as protein,
    COALESCE(SUM(fl.total_carbs), 0) as carbs,
    COALESCE(SUM(fl.total_fat), 0) as fat,
    COALESCE(SUM(fl.total_fiber), 0) as fiber,
    COALESCE(SUM(fl.total_calories), 0) as calories
  FROM food_log fl
  WHERE fl.patient_id = p_patient_id
    AND fl.date >= CURRENT_DATE - INTERVAL '7 days'
  GROUP BY fl.date::date
  ORDER BY fl.date::date;
END;
$$ LANGUAGE plpgsql;

-- RLS policies for food_log
ALTER TABLE food_log ENABLE ROW LEVEL SECURITY;

-- Patients can view and insert their own food logs
CREATE POLICY "Patients can view own food logs" ON food_log
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Patients can insert own food logs" ON food_log
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can update own food logs" ON food_log
  FOR UPDATE USING (auth.uid() = patient_id);

CREATE POLICY "Patients can delete own food logs" ON food_log
  FOR DELETE USING (auth.uid() = patient_id);

-- Providers can view patient food logs (assuming provider_patients relationship exists)
CREATE POLICY "Providers can view patient food logs" ON food_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM provider_patients pp
      WHERE pp.patient_id = food_log.patient_id
        AND pp.provider_id = auth.uid()
    )
  );