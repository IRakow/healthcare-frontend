import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface AILog {
  id: string;
  output: string;
  created_at: string;
}

export default function HealthDashboard() {
  const [logs, setLogs] = useState<AILog[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase
        .from('ai_logs')
        .select('id, output, created_at')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      setLogs(data || []);
    })();
  }, []);

  async function sendEmailPlan() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    try {
      const response = await fetch('/api/email-weekly-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      
      const result = await response.json();
      if (result.success) {
        alert('📧 Meal plan sent to your email!');
      } else {
        alert('⚠️ Could not send email.');
      }
    } catch (error) {
      alert('⚠️ Error sending email.');
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-blue-800 tracking-tight">🧬 Your Lifestyle Hub</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FeatureCard
            emoji="📊"
            title="Streak Tracker & Coach"
            text="Track your sleep, hydration, and protein streaks. Get weekly AI coaching tips."
            href="/patient/lifestyle-streaks"
          />

          <FeatureCard
            emoji="🍽️"
            title="Meal Quality Feedback"
            text="Score your meals based on Mediterranean health guidelines and receive daily insights."
            href="/patient/meal-quality-feedback"
          />

          <FeatureCard
            emoji="📅"
            title="Weekly Planner"
            text="See your AI-curated meal plan for the week. Edit, reorder, or regenerate anytime."
            href="/patient/weekly-planner"
          />

          <FeatureCard
            emoji="🛒"
            title="Smart Grocery Mode"
            text="Generate categorized shopping lists from your plan, with AI tips and voice entry."
            href="/patient/grocery-mode"
          />

          <FeatureCard
            emoji="🧠"
            title="Provider Review Summary"
            text="Secure summary card visible to your provider — tracks weekly trends and risk flags."
            href="/patient/review-panel"
          />
        </div>

        {/* AI Summary Feed Sidebar */}
        <div className="bg-white border rounded-2xl p-4 shadow-sm space-y-2 h-fit">
          <h2 className="text-lg font-semibold text-blue-700">🧠 Recent AI Insights</h2>
          {logs.length === 0 && <p className="text-sm text-gray-500">No insights yet.</p>}
          {logs.map((log) => (
            <p key={log.id} className="text-sm text-gray-700 border-b pb-2">{log.output}</p>
          ))}
        </div>
      </div>

      {/* PDF + Email Download Block */}
      <div className="flex justify-end gap-3 pt-6">
        <Button onClick={() => navigate('/patient/weekly-planner')} variant="secondary">
          📄 Download Planner PDF
        </Button>
        <Button onClick={sendEmailPlan} variant="secondary">
          📧 Email My Plan
        </Button>
      </div>
    </div>
  );
}

function FeatureCard({ emoji, title, text, href }: { emoji: string; title: string; text: string; href: string }) {
  return (
    <Link to={href} className="block bg-white hover:bg-blue-50 border border-gray-200 rounded-2xl shadow transition-all p-5 space-y-2 transform transition-transform duration-300 hover:scale-[1.02]">
      <div className="text-3xl">{emoji}</div>
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <p className="text-sm text-gray-600 leading-snug">{text}</p>
    </Link>
  );
}