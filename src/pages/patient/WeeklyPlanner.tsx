import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';

export default function WeeklyPlanner() {
  const [meals, setMeals] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase
        .from('meal_plans')
        .select('ai_plan_text')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: true });

      const list = data?.map((m) => m.ai_plan_text) || [];
      setMeals(list);
    })();
  }, []);

  async function clearPlan() {
    if (!confirm('Clear entire weekly planner?')) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase.from('meal_plans').delete().eq('patient_id', user.id);
    setMeals([]);
  }

  function downloadPDF() {
    const pdf = new jsPDF();
    pdf.setFontSize(16);
    pdf.text('Weekly Meal Planner', 10, 20);
    
    let y = 40;
    meals.forEach((m, i) => {
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text(`Day ${i + 1}:`, 10, y);
      pdf.setFont(undefined, 'normal');
      
      const lines = pdf.splitTextToSize(m, 180);
      pdf.text(lines, 10, y + 7);
      y += 7 + (lines.length * 5) + 10;
      
      if (y > 250) {
        pdf.addPage();
        y = 20;
      }
    });
    
    pdf.save('meal-plan.pdf');
  }

  async function emailPlan() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    try {
      const response = await fetch('/api/send-plan-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id,
          meals: meals 
        })
      });
      
      if (response.ok) {
        alert('Meal plan sent to your email!');
      } else {
        alert('Failed to send email. Please try again.');
      }
    } catch (error) {
      alert('Error sending email. Please try again.');
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-700">📅 My Weekly Planner</h1>
        <div className="flex gap-2">
          {meals.length > 0 && (
            <>
              <Button variant="secondary" onClick={downloadPDF}>📄 Download PDF</Button>
              <Button variant="secondary" onClick={emailPlan}>📧 Email My Plan</Button>
            </>
          )}
          <Button variant="secondary" onClick={clearPlan}>Clear</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {meals.length === 0 ? (
          <Card>
            <div className="p-4">
              <p className="text-sm text-gray-500">📅 No meals scheduled. Add a meal from Grocery Mode or AI suggestions!</p>
            </div>
          </Card>
        ) : (
          meals.map((meal, i) => (
            <div key={i} className="transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
              <Card>
                <div className="p-4">
                  <h2 className="font-semibold text-gray-700 mb-1">Day {i + 1}</h2>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{meal}</p>
                </div>
              </Card>
            </div>
          ))
        )}
      </div>
    </div>
  );
}