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
import StudentDashboard from './pages/Dashboard/StudentDashboard.jsx'
import TeacherDashboard from './pages/Dashboard/TeacherDashboard.jsx'
import Home from './pages/Home.jsx'
import StudentLogin from './pages/Login/StudentLogin.jsx'
import TeacherLogin from './pages/Login/TeacherLogin.jsx'
import { registerServiceWorker } from './pwa/registerSW.js'

registerServiceWorker()

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<Home />} />
      <Route path="login" element={<Navigate to="/login/student" replace />} />
      <Route path="login/student" element={<StudentLogin />} />
      <Route path="login/teacher" element={<TeacherLogin />} />

      <Route element={<ProtectedRoute allowedRole="student" />}>
        <Route path="student/dashboard" element={<StudentDashboard />} />
      </Route>

      <Route path="teacher/setup" element={<Navigate to="/login/teacher" replace />} />

      <Route element={<ProtectedRoute allowedRole="teacher" requireVerified />}>
        <Route path="teacher/dashboard" element={<TeacherDashboard />} />
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
