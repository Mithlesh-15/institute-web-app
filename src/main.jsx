import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import {
  Navigate,
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom'
import App from './App.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import StudentPortalShell from './components/student-portal/StudentPortalShell.jsx'
import TeacherDashboardShell from './components/teacher-dashboard/TeacherDashboardShell.jsx'
import TeacherDashboard from './pages/Dashboard/TeacherDashboard.jsx'
import Home from './pages/Home.jsx'
import StudentLogin from './pages/Login/StudentLogin.jsx'
import TeacherLogin from './pages/Login/TeacherLogin.jsx'
import TeacherAttendance from './pages/Teacher/TeacherAttendance.jsx'
import TeacherClasses from './pages/Teacher/TeacherClasses.jsx'
import TeacherClassDetails from './pages/Teacher/TeacherClassDetails.jsx'
import TeacherCompletedClasses from './pages/Teacher/TeacherCompletedClasses.jsx'
import TeacherCompletedClassDetails from './pages/Teacher/TeacherCompletedClassDetails.jsx'
import TeacherFees from './pages/Teacher/TeacherFees.jsx'
import TeacherLibrary from './pages/Teacher/TeacherLibrary.jsx'
import TeacherNotices from './pages/Teacher/TeacherNotices.jsx'
import TeacherResults from './pages/Teacher/TeacherResults.jsx'
import TeacherStudents from './pages/Teacher/TeacherStudents.jsx'
import TeacherGallery from './pages/Teacher/TeacherGallery.jsx'
import TeacherLive from './pages/Teacher/TeacherLive.jsx'
import StudentAttendance from './pages/Student/StudentAttendance.jsx'
import StudentClasses from './pages/Student/StudentClasses.jsx'
import StudentCompletedClasses from './pages/Student/StudentCompletedClasses.jsx'
import StudentCompletedClassDetails from './pages/Student/StudentCompletedClassDetails.jsx'
import StudentDashboard from './pages/Student/StudentDashboard.jsx'
import StudentFees from './pages/Student/StudentFees.jsx'
import StudentProfile from './pages/Student/StudentProfile.jsx'
import StudentSetup from './pages/Student/StudentSetup.jsx'
import StudentResults from './pages/Student/StudentResults.jsx'
import StudentLibrary from './pages/Student/StudentLibrary.jsx'
import StudentNotices from './pages/Student/StudentNotices.jsx'
import StudentGallery from './pages/Student/StudentGallery.jsx'
import StudentLive from './pages/Student/StudentLive.jsx'
import { registerServiceWorker } from './pwa/registerSW.js'

// Global listener to capture PWA install prompt before React loads
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    window.deferredPrompt = e
    window.dispatchEvent(new CustomEvent('pwa-prompt-ready'))
  })
}

registerServiceWorker()

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<Home />} />
      <Route path="login" element={<Navigate to="/login/student" replace />} />
      <Route path="login/student" element={<StudentLogin />} />
      <Route path="login/teacher" element={<TeacherLogin />} />
      <Route path="student/setup" element={<StudentSetup />} />

      <Route element={<ProtectedRoute allowedRole="student" />}>
        <Route path="student" element={<StudentPortalShell />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="classes" element={<StudentClasses />} />
          <Route path="completed-classes" element={<StudentCompletedClasses />} />
          <Route path="completed-classes/:id" element={<StudentCompletedClassDetails />} />
          <Route path="attendance" element={<StudentAttendance />} />
          <Route path="results" element={<StudentResults />} />
          <Route path="library" element={<StudentLibrary />} />
          <Route path="notices" element={<StudentNotices />} />
          <Route path="gallery" element={<StudentGallery />} />
          <Route path="fees" element={<StudentFees />} />
          <Route path="gallery" element={<StudentGallery />} />
          <Route path="live" element={<StudentLive />} />
        </Route>
      </Route>

      <Route path="teacher/setup" element={<Navigate to="/login/teacher" replace />} />

      <Route element={<ProtectedRoute allowedRole="teacher" requireVerified />}>
        <Route path="teacher" element={<TeacherDashboardShell />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="students" element={<TeacherStudents />} />
          <Route path="classes" element={<TeacherClasses />} />
          <Route path="classes/:id" element={<TeacherClassDetails />} />
          <Route path="completed-classes" element={<TeacherCompletedClasses />} />
          <Route path="completed-classes/:id" element={<TeacherCompletedClassDetails />} />
          <Route path="attendance" element={<TeacherAttendance />} />
          <Route path="fees" element={<TeacherFees />} />
          <Route path="results" element={<TeacherResults />} />
          <Route path="results/:testId" element={<TeacherResults />} />
          <Route path="library" element={<TeacherLibrary />} />
          <Route path="notices" element={<TeacherNotices />} />
          <Route path="gallery" element={<TeacherGallery />} />
          <Route path="live" element={<TeacherLive />} />
        </Route>
      </Route>

      {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
    </Route>,
  ),
)

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
