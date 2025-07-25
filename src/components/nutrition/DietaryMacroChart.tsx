import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

const mockData = [
  { date: 'Mon', protein: 85, carbs: 220, fat: 65 },
  { date: 'Tue', protein: 92, carbs: 210, fat: 55 },
  { date: 'Wed', protein: 88, carbs: 215, fat: 60 },
  { date: 'Thu', protein: 79, carbs: 230, fat: 72 },
  { date: 'Fri', protein: 91, carbs: 205, fat: 58 },
  { date: 'Sat', protein: 83, carbs: 198, fat: 62 },
  { date: 'Sun', protein: 87, carbs: 202, fat: 64 }
]

export default function DietaryMacroChart() {
  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-2">Weekly Macronutrient Breakdown</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={mockData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="protein" stroke="#34d399" name="Protein (g)" />
          <Line type="monotone" dataKey="carbs" stroke="#60a5fa" name="Carbs (g)" />
          <Line type="monotone" dataKey="fat" stroke="#fbbf24" name="Fat (g)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}