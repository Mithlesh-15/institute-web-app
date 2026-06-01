import {
  CalendarCheck2,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  UserRound,
  Trophy,
  BookOpen,
  Megaphone,
  Camera,
} from 'lucide-react'

export const studentSidebarItems = [
  {
    label: 'Dashboard',
    to: '/student/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Profile',
    to: '/student/profile',
    icon: UserRound,
  },
  {
    label: 'My Classes',
    to: '/student/classes',
    icon: GraduationCap,
  },
  {
    label: 'My Attendance',
    to: '/student/attendance',
    icon: CalendarCheck2,
  },
  {
    label: 'Fees',
    to: '/student/fees',
    icon: CreditCard,
  },
  {
    label: 'Test Results',
    to: '/student/results',
    icon: Trophy,
  },
  {
    label: 'Library',
    to: '/student/library',
    icon: BookOpen,
  },
  {
    label: 'Notices',
    to: '/student/notices',
    icon: Megaphone,
  },
  {
    label: 'Gallery',
    to: '/student/gallery',
    icon: Camera,
  },
  {
    label: 'Logout',
    action: 'logout',
    icon: LogOut,
  },
]
