import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface GroceryItem {
  id: number;
  name: string;
  category: string;
}

export const SmartGroceryList: React.FC = () => {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');

  const addItem = () => {
    if (!name || !category) return;
    setItems((prev) => [
      ...prev,
      { id: Date.now(), name, category }
    ]);
    setName('');
    setCategory('');
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-6 shadow space-y-4"
    >
      <h3 className="text-xl font-semibold text-gray-800">Smart Grocery List</h3>

      <div className="grid md:grid-cols-2 gap-4">
        <Input placeholder="Item name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Category (e.g. Protein, Produce)" value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>
      <Button onClick={addItem} className="mt-2">
        <Plus className="w-4 h-4 mr-1" /> Add Item
      </Button>

      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between items-center bg-white p-3 rounded-xl border shadow-sm">
            <div>
              <p className="text-sm font-medium text-gray-800">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.category}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};