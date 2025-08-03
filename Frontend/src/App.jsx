import { Routes, Route } from 'react-router-dom'
import './App.css'

// Import pages and components
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import InterviewSelection from './pages/InterviewSelection'
import InterviewSession from './pages/InterviewSession'
import InterviewReport from './pages/InterviewReport'
import InterviewHistory from './pages/InterviewHistory'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import ForgotPassword from './components/auth/ForgotPassword'
import ResetPassword from './components/auth/ResetPassword'
import VerifyEmail from './components/auth/VerifyEmail'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/history" element={<InterviewHistory />} />
        <Route path="/interview/new" element={<InterviewSelection />} />
        <Route path="/interview/session" element={<InterviewSession />} />
        <Route path="/interview/report/:reportId" element={<InterviewReport />} />
        <Route path="*" element={
          <div className="p-4 text-center">
            <h1 className="text-4xl font-bold text-blue-600 mb-4">Page Not Found</h1>
            <p className="text-lg">The page you're looking for doesn't exist.</p>
          </div>
        } />
      </Routes>
    </div>
  )
}

export default App
