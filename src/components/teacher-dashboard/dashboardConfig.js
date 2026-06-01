import {
  BookOpen,
  BookOpenText,
  CalendarCheck2,
  ClipboardList,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Users,
  Sparkles,
  Image,
  Video,
} from 'lucide-react'

export const sidebarItems = [
  {
    label: 'Dashboard',
    to: '/teacher/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Students',
    to: '/teacher/students',
    icon: Users,
  },
  {
    label: 'Classes',
    to: '/teacher/classes',
    icon: GraduationCap,
  },
  {
    label: 'Attendance',
    to: '/teacher/attendance',
    icon: CalendarCheck2,
  },
  {
    label: 'Fees',
    to: '/teacher/fees',
    icon: CreditCard,
  },
  {
    label: 'Results',
    to: '/teacher/results',
    icon: ClipboardList,
  },
  {
    label: 'Library',
    to: '/teacher/library',
    icon: BookOpenText,
  },
  {
    label: 'Notices',
    to: '/teacher/notices',
    icon: Megaphone,
  },
  {
    label: 'Gallery',
    to: '/teacher/gallery',
    icon: Image,
  },
  {
    label: 'Live',
    to: '/teacher/live',
    icon: Video,
  },
  {
    label: 'Logout',
    action: 'logout',
    icon: LogOut,
  },
]

export const overviewStats = [
  {
    label: 'Total Students',
    value: '248',
    detail: 'Across 8 active batches',
    trend: '+12%',
    trendType: 'up',
    icon: Users,
  },
  {
    label: 'Today Attendance',
    value: '94%',
    detail: '182 students marked present',
    trend: '+3%',
    trendType: 'up',
    icon: CalendarCheck2,
  },
  {
    label: 'Pending Fees',
    value: 'Rs. 42,800',
    detail: '12 payments awaiting clearance',
    trend: '-8%',
    trendType: 'down',
    icon: CreditCard,
  },
  {
    label: 'Upcoming Tests',
    value: '06',
    detail: 'Next 10 days',
    trend: '+2',
    trendType: 'up',
    icon: ClipboardList,
  },
]

export const quickActions = [
  {
    label: 'Classes',
    description: 'Manage live batches and schedules',
    to: '/teacher/classes',
    icon: GraduationCap,
  },
  {
    label: 'Students',
    description: 'View learner profiles and progress',
    to: '/teacher/students',
    icon: Users,
  },
  {
    label: 'Attendance',
    description: 'Mark daily presence in one tap',
    to: '/teacher/attendance',
    icon: CalendarCheck2,
  },
  {
    label: 'Fees',
    description: 'Track payments and reminders',
    to: '/teacher/fees',
    icon: CreditCard,
  },
  {
    label: 'Results',
    description: 'Publish marks and reports',
    to: '/teacher/results',
    icon: ClipboardList,
  },
  {
    label: 'Notices',
    description: 'Broadcast updates to families',
    to: '/teacher/notices',
    icon: Megaphone,
  },
  {
    label: 'Library',
    description: 'Share notes, PDFs, and links',
    to: '/teacher/library',
    icon: BookOpen,
  },
]

export const recentActivities = [
  {
    title: 'New student added',
    description: 'Aarav Sharma was added to Grade 10 - Science.',
    time: '12 min ago',
  },
  {
    title: 'Fee payment recorded',
    description: 'Rs. 3,500 received for Neha Verma.',
    time: '34 min ago',
  },
  {
    title: 'Homework uploaded',
    description: 'Algebra practice set shared with Class 8A.',
    time: '1 hr ago',
  },
  {
    title: 'Notice posted',
    description: 'Weekly timetable update pushed to all students.',
    time: '2 hr ago',
  },
]

export const upcomingEvents = [
  {
    title: 'Grade 10 Unit Test',
    description: 'Tomorrow at 9:00 AM',
    icon: Sparkles,
  },
  {
    title: 'Fee Due Reminder',
    description: 'Friday before 6:00 PM',
    icon: CreditCard,
  },
  {
    title: 'Homework Deadline',
    description: 'Tonight by 10:00 PM',
    icon: BookOpen,
  },
]

export const moduleDetails = {
  students: {
    eyebrow: 'Student management',
    title: 'Students',
    description:
      'Keep learner profiles organized, review performance, and manage student records in a clean workspace.',
    bullets: [
      'Add and update student profiles',
      'Track attendance, fees, and progress',
      'Sort learners by batch or subject',
    ],
    icon: Users,
    accent: 'from-[#2563eb] to-[#1d4ed8]',
    links: [
      { label: 'View dashboard', to: '/teacher/dashboard' },
      { label: 'Open attendance', to: '/teacher/attendance' },
    ],
  },
  classes: {
    eyebrow: 'Batch planning',
    title: 'Classes',
    description:
      'Plan batches, manage schedules, and keep every class flow smooth for the day.',
    bullets: [
      'Organize timetables by batch',
      'Track class status in real time',
      'Prepare session-wise updates',
    ],
    icon: GraduationCap,
    accent: 'from-[#2563eb] to-[#60a5fa]',
    links: [
      { label: 'View dashboard', to: '/teacher/dashboard' },
      { label: 'Open students', to: '/teacher/students' },
    ],
  },
  attendance: {
    eyebrow: 'Daily tracking',
    title: 'Attendance',
    description:
      'Mark attendance quickly and keep a clean record for every class and student.',
    bullets: [
      'Fast present/absent workflow',
      'Daily summary by batch',
      'Attendance history snapshot',
    ],
    icon: CalendarCheck2,
    accent: 'from-[#1d4ed8] to-[#2563eb]',
    links: [
      { label: 'View dashboard', to: '/teacher/dashboard' },
      { label: 'Open classes', to: '/teacher/classes' },
    ],
  },
  fees: {
    eyebrow: 'Payments',
    title: 'Fees',
    description:
      'Review pending balances, track receipts, and keep fee follow-ups under control.',
    bullets: [
      'Pending and cleared payments',
      'Fee reminders and due dates',
      'Batch-wise payment overview',
    ],
    icon: CreditCard,
    accent: 'from-[#2563eb] to-[#1d4ed8]',
    links: [
      { label: 'View dashboard', to: '/teacher/dashboard' },
      { label: 'Open students', to: '/teacher/students' },
    ],
  },
  results: {
    eyebrow: 'Performance',
    title: 'Results',
    description:
      'Publish marks, review assessments, and share report cards from one polished screen.',
    bullets: [
      'Assessment and score overview',
      'Report card publishing flow',
      'Exam-ready result summaries',
    ],
    icon: ClipboardList,
    accent: 'from-[#1d4ed8] to-[#2563eb]',
    links: [
      { label: 'View dashboard', to: '/teacher/dashboard' },
      { label: 'Open library', to: '/teacher/library' },
    ],
  },
  notices: {
    eyebrow: 'Communication',
    title: 'Notices',
    description:
      'Broadcast important updates, reminders, and schedule changes to students and parents.',
    bullets: [
      'Post urgent announcements',
      'Pin weekly timetable updates',
      'Keep families informed fast',
    ],
    icon: Megaphone,
    accent: 'from-[#2563eb] to-[#0f172a]',
    links: [
      { label: 'View dashboard', to: '/teacher/dashboard' },
      { label: 'Open students', to: '/teacher/students' },
    ],
  },
}
