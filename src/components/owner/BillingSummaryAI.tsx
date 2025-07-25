import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Select from '@/components/ui/select';
import { Sparkles, Loader2 } from 'lucide-react';
import { billingSummaryService } from '@/services/billingSummaryService';
import { getCurrentInvoiceMonth } from '@/types/invoice';

export default function BillingSummaryAI() {
  const [summaryType, setSummaryType] = useState<'monthly' | 'employer'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(getCurrentInvoiceMonth());
  const [selectedEmployer, setSelectedEmployer] = useState('');
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock employer list - replace with actual data
  const employers = [
    { id: '1', name: 'Glow Tech Inc.' },
    { id: '2', name: 'Sunset Wellness' },
    { id: '3', name: 'Horizon Labs' },
  ];

  const generateSummary = async () => {
    setIsGenerating(true);
    setSummary('');

    try {
      let result: string;
      
      if (summaryType === 'monthly') {
        result = await billingSummaryService.generateMonthlyReport(selectedMonth);
      } else {
        result = await billingSummaryService.generateEmployerAnalysis(selectedEmployer);
      }
      
      setSummary(result);
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummary('Failed to generate summary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">AI Billing Insights</h1>
      
      <Card title="Generate Summary">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Summary Type"
              value={summaryType}
              onChange={(e: any) => setSummaryType(e.target.value)}
              options={[
                { label: 'Monthly Report', value: 'monthly' },
                { label: 'Employer Analysis', value: 'employer' },
              ]}
            />
            
            {summaryType === 'monthly' ? (
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border rounded-md"
              />
            ) : (
              <Select
                label="Select Employer"
                value={selectedEmployer}
                onChange={(e: any) => setSelectedEmployer(e.target.value)}
                options={[
                  { label: 'Select an employer', value: '' },
                  ...employers.map(emp => ({ label: emp.name, value: emp.id }))
                ]}
              />
            )}
          </div>
          
          <Button
            onClick={generateSummary}
            disabled={isGenerating || (summaryType === 'employer' && !selectedEmployer)}
            variant="primary"
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Insights...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate AI Summary
              </>
            )}
          </Button>
        </div>
      </Card>

      {summary && (
        <Card title="AI Generated Summary" className="mt-6">
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-700">{summary}</div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Button
              variant="secondary"
              onClick={() => navigator.clipboard.writeText(summary)}
            >
              Copy to Clipboard
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                const blob = new Blob([summary], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `billing-summary-${new Date().toISOString().slice(0, 10)}.txt`;
                a.click();
              }}
            >
              Download as Text
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}