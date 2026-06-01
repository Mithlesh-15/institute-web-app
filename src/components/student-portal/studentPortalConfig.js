import {
  CalendarCheck2,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  UserRound,
  Trophy,
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
    label: 'Test Results',
    to: '/student/results',
    icon: Trophy,
  },
  {
    label: 'Fees',
    to: '/student/fees',
    icon: CreditCard,
  },
  {
    label: 'Logout',
    action: 'logout',
    icon: LogOut,
  },
]
