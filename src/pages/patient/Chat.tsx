import ChatInterface from '@/components/chat/ChatInterface';
import ConversationHistory from '@/components/chat/ConversationHistory';
import { Tabs } from '@/components/ui/tabs';
import { useState } from 'react';

export default function PatientChat() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Health Assistant</h1>
      
      <Tabs 
        tabs={['Chat', 'History']} 
        active={activeTab === 'chat' ? 'Chat' : 'History'}
        onSelect={(tab) => setActiveTab(tab.toLowerCase())}
      />

      <div className="mt-6">
        {activeTab === 'chat' ? (
          <ChatInterface />
        ) : (
          <ConversationHistory />
        )}
      </div>
    </div>
  );
}