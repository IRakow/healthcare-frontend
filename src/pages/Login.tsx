// File: src/pages/Login.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBrandingContext } from '@/contexts/BrandingProvider';

export default function LoginPage() {
  const navigate = useNavigate();
  const { branding } = useBrandingContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setError(error.message);
    } else {
      navigate('/patient');
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-blue-100 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="shadow-2xl border border-white/30 backdrop-blur-xl bg-white/80 max-w-md w-full">
          <CardHeader className="text-center">
            {branding.logo_url ? (
              <img src={branding.logo_url} alt="Logo" className="mx-auto h-10 mb-2" />
            ) : (
              <h2 className="text-2xl font-bold text-sky-800">Insperity Health</h2>
            )}
            <CardTitle className="text-lg text-gray-700">Welcome back. Please log in.</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && <p className="text-sm text-red-600 text-center">{error}</p>}
              <Button
                type="submit"
                className="w-full bg-[color:var(--brand-primary)] hover:opacity-90 text-white font-semibold"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Log In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}