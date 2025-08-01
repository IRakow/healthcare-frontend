import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bot, Calendar, Stethoscope, FileText, Activity, HeartPulse, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const menu = [
  { label: 'Health Dashboard', path: '/patient', icon: <HeartPulse size={18} /> },
  { label: 'Appointments', path: '/patient/appointments', icon: <Calendar size={18} /> },
  { label: 'Timeline', path: '/patient/timeline', icon: <Activity size={18} /> },
  { label: 'AI Chat History', path: '/patient/ai', icon: <Bot size={18} /> },
  { label: 'Labs & Uploads', path: '/patient/labs', icon: <FileText size={18} /> },
  { label: 'Vitals', path: '/patient/health', icon: <Stethoscope size={18} /> }
]