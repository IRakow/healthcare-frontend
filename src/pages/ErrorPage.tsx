import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorPageProps {
  message?: string;
  description?: string;
  showHomeButton?: boolean;
}

export default function ErrorPage({ 
  message = "Something went wrong", 
  description = "We couldn't find what you're looking for.",
  showHomeButton = true 
}: ErrorPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {message}
          </h1>
          
          <p className="text-gray-600 mb-6">
            {description}
          </p>
          
          {showHomeButton && (
            <Button 
              onClick={() => window.location.href = 'https://insperityhealth.com'}
              className="w-full"
            >
              Go to Homepage
            </Button>
          )}
        </div>
        
        <p className="mt-4 text-sm text-gray-500">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  );
}