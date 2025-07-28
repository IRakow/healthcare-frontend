import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MealPlannerAI } from '@/components/patient/MealPlannerAI';
import AssistantBar from '@/components/assistant/AssistantBar';
import { ArrowLeft, Download, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MealPlan() {
  const navigate = useNavigate();

  const handleEmailPlan = async () => {
    // Implementation for emailing the meal plan
    alert('Your meal plan has been sent to your email!');
  };

  const handleDownloadPDF = () => {
    // Implementation for downloading PDF
    alert('Downloading your meal plan as PDF...');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6"
    >
      {/* Floating Assistant Bar */}
      <AssistantBar role="patient" />

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => navigate('/patient/health')}
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex gap-3">
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <Button
              onClick={handleEmailPlan}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Mail className="w-4 h-4" />
              Email Plan
            </Button>
          </div>
        </div>

        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Your Weekly Meal Plan
        </h1>
        <p className="text-gray-600 mt-2">
          AI-generated meals based on your health goals and preferences
        </p>
      </div>

      {/* Meal Planner Component */}
      <div className="max-w-7xl mx-auto">
        <MealPlannerAI />
      </div>
    </motion.div>
  );
}