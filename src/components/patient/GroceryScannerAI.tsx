import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const GroceryScannerAI: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleScan = () => {
    setScanning(true);
    setResult(null);
    
    // Simulate AI scanning
    setTimeout(() => {
      setScanning(false);
      setResult('Organic bananas, almond milk, whole grain bread added to your list!');
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-6 shadow space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-800">Smart Receipt Scanner</h3>
        <Camera className="w-5 h-5 text-gray-500" />
      </div>
      
      <div className="text-center space-y-4">
        <Button
          onClick={handleScan}
          disabled={scanning}
          className="w-full"
          size="lg"
        >
          {scanning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Scan Grocery Receipt
            </>
          )}
        </Button>
        
        {result && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-green-600 bg-green-50 p-3 rounded-lg"
          >
            {result}
          </motion.p>
        )}
      </div>
      
      <p className="text-xs text-gray-500 text-center">
        Take a photo of your receipt to auto-add healthy items
      </p>
    </motion.div>
  );
};