import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import jsPDF from 'jspdf';

export default function GroceryMode() {
  const [plan, setPlan] = useState('');
  const [allergies, setAllergies] = useState([]);
  const [groceryList, setGroceryList] = useState<{ category: string; items: string[] }[]>([]);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [customItem, setCustomItem] = useState('');

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from('patient_profile').select('*').eq('id', user.id).single();
      setAllergies(profile?.allergies || []);

      const { data: planData } = await supabase.from('meal_plans').select('ai_plan_text').eq('patient_id', user.id).order('created_at', { ascending: false }).limit(1).single();
      setPlan(planData?.ai_plan_text || '');
    })();
  }, []);

  async function generateList() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setLoading(true);

    const res = await fetch('/api/grocery-generator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, allergies })
    });

    const { items, comments } = await res.json();
    setGroceryList(items);
    setNotes(comments);

    await supabase.from('grocery_history').insert({
      patient_id: user.id,
      source_plan: plan,
      list: items,
      notes: comments
    });
    setLoading(false);
  }

  function toggleCheck(item: string) {
    setCheckedItems((prev) => ({ ...prev, [item]: !prev[item] }));
  }

  function downloadPDF() {
    const pdf = new jsPDF();
    pdf.setFontSize(16);
    pdf.text('🛒 Smart Grocery List', 10, 20);
    pdf.setFontSize(12);

    let y = 30;
    groceryList.forEach((section) => {
      pdf.setFont(undefined, 'bold');
      pdf.text(section.category, 10, y);
      y += 8;
      pdf.setFont(undefined, 'normal');
      section.items.forEach((item) => {
        pdf.text(`• ${item}`, 15, y);
        y += 8;
      });
      y += 4;
    });

    if (notes) {
      pdf.setFontSize(10);
      pdf.text('Tips & AI Notes:', 10, y);
      pdf.setFontSize(9);
      const noteLines = pdf.splitTextToSize(notes, 180);
      pdf.text(noteLines, 10, y + 5);
    }

    pdf.save('grocery-list.pdf');
  }

  async function addCustomItem() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (!customItem.trim()) return;
    
    const updatedList = [...groceryList];
    let misc = updatedList.find(cat => cat.category === '🛒 Miscellaneous');
    if (!misc) {
      misc = { category: '🛒 Miscellaneous', items: [] };
      updatedList.push(misc);
    }
    misc.items.push(customItem.trim());
    setGroceryList(updatedList);
    setCustomItem('');

    await supabase.from('grocery_history').insert({
      patient_id: user.id,
      source_plan: '[custom]',
      list: [{ category: '🛒 Miscellaneous', items: [customItem.trim()] }],
      notes: 'Manually added grocery item.'
    });
  }

  async function getMealIdeasFromGroceries() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const combinedItems = groceryList.flatMap(g => g.items).join(', ');

    fetch('/api/meal-ideas-from-groceries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients: combinedItems, patient_id: user.id })
    })
      .then(res => res.json())
      .then(data => {
        const suggestions = data.meals || [];
        const scrollBox = document.createElement('div');
        scrollBox.className = 'space-y-2';
        suggestions.forEach((meal: string) => {
          const card = document.createElement('div');
          card.className = 'rounded-xl bg-white border p-4 shadow-sm text-sm text-gray-700';
          card.innerText = meal;
          const addBtn = document.createElement('button');
          addBtn.innerText = '➕ Add to Weekly Planner';
          addBtn.className = 'ml-4 text-sm text-blue-600 hover:underline';
          addBtn.onclick = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            await supabase.from('meal_plans').insert({
              patient_id: user.id,
              ai_plan_text: meal,
              source: 'from_grocery_suggestion'
            });
            alert('Meal added to your weekly planner!');
          };
          card.appendChild(addBtn);
          scrollBox.appendChild(card);
        });
        document.querySelector('#meal-suggestion-container')?.replaceChildren(scrollBox);
        scrollBox.scrollIntoView({ behavior: 'smooth' });
      });
  }

  async function getMealIdeasByInput(prompt: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    fetch('/api/meal-ideas-by-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request: prompt, patient_id: user.id })
    })
      .then(res => res.json())
      .then(data => {
        const ideas = data.meals || [];
        const box = document.createElement('div');
        box.className = 'space-y-2';
        ideas.forEach((idea: string) => {
          const card = document.createElement('div');
          card.className = 'rounded-xl bg-white border p-4 shadow-sm text-sm text-gray-700';
          card.innerText = idea;
          box.appendChild(card);
        });
        document.querySelector('#meal-suggestion-container')?.replaceChildren(box);
      });
  }

  function showWeeklyPlanner(meals: string[]) {
    const container = document.getElementById('weekly-planner') as HTMLDivElement;
    if (!container) return;
    container.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-2 md:grid-cols-3 gap-4';

    meals.forEach((meal, i) => {
      const card = document.createElement('div');
      card.className = 'bg-white border rounded-xl shadow p-4 text-sm text-gray-700';
      card.innerHTML = `<strong class='text-blue-700'>Day ${i + 1}</strong><p>${meal}</p>`;
      grid.appendChild(card);
    });

    container.appendChild(grid);
    container.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">🛒 Smart Grocery Mode</h1>
      <Card>
        <div className="p-6">
          <p className="mb-4 text-sm text-gray-700">This list is generated based on your Mediterranean meal plan and allergy profile.</p>
          <Button onClick={generateList} disabled={loading}>{loading ? 'Generating…' : 'Generate My Grocery List'}</Button>
          <Button onClick={getMealIdeasFromGroceries} className="ml-2" variant="outline">Suggest Meals from My Groceries</Button>

          {groceryList.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold text-gray-800">Your Grocery List</h2>
                <Button onClick={downloadPDF} variant="secondary">Download PDF</Button>
              </div>
              {groceryList.map((section, index) => (
                <div key={index} className="mb-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-1">{section.category}</h3>
                  <ul className="text-sm text-gray-800 list-none space-y-1">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <input type="checkbox" checked={!!checkedItems[item]} onChange={() => toggleCheck(item)} />
                        <span className={checkedItems[item] ? 'line-through text-gray-500' : ''}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-800 mb-2">📝 Add Custom Item</h2>
            <div className="flex gap-2">
              <Input placeholder="e.g., Aluminum foil" value={customItem} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomItem(e.target.value)} />
              <Button onClick={addCustomItem}>Add</Button>
            </div>
          </div>

          {notes && (
            <div className="mt-6">
              <h2 className="text-lg font-medium text-gray-800 mb-1">🧠 Tips & AI Notes</h2>
              <p className="text-sm text-blue-700 whitespace-pre-wrap">{notes}</p>
            </div>
          )}

          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-800 mb-2">🎤 Or Ask for Meal Ideas</h2>
            <div className="flex gap-2">
              <Input placeholder="e.g., High-protein dinners with no dairy" onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') getMealIdeasByInput((e.target as HTMLInputElement).value);
              }} />
              <Button onClick={() => {
                const input = document.querySelector<HTMLInputElement>('input[placeholder^="e.g., High-protein"]');
                if (input?.value) getMealIdeasByInput(input.value);
              }}>Submit</Button>
            </div>
          </div>

          <div id="meal-suggestion-container" className="mt-8 space-y-2"></div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">📅 Weekly Planner</h2>
            <div id="weekly-planner" className="mt-4 space-y-4"></div>
          </div>
        </div>
      </Card>
    </div>
  );
}