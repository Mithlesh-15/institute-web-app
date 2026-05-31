import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
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
import TeacherFees from './pages/Teacher/TeacherFees.jsx'
import TeacherLibrary from './pages/Teacher/TeacherLibrary.jsx'
import TeacherNotices from './pages/Teacher/TeacherNotices.jsx'
import TeacherResults from './pages/Teacher/TeacherResults.jsx'
import TeacherStudents from './pages/Teacher/TeacherStudents.jsx'
import StudentAttendance from './pages/Student/StudentAttendance.jsx'
import StudentClasses from './pages/Student/StudentClasses.jsx'
import StudentDashboard from './pages/Student/StudentDashboard.jsx'
import StudentFees from './pages/Student/StudentFees.jsx'
import StudentProfile from './pages/Student/StudentProfile.jsx'
import StudentSetup from './pages/Student/StudentSetup.jsx'
import { registerServiceWorker } from './pwa/registerSW.js'

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
          <Route path="attendance" element={<StudentAttendance />} />
          <Route path="fees" element={<StudentFees />} />
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
          <Route path="attendance" element={<TeacherAttendance />} />
          <Route path="fees" element={<TeacherFees />} />
          <Route path="results" element={<TeacherResults />} />
          <Route path="results/:testId" element={<TeacherResults />} />
          <Route path="library" element={<TeacherLibrary />} />
          <Route path="notices" element={<TeacherNotices />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>,
  ),
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
