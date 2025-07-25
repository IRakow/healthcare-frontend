import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShieldOff } from 'lucide-react';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full text-center p-8">
        <div className="flex justify-center mb-4">
          <ShieldOff className="w-16 h-16 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Access Denied
        </h1>
        
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        
        <div className="space-y-3">
          <Button
            onClick={() => navigate(-1)}
            variant="secondary"
            className="w-full"
          >
            Go Back
          </Button>
          
          <Button
            onClick={() => navigate('/')}
            variant="primary"
            className="w-full"
          >
            Go to Home
          </Button>
        </div>
      </Card>
    </div>
  );
}