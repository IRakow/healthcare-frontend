import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Shield,
  Timer,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Fingerprint
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';

interface SessionLockScreenProps {
  onUnlock: () => void;
  lockReason?: 'timeout' | 'manual' | 'security';
  sessionDuration?: number;
}

export const SessionLockScreen: React.FC<SessionLockScreenProps> = ({ 
  onUnlock, 
  lockReason = 'timeout',
  sessionDuration = 0 
}) => {
  const { userId, name } = useUser();
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const MAX_ATTEMPTS = 3;
  const LOCKOUT_DURATION = 300; // 5 minutes in seconds

  useEffect(() => {
    checkBiometricAvailability();
    checkLockoutStatus();
  }, [userId]);

  useEffect(() => {
    if (lockoutTime > 0) {
      const interval = setInterval(() => {
        setLockoutTime(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(interval);
    } else if (isLocked && lockoutTime === 0) {
      setIsLocked(false);
      setAttempts(0);
    }
  }, [lockoutTime, isLocked]);

  const checkBiometricAvailability = async () => {
    if ('credentials' in navigator) {
      try {
        const available = await window.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable();
        setBiometricAvailable(available || false);
      } catch (error) {
        console.error('Failed to check biometric availability:', error);
        setBiometricAvailable(false);
      }
    }
  };

  const checkLockoutStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('session_locks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data && data.locked_until) {
        const lockedUntil = new Date(data.locked_until);
        const now = new Date();
        if (lockedUntil > now) {
          setIsLocked(true);
          setLockoutTime(Math.floor((lockedUntil.getTime() - now.getTime()) / 1000));
          setAttempts(data.attempts || 0);
        }
      }
    } catch (error) {
      console.error('Failed to check lockout status:', error);
    }
  };

  const verifyPin = async () => {
    if (!pin || pin.length < 4) {
      setError('Please enter a valid PIN');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      // Verify PIN with backend
      const { data, error } = await supabase.functions.invoke('verify-session-pin', {
        body: { userId, pin }
      });

      if (error || !data.valid) {
        handleFailedAttempt();
      } else {
        handleSuccessfulUnlock();
      }
    } catch (error) {
      console.error('Failed to verify PIN:', error);
      setError('Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleFailedAttempt = async () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setPin('');

    if (newAttempts >= MAX_ATTEMPTS) {
      // Lock the account
      const lockUntil = new Date();
      lockUntil.setSeconds(lockUntil.getSeconds() + LOCKOUT_DURATION);

      await supabase
        .from('session_locks')
        .upsert({
          user_id: userId,
          attempts: newAttempts,
          locked_until: lockUntil.toISOString(),
          updated_at: new Date().toISOString()
        });

      setIsLocked(true);
      setLockoutTime(LOCKOUT_DURATION);
      setError(`Too many attempts. Locked for ${LOCKOUT_DURATION / 60} minutes.`);
    } else {
      setError(`Incorrect PIN. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
    }
  };

  const handleSuccessfulUnlock = async () => {
    // Clear lockout status
    await supabase
      .from('session_locks')
      .delete()
      .eq('user_id', userId);

    // Log successful unlock
    await supabase.from('patient_timeline').insert({
      patient_id: userId,
      type: 'security',
      title: 'Session Unlocked',
      content: `Session unlocked after ${Math.round(sessionDuration / 60)} minutes`,
      timestamp: new Date().toISOString(),
      importance: 'low'
    });

    onUnlock();
  };

  const handleBiometricAuth = async () => {
    if (!biometricAvailable) return;

    setVerifying(true);
    setError('');

    try {
      // This is a simplified biometric auth flow
      // In production, implement proper WebAuthn
      const { data, error } = await supabase.functions.invoke('verify-biometric', {
        body: { userId }
      });

      if (error || !data.valid) {
        setError('Biometric authentication failed');
      } else {
        handleSuccessfulUnlock();
      }
    } catch (error) {
      console.error('Biometric auth failed:', error);
      setError('Biometric authentication failed. Please use PIN.');
    } finally {
      setVerifying(false);
    }
  };

  const handlePinInput = (digit: string) => {
    if (pin.length < 6 && !isLocked) {
      setPin(prev => prev + digit);
      setError('');
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const formatLockoutTime = () => {
    const minutes = Math.floor(lockoutTime / 60);
    const seconds = lockoutTime % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getLockReasonMessage = () => {
    switch (lockReason) {
      case 'timeout':
        return 'Your session has timed out for security';
      case 'manual':
        return 'You locked your session';
      case 'security':
        return 'Session locked for security reasons';
      default:
        return 'Session locked';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 z-50 flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-md p-8 shadow-2xl">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <motion.div
              animate={{ rotate: isLocked ? 0 : [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: isLocked ? 0 : Infinity, repeatDelay: 5 }}
              className="inline-flex p-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full text-white mb-4"
            >
              <Lock className="w-8 h-8" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-gray-800">Welcome back, {name?.split(' ')[0]}</h2>
            <p className="text-sm text-muted-foreground">{getLockReasonMessage()}</p>
            
            {sessionDuration > 0 && (
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Timer className="w-3 h-3" />
                <span>Locked after {Math.round(sessionDuration / 60)} minutes of inactivity</span>
              </div>
            )}
          </div>

          {/* Lock Status */}
          {isLocked && lockoutTime > 0 && (
            <Card className="p-4 bg-red-50 dark:bg-red-950/30 border-red-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Account temporarily locked
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-300">
                    Try again in {formatLockoutTime()}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* PIN Input */}
          <div className="space-y-4">
            <div className="relative">
              <div className="flex justify-center gap-2 mb-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all ${
                      i < pin.length
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {showPin && pin[i] ? (
                      <span className="text-lg font-medium">{pin[i]}</span>
                    ) : i < pin.length ? (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    ) : null}
                  </div>
                ))}
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={() => setShowPin(!showPin)}
              >
                {showPin ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Number Pad */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <Button
                  key={num}
                  variant="outline"
                  size="lg"
                  className="h-14 text-lg font-medium"
                  onClick={() => handlePinInput(num.toString())}
                  disabled={isLocked || verifying}
                >
                  {num}
                </Button>
              ))}
              <Button
                variant="outline"
                size="lg"
                className="h-14"
                onClick={() => setPin('')}
                disabled={isLocked || verifying}
              >
                <RefreshCw className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-14 text-lg font-medium"
                onClick={() => handlePinInput('0')}
                disabled={isLocked || verifying}
              >
                0
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-14"
                onClick={handleBackspace}
                disabled={isLocked || verifying || pin.length === 0}
              >
                ⌫
              </Button>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 text-sm text-red-600"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                className="w-full"
                size="lg"
                onClick={verifyPin}
                disabled={pin.length < 4 || isLocked || verifying}
              >
                {verifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4 mr-2" />
                    Unlock Session
                  </>
                )}
              </Button>

              {biometricAvailable && !isLocked && (
                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={handleBiometricAuth}
                  disabled={verifying}
                >
                  <Fingerprint className="w-4 h-4 mr-2" />
                  Use Biometric
                </Button>
              )}
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
            <Shield className="w-3 h-3" />
            <span>Your session is protected by HIPAA-compliant security</span>
          </div>

          {/* Forgot PIN */}
          <div className="text-center">
            <Button
              variant="link"
              className="text-xs"
              onClick={() => alert('Please contact support to reset your PIN')}
            >
              Forgot PIN?
            </Button>
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
};