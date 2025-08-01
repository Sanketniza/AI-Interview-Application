import { Routes, Route } from 'react-router-dom'
import './App.css'

// Import pages (we'll create these later)
// import Home from './pages/Home'
// import Login from './pages/Login'
// import Register from './pages/Register'
// import Dashboard from './pages/Dashboard'
// import Interview from './pages/Interview'
// import History from './pages/History'
// import NotFound from './pages/NotFound'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<div className="p-4 text-center">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">AI Interview</h1>
          <p className="text-lg">Welcome to AI Interview Application</p>
        </div>} />
        {/* Add these routes when components are created */}
        {/* <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/history" element={<History />} />
        <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </div>
  )
}

export default App
