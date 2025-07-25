import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { nlpParser } from '@/services/nlpParser';
import { voiceCommandService } from '@/services/voiceCommandService';

interface VoiceCommandHandlerProps {
  command: string;
  onResult?: (result: any) => void;
}

export function VoiceCommandHandler({ command, onResult }: VoiceCommandHandlerProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (command) {
      handleCommand(command);
    }
  }, [command]);

  async function handleCommand(input: string) {
    const parsed = nlpParser.parseUserInput(input);
    
    if (!parsed) {
      onResult?.({
        success: false,
        message: 'Could not understand the command'
      });
      return;
    }

    // Handle navigation commands
    if (parsed.action === 'navigate' && parsed.destination) {
      navigate(parsed.destination);
      onResult?.({
        success: true,
        message: `Navigating to ${parsed.destination}`,
        type: 'navigation'
      });
      return;
    }

    // Handle action commands (appointments, medications, etc.)
    if (parsed.action && parsed.parsed) {
      try {
        const result = await voiceCommandService.executeCommand(
          parsed.action,
          parsed.parsed
        );
        
        onResult?.({
          success: !result.error,
          message: result.reply,
          data: result.data,
          type: parsed.action
        });
      } catch (error) {
        onResult?.({
          success: false,
          message: 'Failed to execute command',
          error
        });
      }
      return;
    }

    // Handle legacy command format (backward compatibility)
    if (parsed.command && parsed.parsed) {
      try {
        const result = await voiceCommandService.executeCommand(
          parsed.command,
          parsed.parsed
        );
        
        onResult?.({
          success: !result.error,
          message: result.reply,
          data: result.data,
          type: parsed.command
        });
      } catch (error) {
        onResult?.({
          success: false,
          message: 'Failed to execute command',
          error
        });
      }
    }
  }

  return null; // This is a logic-only component
}

// Example usage in a parent component:
/*
function MyComponent() {
  const [command, setCommand] = useState('');
  const [result, setResult] = useState(null);

  return (
    <>
      <VoiceCommandHandler 
        command={command} 
        onResult={setResult}
      />
      
      <input 
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        placeholder="Try: 'Show me my labs' or 'Book with Dr. Rivas tomorrow at 2'"
      />
      
      {result && (
        <div>
          {result.success ? '✅' : '❌'} {result.message}
        </div>
      )}
    </>
  );
}
*/