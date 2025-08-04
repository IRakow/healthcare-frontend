// src/config/patientSidebar.ts

import {
  HomeIcon,
  CalendarIcon,
  PillIcon,
  FileTextIcon,
  MicIcon,
  ImageIcon,
  HeartIcon,
  BookOpenIcon,
  CameraIcon,
  SettingsIcon,
  BellIcon,
  ClipboardCheckIcon,
  ShoppingCartIcon,
  LineChartIcon,
  VideoIcon,
  Share2Icon,
  BotIcon,
  FilePlusIcon,
  GalleryVerticalIcon,
  FlameIcon
} from 'lucide-react';

export const patientSidebarLinks = [
  {
    label: 'Dashboard',
    href: '/patient',
    icon: HomeIcon
  },

  // 🩺 Health Tools
  {
    label: 'Health',
    href: '/patient/health',
    icon: HeartIcon
  },
  {
    label: 'Food Log',
    href: '/patient/nutrition',
    icon: ImageIcon
  },
  {
    label: 'Meditation',
    href: '/patient/meditation',
    icon: MicIcon
  },
  {
    label: 'Weekly Goals',
    href: '/patient/goals',
    icon: ClipboardCheckIcon
  },
  {
    label: 'Smart Grocery',
    href: '/patient/grocery',
    icon: ShoppingCartIcon
  },
  {
    label: 'Vitals',
    href: '/patient/vitals',
    icon: LineChartIcon
  },
  {
    label: 'AI Summary',
    href: '/patient/summary',
    icon: BotIcon
  },
  {
    label: 'Timeline',
    href: '/patient/timeline',
    icon: BookOpenIcon
  },
  {
    label: 'Camera Tools',
    href: '/patient/camera',
    icon: CameraIcon
  },
  {
    label: 'Progress Photos',
    href: '/patient/photos',
    icon: GalleryVerticalIcon
  },
  {
    label: 'Streak Tracker',
    href: '/patient/streaks',
    icon: FlameIcon
  },

  // 💊 Medical
  {
    label: 'Appointments',
    href: '/patient/appointments',
    icon: CalendarIcon
  },
  {
    label: 'Medications',
    href: '/patient/medications',
    icon: PillIcon
  },
  {
    label: 'Documents',
    href: '/patient/uploads',
    icon: FileTextIcon
  },
  {
    label: 'Telemed Visit',
    href: '/patient/telemed',
    icon: VideoIcon
  },
  {
    label: 'Smart Intake',
    href: '/patient/intake',
    icon: FilePlusIcon
  },

  // ⚙️ Settings
  {
    label: 'Settings',
    href: '/patient/settings',
    icon: SettingsIcon
  },
  {
    label: 'Notifications',
    href: '/patient/notifications',
    icon: BellIcon
  },
  {
    label: 'Sharing & Access',
    href: '/patient/share',
    icon: Share2Icon
  }
];