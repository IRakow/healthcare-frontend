import { useState } from 'react';

export default function Family() {
  const [members, setMembers] = useState([{ name: 'Ava Smith', age: 12 }, { name: 'Leo Smith', age: 10 }]);

  const addMember = () => {
    const name = prompt('Name:');
    const age = prompt('Age:');
    if (name && age) {
      setMembers([...members, { name, age: parseInt(age) }]);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">👨‍👩‍👧‍👦 Family Members</h2>
      <ul className="mb-4 list-disc pl-6">
        {members.map((m, i) => (
          <li key={i}>{m.name} — {m.age} years old</li>
        ))}
      </ul>
      <button onClick={addMember} className="btn-primary">+ Add Family Member</button>
    </div>
  );
}