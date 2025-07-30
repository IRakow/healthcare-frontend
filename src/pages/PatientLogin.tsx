// File: src/pages/PatientLogin.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBrandingContext } from '@/contexts/BrandingProvider';

export default function PatientLogin() {
  const navigate = useNavigate();
  const { branding } = useBrandingContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = branding?.employer_name ? `Login | ${branding.employer_name}` : 'Login';
  }, [branding]);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    console.log('🧠 Login attempt with:', email);

    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      console.log('✅ Supabase response:', data);
      if (data?.user) console.log('🔐 Logged in as:', data.user.email, '| Role:', data.user.user_metadata?.role);

      if (error) {
        setError(error.message);
      } else {
        const role = data?.user?.user_metadata?.role;
        if (role === 'provider') navigate('/provider/dashboard');
        else if (role === 'admin') navigate('/admin/dashboard');
        else navigate('/patient/dashboard');
      }
    } catch (err: any) {
      setError('Unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#E0F7FA] to-[#B2EBF2] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="shadow-2xl rounded-2xl border border-white/30 backdrop-blur-xl bg-white/60 max-w-md w-full">
          <CardHeader className="text-center">
            {branding.logo_url ? (
              <img src={branding.logo_url} alt="Logo" className="mx-auto h-12 mb-3" />
            ) : (
              <h2 className="text-2xl font-bold text-[color:var(--brand-primary)]">Insperity Health</h2>
            )}
            <CardTitle className="text-lg text-gray-800">Welcome back. Please log in.</CardTitle>
            {branding.tagline && (
              <p className="text-xs text-muted-foreground mt-1">{branding.tagline}</p>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="focus:ring-2 focus:ring-[color:var(--brand-primary)] focus:border-transparent"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="focus:ring-2 focus:ring-[color:var(--brand-primary)] focus:border-transparent"
              />
              {error && <p className="text-sm text-red-600 text-center">{error}</p>}
              <Button
                type="submit"
                className="w-full bg-[color:var(--brand-primary)] hover:opacity-90 text-white font-semibold rounded-lg"
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
