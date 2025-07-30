import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, User, Stethoscope } from 'lucide-react';

export default function SimpleLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Healthcare Platform</h1>
        <p className="text-gray-600 mb-12">Select your portal to continue</p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          {/* Admin Portal */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/admin/dashboard')}
            className="flex flex-col items-center gap-4 bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow min-w-[200px]"
          >
            <ShieldCheck className="w-16 h-16 text-blue-600" />
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Admin</h3>
              <p className="text-sm text-gray-500">System management</p>
            </div>
          </motion.button>

          {/* Provider Portal */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/provider/dashboard')}
            className="flex flex-col items-center gap-4 bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow min-w-[200px]"
          >
            <Stethoscope className="w-16 h-16 text-green-600" />
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Provider</h3>
              <p className="text-sm text-gray-500">Healthcare provider</p>
            </div>
          </motion.button>

          {/* Patient Portal */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/patient/dashboard')}
            className="flex flex-col items-center gap-4 bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow min-w-[200px]"
          >
            <User className="w-16 h-16 text-purple-600" />
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Patient</h3>
              <p className="text-sm text-gray-500">Patient portal</p>
            </div>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}