interface SymptomAnalysisResult {
  brief: string;
  symptoms: string;
  differentials?: Array<{
    condition: string;
    reasoning: string;
    urgency: 'low' | 'medium' | 'high';
  }>;
}

export const symptomAnalysisService = {
  async analyzeSymptoms(symptoms: string): Promise<SymptomAnalysisResult> {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_FN_BASE}/symptom-checker`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symptoms }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to analyze symptoms');
    }

    return response.json();
  },

  async getSymptomHistory(userId: string) {
    // This would fetch from a symptom_checks table
    // For now, return mock data
    return [
      {
        id: '1',
        date: '2025-07-20',
        symptoms: 'Headache and fever',
        analysis_summary: 'Common cold, flu, or tension headache possibilities discussed'
      },
      {
        id: '2',
        date: '2025-07-15',
        symptoms: 'Stomach pain after eating',
        analysis_summary: 'Indigestion, food intolerance, or gastritis possibilities discussed'
      }
    ];
  },

  formatSymptomInput(symptoms: string): string {
    // Clean and format symptom input
    return symptoms
      .trim()
      .toLowerCase()
      .replace(/[^\w\s,.-]/g, '')
      .substring(0, 500); // Limit length
  },

  parseAnalysisResponse(analysis: string): SymptomAnalysisResult['differentials'] {
    // Parse the AI response to extract structured differential diagnoses
    // This is a simplified version - real implementation would use more sophisticated parsing
    const differentials: SymptomAnalysisResult['differentials'] = [];
    
    const sections = analysis.split(/\d+\.\s+/);
    sections.forEach((section, index) => {
      if (index > 0 && index <= 3) { // Top 3 differentials
        const lines = section.split('\n');
        if (lines.length > 0) {
          differentials.push({
            condition: lines[0].trim(),
            reasoning: section,
            urgency: section.toLowerCase().includes('emergency') || section.toLowerCase().includes('immediate') 
              ? 'high' 
              : section.toLowerCase().includes('soon') || section.toLowerCase().includes('prompt')
              ? 'medium'
              : 'low'
          });
        }
      }
    });

    return differentials;
  }
};