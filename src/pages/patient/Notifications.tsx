import React from 'react';
import { SecureLayout } from '@/components/layout/SecureLayout';
import { CommandBar } from '@/components/ai/CommandBar';
import { NotificationCenter } from '@/components/patient/NotificationCenter';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Notifications() {
  const navigate = useNavigate();

  return (
    <SecureLayout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <CommandBar />
        
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/patient/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notification Center</h1>
          <p className="text-gray-600 mt-2">Stay updated with your health reminders and alerts</p>
        </div>

        <div className="grid gap-6">
          <NotificationCenter />
        </div>
      </div>
    </SecureLayout>
  );
}