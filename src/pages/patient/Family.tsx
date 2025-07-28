import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FamilyMemberManager } from '@/components/patient/FamilyMemberManager';
import { SecureLayout } from '@/components/layout/SecureLayout';
import { CommandBar } from '@/components/ai/CommandBar';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Family() {
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
          <h1 className="text-3xl font-bold text-gray-900">Family Members</h1>
          <p className="text-gray-600 mt-2">Manage your family members and dependents</p>
        </div>

        <div className="grid gap-6">
          <FamilyMemberManager />
        </div>
      </div>
    </SecureLayout>
  );
}