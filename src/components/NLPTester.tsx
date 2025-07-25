import { useState } from 'react';
import { nlpParser } from '@/services/nlpParser';
import { voiceCommandService } from '@/services/voiceCommandService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function NLPTester() {
  const [input, setInput] = useState('');
  const [parsedResult, setParsedResult] = useState<any>(null);
  const [commandResult, setCommandResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testExamples = [
    "Book me with Dr. Rivas tomorrow at 3 for chest pain",
    "Add lisinopril 10 mg once daily",
    "Schedule appointment with Dr. Smith next Monday at 2pm",
    "I need to see a doctor today at 4:30 PM for headache",
    "Add ibuprofen 200mg twice a day",
    "Show my appointments",
    "Taking metformin 500 mg twice daily"
  ];

  const handleParse = () => {
    const result = nlpParser.parseUserInput(input);
    setParsedResult(result);
  };

  const handleExecute = async () => {
    if (!parsedResult) return;
    
    setLoading(true);
    try {
      const response = await voiceCommandService.executeCommand(
        parsedResult.command,
        parsedResult.parsed
      );
      setCommandResult(response.reply);
    } catch (error) {
      setCommandResult('Error executing command');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Natural Language Parser Tester</h2>
      
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Test Input</h3>
        <div className="space-y-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a command like 'Book me with Dr. Rivas tomorrow at 3 for chest pain'"
            className="w-full p-3 border rounded-md h-24"
          />
          
          <div className="flex gap-2">
            <Button onClick={handleParse}>Parse Input</Button>
            <Button 
              onClick={handleExecute} 
              disabled={!parsedResult || loading}
              variant="outline"
            >
              Execute Command
            </Button>
          </div>
        </div>
      </Card>

      {parsedResult && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Parsed Result</h3>
          <pre className="bg-gray-50 p-4 rounded overflow-auto">
            {JSON.stringify(parsedResult, null, 2)}
          </pre>
        </Card>
      )}

      {commandResult && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Command Result</h3>
          <p className="text-green-700">{commandResult}</p>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Example Commands</h3>
        <div className="space-y-2">
          {testExamples.map((example, i) => (
            <button
              key={i}
              onClick={() => setInput(example)}
              className="block w-full text-left p-2 hover:bg-gray-50 rounded text-sm"
            >
              "{example}"
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}