export interface Employer {
  id: string;
  name: string;
  billing_plan: 'per_member' | 'flat_rate';
  monthly_fee_per_member: number | null;
  custom_invoice_note: string | null;
  // Branding
  primary_color?: string;
  logo_url?: string;
  favicon_url?: string;
  subdomain?: string;
  tagline?: string;
  voice_preference?: string;
  // AI Assistant Config
  assistant_model?: AssistantModel;
  assistant_tone?: AssistantTone;
  assistant_voice?: AssistantVoice;
  assistant_temp?: number;
  created_at?: string;
  updated_at?: string;
}

export type BillingPlan = 'per_member' | 'flat_rate';

export type AssistantModel = 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3-opus' | 'claude-3-sonnet' | 'gemini-pro';
export type AssistantTone = 'professional' | 'friendly' | 'concise' | 'detailed' | 'casual';
export type AssistantVoice = 'Rachel' | 'Adam' | 'Bella' | 'Domi' | 'Antoni' | 'Elli' | 'Josh' | 'Arnold' | 'Sam';

export interface CreateEmployerInput {
  name: string;
  billing_plan: BillingPlan;
  monthly_fee_per_member?: number | null;
  custom_invoice_note?: string | null;
}

export interface UpdateEmployerInput {
  name?: string;
  billing_plan?: BillingPlan;
  monthly_fee_per_member?: number | null;
  custom_invoice_note?: string | null;
}