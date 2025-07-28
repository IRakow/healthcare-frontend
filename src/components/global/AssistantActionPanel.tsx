// File: src/components/global/AssistantActionPanel.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Calendar, Video, Soup, BookText, Stethoscope } from 'lucide-react';
import { ActionCard } from '@/components/ui/ActionCard';

interface AssistantActionPanelProps {
  userId?: string;
}

export const AssistantActionPanel: React.FC<AssistantActionPanelProps> = ({ userId }) => {
  const navigate = useNavigate();

  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <ActionCard
        icon={Camera}
        title="Log Meal with Photo"
        description="Use your camera to log meals quickly."
        onClick={() => navigate('/patient/food-log')}
      />
      <ActionCard
        icon={Calendar}
        title="Book Appointment"
        description="Find a time with your provider."
        onClick={() => navigate('/patient/book')}
      />
      <ActionCard
        icon={Video}
        title="Start Video Visit"
        description="Join your next telemedicine appointment."
        onClick={() => navigate('/patient/video-room')}
      />
      <ActionCard
        icon={Soup}
        title="Check Nutrition Plan"
        description="Get AI-generated healthy suggestions."
        onClick={() => navigate('/patient/health')}
      />
      <ActionCard
        icon={BookText}
        title="Review AI Summary"
        description="See your recent assistant activity."
        onClick={() => navigate('/patient/ai-summary')}
      />
      <ActionCard
        icon={Stethoscope}
        title="Full Medical Record"
        description="Explore your complete patient file."
        onClick={() => navigate('/patient/file')}
      />
    </div>
  );
};