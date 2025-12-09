import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'sonner'
import useAuthStore from './stores/authStore'
import AppLayout from './components/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Classes from './pages/Classes'
import ClassDetail from './pages/ClassDetail'
import Assignments from './pages/Assignments'
import AssignmentDetail from './pages/AssignmentDetail'
import Schedule from './pages/Schedule'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminClasses from './pages/AdminClasses'
import CreateAssignment from './pages/CreateAssignment'
import TakeQuiz from './pages/TakeQuiz'
import QuizResults from './pages/QuizResults'
import Problems from './pages/Problems'
import ProblemDetail from './pages/ProblemDetail'
import CreateProblem from './pages/CreateProblem'

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Admin route wrapper
function AdminRoute({ children }) {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}

export default function App() {
  return (
    <>
      <Toaster 
        position="top-right" 
        richColors 
        theme="dark"
        toastOptions={{
          style: {
            background: 'rgba(15, 17, 24, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          },
        }}
      />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="classes" element={<Classes />} />
            <Route path="classes/:classId" element={<ClassDetail />} />
            <Route path="classes/:classId/assignments/new" element={<CreateAssignment />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="assignments/:assignmentId" element={<AssignmentDetail />} />
            <Route path="quizzes/:quizId" element={<TakeQuiz />} />
            <Route path="quizzes/:quizId/results" element={<QuizResults />} />
            <Route path="problems" element={<Problems />} />
            <Route path="problems/create" element={<AdminRoute><CreateProblem /></AdminRoute>} />
            <Route path="problems/:problemId" element={<ProblemDetail />} />
            <Route path="problems/:problemId/edit" element={<AdminRoute><CreateProblem /></AdminRoute>} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="profile" element={<Profile />} />
            {/* Admin Routes */}
            <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="admin/classes" element={<AdminRoute><AdminClasses /></AdminRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  )
}
