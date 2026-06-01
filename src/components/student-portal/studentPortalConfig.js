import {
  CalendarCheck2,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  UserRound,
  Trophy,
  Library,
  Megaphone,
  Image,
  Video,
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
    label: 'E-Library',
    to: '/student/library',
    icon: Library,
  },
  {
    label: 'Notices',
    to: '/student/notices',
    icon: Megaphone,
  },
  {
    label: 'Gallery',
    to: '/student/gallery',
    icon: Image,
  },
  {
    label: 'Live Classes',
    to: '/student/live',
    icon: Video,
  },
  {
    label: 'Logout',
    action: 'logout',
    icon: LogOut,
  },
]
