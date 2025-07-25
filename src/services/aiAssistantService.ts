import { supabase } from '@/lib/supabase';
import { AssistantModel } from '@/types/employer';

interface AIResponse {
  content: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export const aiAssistantService = {
  async queryWithEmployerConfig(employerId: string, query: string): Promise<AIResponse> {
    // Fetch employer's AI configuration
    const { data: config, error } = await supabase
      .from('employers')
      .select('assistant_model, assistant_temp, assistant_tone')
      .eq('id', employerId)
      .single();

    if (error) throw new Error('Failed to fetch employer configuration');

    const { assistant_model, assistant_temp, assistant_tone } = config;

    // Build system prompt based on tone
    const systemPrompt = this.getSystemPromptForTone(assistant_tone);

    // Route to appropriate AI provider
    switch (assistant_model) {
      case 'gpt-4':
      case 'gpt-3.5-turbo':
        return this.queryOpenAI(query, assistant_model, assistant_temp, systemPrompt);
      
      case 'claude-3-opus':
      case 'claude-3-sonnet':
        return this.queryClaude(query, assistant_model, assistant_temp, systemPrompt);
      
      case 'gemini-pro':
        return this.queryGemini(query, assistant_temp, systemPrompt);
      
      default:
        return this.queryOpenAI(query, 'gpt-4', assistant_temp ?? 0.7, systemPrompt);
    }
  },

  async queryOpenAI(
    query: string, 
    model: string, 
    temperature: number,
    systemPrompt: string
  ): Promise<AIResponse> {
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'gpt-4',
        temperature: temperature ?? 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI API error: ${res.statusText}`);
    }

    const data = await res.json();
    return {
      content: data.choices[0].message.content,
      model: data.model,
      usage: data.usage
    };
  },

  async queryClaude(
    query: string,
    model: string,
    temperature: number,
    systemPrompt: string
  ): Promise<AIResponse> {
    // Call Claude via Supabase function
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_FN_BASE}/claude-assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        query,
        model,
        temperature,
        systemPrompt
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    return response.json();
  },

  async queryGemini(
    query: string,
    temperature: number,
    systemPrompt: string
  ): Promise<AIResponse> {
    // Call Gemini via Supabase function
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_FN_BASE}/gemini-assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        query: `${systemPrompt}\n\n${query}`,
        temperature
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    return response.json();
  },

  getSystemPromptForTone(tone: string): string {
    const prompts = {
      professional: "You are a professional healthcare assistant. Provide clear, accurate, and formal responses. Use medical terminology appropriately and maintain a courteous, professional tone.",
      friendly: "You are a friendly and approachable healthcare assistant. Be warm, encouraging, and supportive while providing helpful information. Use conversational language while maintaining accuracy.",
      concise: "You are a concise healthcare assistant. Provide brief, direct answers without unnecessary elaboration. Focus on key information and actionable advice.",
      detailed: "You are a thorough healthcare assistant. Provide comprehensive responses with detailed explanations, examples, and context. Ensure complete understanding of topics.",
      casual: "You are a casual and relaxed healthcare assistant. Use everyday language and a conversational tone while still providing accurate health information. Be approachable and easy to understand."
    };

    return prompts[tone as keyof typeof prompts] || prompts.professional;
  },

  // Stream response for real-time updates
  async streamQueryWithConfig(
    employerId: string, 
    query: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const { data: config } = await supabase
      .from('employers')
      .select('assistant_model, assistant_temp, assistant_tone')
      .eq('id', employerId)
      .single();

    if (!config) throw new Error('Employer configuration not found');

    const systemPrompt = this.getSystemPromptForTone(config.assistant_tone);

    // For streaming, we'll use the AI voice endpoint which supports streaming
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_FN_BASE}/ai-voice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        query: `${systemPrompt}\n\n${query}`,
        model: config.assistant_model,
        temperature: config.assistant_temp
      }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('Response body is not readable');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      onChunk(chunk);
    }
  }
};