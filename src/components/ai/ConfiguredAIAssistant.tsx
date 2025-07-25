import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2 } from 'lucide-react';
import { aiAssistantService } from '@/services/aiAssistantService';

interface ConfiguredAIAssistantProps {
  employerId: string;
  employerName?: string;
}

export default function ConfiguredAIAssistant({ 
  employerId, 
  employerName 
}: ConfiguredAIAssistantProps) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modelUsed, setModelUsed] = useState('');

  const handleQuery = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setResponse('');
    setModelUsed('');

    try {
      // Use streaming for real-time response
      let fullResponse = '';
      await aiAssistantService.streamQueryWithConfig(
        employerId,
        query,
        (chunk) => {
          fullResponse += chunk;
          setResponse(fullResponse);
        }
      );

      // For non-streaming with model info:
      // const result = await aiAssistantService.queryWithEmployerConfig(employerId, query);
      // setResponse(result.content);
      // setModelUsed(result.model);
    } catch (error) {
      console.error('AI query error:', error);
      setResponse('Sorry, I encountered an error processing your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title={`AI Assistant${employerName ? ` for ${employerName}` : ''}`}>
      <div className="space-y-4">
        <div>
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a health-related question..."
            rows={3}
            className="w-full"
          />
        </div>

        <Button
          onClick={handleQuery}
          disabled={isLoading || !query.trim()}
          variant="primary"
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Ask AI Assistant
            </>
          )}
        </Button>

        {response && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700">{response}</div>
            </div>
            {modelUsed && (
              <p className="text-xs text-gray-500 mt-2">
                Powered by: {modelUsed}
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}