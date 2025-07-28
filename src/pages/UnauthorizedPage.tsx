import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldOff } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { redirectByRole } from '@/utils/redirectByRole';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { role } = useUser();

  const handleGoToDashboard = () => {
    if (role) {
      navigate(redirectByRole(role));
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
          <div className="flex justify-center mb-4">
            <ShieldOff className="w-16 h-16 text-red-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">
            Access Denied
          </h1>
          
          <p className="text-gray-300 mb-6">
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={handleGoToDashboard}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Go to Your Dashboard
            </Button>
            
            <Button
              onClick={() => navigate('/login')}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Sign In with Different Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}