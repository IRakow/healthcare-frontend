import { useState } from 'react';

export default function Goals() {
  const [goals, setGoals] = useState([
    { title: 'Walk 8,000 steps daily', status: 'active' },
    { title: 'Sleep 7.5 hours', status: 'complete' }
  ]);

  const addGoal = () => {
    const title = prompt('Enter new goal:');
    if (title) setGoals([...goals, { title, status: 'active' }]);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🎯 Health Goals</h2>
      <ul className="mb-4 list-disc pl-6">
        {goals.map((g, i) => (
          <li key={i} className={g.status === 'complete' ? 'line-through text-gray-400' : ''}>{g.title}</li>
        ))}
      </ul>
      <button onClick={addGoal} className="btn-primary">+ Add Goal</button>
    </div>
  );
}