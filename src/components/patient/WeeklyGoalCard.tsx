import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface WeeklyGoal {
  id: string;
  goal_description: string;
  current_value: number;
  target_value: number;
  unit: string;
  focus_area: string;
  completed: boolean;
}

interface WeeklyGoalCardProps {
  goal: WeeklyGoal;
}

export default function WeeklyGoalCard({ goal }: WeeklyGoalCardProps) {
  const progress = (goal.current_value / goal.target_value) * 100;
  
  return (
    <Card title="🌟 This Week's Goal">
      <p className="text-sm text-gray-700">{goal.goal_description}</p>
      <Progress value={progress} />
      <p className="text-xs mt-1">{goal.current_value} / {goal.target_value} {goal.unit}</p>
    </Card>
  );
}